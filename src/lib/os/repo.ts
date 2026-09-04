import { seed } from "@/data/seed";
import { AGENCY_ID, createAdminClient, isMissingTable } from "@/lib/supabase/admin";
import { pickOsState, type OsPayload } from "@/lib/os/payload";
import type { Locale, OsState } from "@/lib/types";

const STORAGE_BUCKET = "nawah";
const STORAGE_PATH = "workspace/os-state.json";

export type OsBackend = "postgres" | "storage";

function seeded(locale: Locale): OsPayload {
  return { locale, state: pickOsState(seed) };
}

async function saveSnapshot(
  locale: Locale,
  state: OsState,
): Promise<{ backend: OsBackend; error?: string }> {
  const admin = createAdminClient();
  const payload = { locale, state: pickOsState(state) };
  const agency = await admin.from("agencies").upsert({
    id: AGENCY_ID,
    name: "Masar Digital",
    locale,
  });
  if (!agency.error) {
    const snap = await admin.from("os_snapshots").upsert({
      agency_id: AGENCY_ID,
      locale,
      state: payload.state,
      updated_at: new Date().toISOString(),
    });
    if (!snap.error) return { backend: "postgres" };
    if (!isMissingTable(snap.error)) {
      return { backend: "postgres", error: snap.error.message };
    }
  } else if (!isMissingTable(agency.error)) {
    // continue to storage fallback
  }
  const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
  const up = await admin.storage
    .from(STORAGE_BUCKET)
    .upload(STORAGE_PATH, blob, { upsert: true, contentType: "application/json" });
  if (up.error) {
    return { backend: "storage", error: up.error.message };
  }
  return { backend: "storage" };
}

async function loadSnapshot(): Promise<
  (OsPayload & { backend: OsBackend }) | { backend: OsBackend; empty: true }
> {
  const admin = createAdminClient();
  const snap = await admin
    .from("os_snapshots")
    .select("locale,state")
    .eq("agency_id", AGENCY_ID)
    .maybeSingle();
  if (!snap.error && snap.data?.state) {
    return {
      backend: "postgres",
      locale: (snap.data.locale as Locale) ?? "ar",
      state: snap.data.state as OsState,
    };
  }
  if (snap.error && !isMissingTable(snap.error)) {
    throw new Error(snap.error.message);
  }
  const file = await admin.storage.from(STORAGE_BUCKET).download(STORAGE_PATH);
  if (file.data) {
    const json = JSON.parse(await file.data.text()) as OsPayload;
    return { backend: "storage", locale: json.locale ?? "ar", state: json.state };
  }
  return { backend: file.error && !String(file.error.message).includes("not found") ? "storage" : "storage", empty: true };
}

export async function readOs(): Promise<OsPayload & { backend: OsBackend }> {
  const loaded = await loadSnapshot();
  if ("empty" in loaded) {
    const fresh = seeded("en");
    await saveSnapshot(fresh.locale, fresh.state);
    return { ...fresh, backend: loaded.backend };
  }
  return loaded;
}

export async function writeOs(payload: OsPayload): Promise<{ backend: OsBackend }> {
  const result = await saveSnapshot(payload.locale, payload.state);
  if (result.error) throw new Error(result.error);
  return { backend: result.backend };
}

export async function resetOs(locale: Locale): Promise<OsPayload & { backend: OsBackend }> {
  const fresh = seeded(locale);
  const saved = await writeOs(fresh);
  return { ...fresh, backend: saved.backend };
}

export async function osStatus() {
  const admin = createAdminClient();
  const snap = await admin.from("os_snapshots").select("agency_id").limit(1);
  const postgres = !snap.error;
  const buckets = await admin.storage.listBuckets();
  const hasBucket = buckets.data?.some((b) => b.id === STORAGE_BUCKET) ?? false;
  return {
    projectUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    postgres,
    storage: hasBucket,
    tableError: snap.error?.message ?? null,
  };
}
