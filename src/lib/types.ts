export type Locale = "ar" | "en";

export type PipelineStage =
  | "new"
  | "contacted"
  | "qualified"
  | "discovery"
  | "brief"
  | "proposal"
  | "negotiation"
  | "won"
  | "lost"
  | "followup";

export type ProjectHealth = "healthy" | "at_risk" | "delayed" | "completed";
export type TaskStatus = "todo" | "doing" | "review" | "client" | "done";
export type QuoteStatus =
  | "draft"
  | "sent"
  | "viewed"
  | "accepted"
  | "rejected"
  | "changes";

export type AccessRole =
  | "owner"
  | "admin"
  | "sales"
  | "am"
  | "pm"
  | "team"
  | "finance"
  | "hr"
  | "freelancer"
  | "reviewer";

export type Employee = {
  id: string;
  name: string;
  nameAr: string;
  email?: string;
  phone?: string;
  role: string;
  roleAr: string;
  accessRole?: AccessRole;
  department: string;
  hourlyCost: number;
  billRate: number;
  skills: string[];
  weeklyHours: number;
  kind?: "staff" | "freelancer";
  salary?: number;
  managerId?: string;
  languages?: string[];
  status?: "active" | "inactive";
  /** Empty = use the role default. */
  modules?: string[];
};

export type Lead = {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  source: string;
  utm?: string;
  service: string;
  budget?: number;
  startDate?: string;
  ownerId: string;
  probability: number;
  value: number;
  lastContact?: string;
  nextStep?: string;
  notes?: string;
  stage: PipelineStage;
  winLossReason?: string;
  createdAt: string;
};

export type Client = {
  id: string;
  name: string;
  nameAr: string;
  industry: string;
  email: string;
  phone: string;
  taxId?: string;
  address?: string;
  health: number;
  satisfaction: number;
  risk?: string;
  portalEnabled: boolean;
  createdAt: string;
  accountManagerId?: string;
  upsell?: string;
};

export type Contact = {
  id: string;
  clientId: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  canApprove: boolean;
};

export type CatalogLine = {
  id: string;
  name: string;
  nameAr: string;
  hours: number;
  role: string;
  hourlyCost: number;
  sellPrice: number;
  revisions: number;
  days: number;
  minMargin: number;
  deliverables: string[];
};

export type ServiceCatalog = {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  items: CatalogLine[];
};

export type QuoteItem = {
  id: string;
  name: string;
  nameAr: string;
  qty: number;
  hours: number;
  role: string;
  hourlyCost: number;
  sellPrice: number;
  toolsCost: number;
  productionCost: number;
  freelancerCost: number;
  revisions: number;
};

export type Quote = {
  id: string;
  number: string;
  clientId?: string;
  leadId?: string;
  title: string;
  titleAr: string;
  summary: string;
  summaryAr: string;
  lang: Locale;
  status: QuoteStatus;
  items: QuoteItem[];
  discount: number;
  taxRate: number;
  depositPercent: number;
  paymentTerms: string;
  durationWeeks: number;
  assumptions: string;
  exclusions: string;
  revisionPolicy: string;
  expiry: string;
  openedAt?: string;
  viewSeconds?: number;
  createdAt: string;
  acceptedAt?: string;
};

export type Project = {
  id: string;
  clientId: string;
  quoteId?: string;
  name: string;
  nameAr: string;
  status: ProjectHealth;
  startDate: string;
  dueDate: string;
  expectedRevenue: number;
  expectedCost: number;
  expectedHours: number;
  spaceId?: string;
  retainerId?: string;
};

export type ChecklistItem = { id: string; text: string; done: boolean };

export type Task = {
  id: string;
  projectId: string;
  milestone: string;
  parentId?: string;
  title: string;
  titleAr: string;
  status: TaskStatus;
  priority: "low" | "med" | "high" | "urgent";
  assigneeId?: string;
  start?: string;
  due?: string;
  estimateHours: number;
  actualHours: number;
  billable: boolean;
  checklist: ChecklistItem[];
  revisionCount: number;
  approvalStatus:
    | "working"
    | "internal"
    | "client"
    | "approved"
    | "revision"
    | "delivered";
  tags?: string[];
  dependsOn?: string[];
};

export type Invoice = {
  id: string;
  number: string;
  clientId: string;
  projectId?: string;
  quoteId?: string;
  amount: number;
  status: "draft" | "sent" | "paid" | "overdue" | "partial";
  dueDate: string;
  paidAmount: number;
  issuedAt: string;
  note?: string;
};

export type Payment = {
  id: string;
  invoiceId: string;
  amount: number;
  date: string;
  method: string;
};

export type Expense = {
  id: string;
  projectId?: string;
  category: "tools" | "production" | "ads" | "freelancer" | "other";
  amount: number;
  date: string;
  note: string;
};

export type TimeEntry = {
  id: string;
  taskId: string;
  userId: string;
  hours: number;
  billable: boolean;
  date: string;
};

export type DocPage = {
  id: string;
  title: string;
  titleAr: string;
  parentId?: string;
  body: string;
  bodyAr: string;
  clientId?: string;
  projectId?: string;
  kind?: "wiki" | "sop" | "brief" | "template" | "form" | "database";
  columns?: string[];
  rows?: { id: string; values: Record<string, string> }[];
};

export type Ticket = {
  id: string;
  clientId: string;
  projectId?: string;
  title: string;
  titleAr: string;
  priority: "low" | "med" | "high";
  inScope: boolean;
  status: "open" | "doing" | "waiting" | "done";
};

export type Meeting = {
  id: string;
  title: string;
  titleAr: string;
  clientId?: string;
  projectId?: string;
  when: string;
  notes: string;
};

export type AlertItem = {
  id: string;
  title: string;
  titleAr: string;
  kind: "alert" | "info" | "success";
  href: string;
};

export type Contract = {
  id: string;
  quoteId: string;
  clientId: string;
  projectId?: string;
  status: "draft" | "ready" | "signed";
  startDate: string;
  endDate: string;
};

export type PortalInvite = {
  id: string;
  clientId: string;
  email: string;
  sentAt: string;
};

export type Discovery = {
  id: string;
  leadId: string;
  goal: string;
  problem: string;
  audience: string;
  competitors: string;
  services: string;
  deliverables: string;
  timeline: string;
  budget: string;
  decisionMakers: string;
  approval: string;
  platforms: string;
  kpis: string;
};

export type ChatMessage = {
  id: string;
  channelId: string;
  authorId: string;
  body: string;
  createdAt: string;
  internal: boolean;
};

export type FileAsset = {
  id: string;
  name: string;
  clientId?: string;
  projectId?: string;
  taskId?: string;
  kind: "file" | "design";
  version: number;
  status: "working" | "internal" | "client" | "approved";
  note?: string;
};

export type AutomationRule = {
  id: string;
  name: string;
  trigger: string;
  condition: string;
  action: string;
  enabled: boolean;
};

export type AutomationLog = {
  id: string;
  automationId: string;
  at: string;
  detail: string;
};

export type SaasSub = {
  id: string;
  name: string;
  plan: string;
  monthly: number;
  seats: number;
  used: number;
  renew: string;
  lastUsed: string;
  /** If set, this vendor is already covered by a Nawah module. */
  replacesHref?: string;
  replacesLabel?: string;
};

export type ReviewPin = {
  id: string;
  taskId: string;
  x: number;
  y: number;
  body: string;
  authorId: string;
  createdAt: string;
};

export type Space = {
  id: string;
  name: string;
  nameAr: string;
};

export type Retainer = {
  id: string;
  clientId: string;
  catalogId: string;
  name: string;
  monthlyHours: number;
  monthlyFee: number;
  consumedHours: number;
  renewalDate: string;
  status: "active" | "ending" | "paused";
};

export type LeaveRequest = {
  id: string;
  userId: string;
  type: "annual" | "sick" | "unpaid";
  start: string;
  end: string;
  days: number;
  status: "pending" | "approved" | "denied";
};

export type AttendanceDay = {
  id: string;
  userId: string;
  date: string;
  hours: number;
  status: "office" | "remote" | "leave";
};

export type PayrollLine = {
  id: string;
  userId: string;
  month: string;
  base: number;
  commission: number;
  total: number;
  status: "draft" | "paid";
};

export type BookingSlot = {
  id: string;
  ownerId: string;
  start: string;
  durationMin: number;
  bookedName?: string;
  clientId?: string;
  typeId?: string;
};

export type BookingType = {
  id: string;
  name: string;
  durationMin: number;
  hostId: string;
  description: string;
};

export type DocComment = {
  id: string;
  docId: string;
  authorId: string;
  body: string;
  createdAt: string;
};

export type Activity = {
  id: string;
  leadId?: string;
  clientId?: string;
  kind: "call" | "email" | "meeting" | "note";
  at: string;
  note: string;
};

export type AuditEvent = {
  id: string;
  at: string;
  actorId: string;
  action: string;
  detail: string;
};

export type Notice = {
  id: string;
  userId: string;
  fromId: string;
  title: string;
  body: string;
  href?: string;
  read: boolean;
  channel: "inapp" | "email" | "both";
  createdAt: string;
};

export type MailItem = {
  id: string;
  fromId: string;
  toId: string;
  subject: string;
  body: string;
  read: boolean;
  createdAt: string;
};

export type ChatRoom = {
  id: string;
  name: string;
  memberIds: string[];
  kind: "dm" | "group";
};

export type CommentEntity =
  | "task"
  | "project"
  | "client"
  | "lead"
  | "quote"
  | "file"
  | "invoice"
  | "doc"
  | "contract"
  | "retainer"
  | "employee"
  | "ticket";

export type EntityComment = {
  id: string;
  entity: CommentEntity;
  entityId: string;
  authorId: string;
  body: string;
  createdAt: string;
};

export type WorkspacePrefs = {
  currentUserId: string;
  hiddenNav: string[];
  hiddenHomeWidgets: string[];
  hiddenPageSections: Record<string, string[]>;
  editLayout: boolean;
};

export type OsState = {
  prefs: WorkspacePrefs;
  employees: Employee[];
  notices: Notice[];
  mail: MailItem[];
  chatRooms: ChatRoom[];
  entityComments: EntityComment[];
  leads: Lead[];
  clients: Client[];
  contacts: Contact[];
  catalog: ServiceCatalog[];
  quotes: Quote[];
  projects: Project[];
  tasks: Task[];
  invoices: Invoice[];
  payments: Payment[];
  expenses: Expense[];
  timeEntries: TimeEntry[];
  docs: DocPage[];
  tickets: Ticket[];
  meetings: Meeting[];
  alerts: AlertItem[];
  contracts: Contract[];
  portalInvites: PortalInvite[];
  discoveries: Discovery[];
  messages: ChatMessage[];
  files: FileAsset[];
  automations: AutomationRule[];
  automationLogs: AutomationLog[];
  subscriptions: SaasSub[];
  reviewPins: ReviewPin[];
  spaces: Space[];
  retainers: Retainer[];
  leaves: LeaveRequest[];
  attendance: AttendanceDay[];
  payroll: PayrollLine[];
  bookingSlots: BookingSlot[];
  bookingTypes: BookingType[];
  activities: Activity[];
  audit: AuditEvent[];
  docComments: DocComment[];
};
