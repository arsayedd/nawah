import { seed } from "@/data/seed";
import { AGENCY_ID, AGENCY_NAME } from "@/lib/brand";
import { createAdminClient, isMissingTable } from "@/lib/supabase/admin";
import { applyAutomations } from "@/lib/os/automations";
import { isSparseState, pickOsState, OS_SCHEMA, type OsPayload } from "@/lib/os/payload";
import type { Locale, OsState } from "@/lib/types";

const STORAGE_BUCKET = "nawah";
const STORAGE_PATH = "workspace/os-state.json";

export type OsBackend = "postgres" | "storage";

function seeded(locale: Locale): OsPayload {
  return { locale, state: applyAutomations(pickOsState(seed)), schemaVersion: OS_SCHEMA, revision: 1 };
}

async function saveSnapshot(
  locale: Locale,
  state: OsState,
  revision: number,
): Promise<{ backend: OsBackend; error?: string; revision: number }> {
  const admin = createAdminClient();
  const payload: OsPayload = {
    locale,
    state: pickOsState(state),
    schemaVersion: OS_SCHEMA,
    revision,
  };
  const agency = await admin.from("agencies").upsert({
    id: AGENCY_ID,
    name: AGENCY_NAME,
    locale,
  });
  if (!agency.error) {
    const snap = await admin.from("os_snapshots").upsert({
      agency_id: AGENCY_ID,
      locale,
      state: { ...payload.state, _revision: revision, _schemaVersion: OS_SCHEMA },
      updated_at: new Date().toISOString(),
    });
    if (!snap.error) return { backend: "postgres", revision };
    if (!isMissingTable(snap.error)) {
      return { backend: "postgres", error: snap.error.message, revision };
    }
  } else if (!isMissingTable(agency.error)) {
    // continue to storage fallback
  }
  const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
  const up = await admin.storage
    .from(STORAGE_BUCKET)
    .upload(STORAGE_PATH, blob, { upsert: true, contentType: "application/json" });
  if (up.error) {
    return { backend: "storage", error: up.error.message, revision };
  }
  return { backend: "storage", revision };
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
    const raw = snap.data.state as OsState & { _revision?: number; _schemaVersion?: number };
    return {
      backend: "postgres",
      locale: (snap.data.locale as Locale) ?? "ar",
      state: raw,
      revision: typeof raw._revision === "number" ? raw._revision : 1,
      schemaVersion: raw._schemaVersion ?? OS_SCHEMA,
    };
  }
  if (snap.error && !isMissingTable(snap.error)) {
    throw new Error(snap.error.message);
  }
  const file = await admin.storage.from(STORAGE_BUCKET).download(STORAGE_PATH);
  if (file.data) {
    const json = JSON.parse(await file.data.text()) as OsPayload;
    return {
      backend: "storage",
      locale: json.locale ?? "ar",
      state: json.state,
      revision: json.revision ?? 1,
      schemaVersion: json.schemaVersion ?? OS_SCHEMA,
    };
  }
  return { backend: file.error && !String(file.error.message).includes("not found") ? "storage" : "storage", empty: true };
}

export async function readOs(): Promise<OsPayload & { backend: OsBackend }> {
  try {
    const loaded = await Promise.race([
      loadSnapshot(),
      new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("os-timeout")), 6000);
      }),
    ]);
    if ("empty" in loaded) {
      const fresh = seeded("en");
      await saveSnapshot(fresh.locale, fresh.state, fresh.revision ?? 1);
      return { ...fresh, backend: loaded.backend };
    }
    const merged = pickOsState(loaded.state);
    const revision = loaded.revision ?? 1;
    if (isSparseState(loaded.state)) {
      await saveSnapshot("en", merged, revision);
    }
    return {
      backend: loaded.backend,
      locale: loaded.locale,
      state: merged,
      schemaVersion: OS_SCHEMA,
      revision,
    };
  } catch {
    const fresh = seeded("en");
    return { ...fresh, backend: "storage" };
  }
}

export async function writeOs(
  payload: OsPayload,
  opts?: { expectedRevision?: number },
): Promise<{ backend: OsBackend; revision: number; conflict?: boolean; state?: OsState }> {
  const current = await readOs();
  const currentRev = current.revision ?? 1;
  if (opts?.expectedRevision != null && opts.expectedRevision !== currentRev) {
    return { backend: current.backend, revision: currentRev, conflict: true, state: current.state };
  }
  const nextRev = currentRev + 1;
  const ticked = applyAutomations(pickOsState(payload.state));
  const result = await saveSnapshot(payload.locale, ticked, nextRev);
  if (result.error) throw new Error(result.error);
  return { backend: result.backend, revision: nextRev };
}

export async function resetOs(locale: Locale): Promise<OsPayload & { backend: OsBackend }> {
  const fresh = seeded(locale);
  const result = await saveSnapshot(fresh.locale, fresh.state, 1);
  if (result.error) throw new Error(result.error);
  return { ...fresh, backend: result.backend, revision: 1 };
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
