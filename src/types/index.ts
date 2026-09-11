export type Severity = 'crisis' | 'elevated' | 'monitor' | 'routine' | 'inactive';

// Whether the current escalation rung's clinician SMS page was delivered.
// Only "blocked" (an open L4 whose page was never delivered) surfaces in the UI.
export type PageStatus = 'paged' | 'blocked' | 'pending' | 'not_applicable';

export type CallStatus = 'completed' | 'in_progress' | 'upcoming' | 'missed';

export type DeliveryType = 'vaginal' | 'caesarean';
export type ConsentStatus = 'active' | 'withdrawn' | 'pending';

export interface EmergencyContact {
  name: string;
  phone: string;        // E.164, e.g. "+233564357975"
  relationship: string; // free-text label (never the literal "other")
}

export interface CheckIn {
  id: string;
  date: string;          // "03 Jun"
  day: number;           // day postpartum
  summary: string;       // one sentence summary
  severity: Severity;
  transcript?: string;   // transcript text if available
}

export interface Mother {
  id: string;
  name: string;
  phone: string;
  hospital: string;
  midwife: string;
  severity: Severity;
  consentStatus: ConsentStatus;
  consentRecording?: boolean;
  lastInteraction: string;
  note: string;
  currentFlag?: string;
  nextCallAt?: string; // ISO datetime of the soonest upcoming scheduled call
  checkIns: CheckIn[];
  // discharge info
  deliveryType: DeliveryType;
  deliveryDate?: string;
  dischargeDate: string;
  dayPostpartum: number;
  // clinical
  dateOfBirth?: string;
  gravida?: number;
  para?: number;
  language?: string;
  medications?: string[];
  risks?: string[];
  preferredCallWindow?: "morning" | "afternoon" | "evening" | "inbound";
  // 1–3 emergency contacts (index 0 = primary). Empty for older records.
  emergencyContacts?: EmergencyContact[];
  // DEPRECATED singular mirrors of emergencyContacts[0] — fallback for old data.
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  // Derived WhatsApp-call state (detail endpoint only). Everything is computed
  // server-side — render it, never re-derive cooldowns/expiry client-side.
  whatsappCall?: WhatsAppCallInfo;
}

export interface WhatsAppCallInfo {
  // Whether triggering a call with route="whatsapp" would pass the permission
  // gate right now (mother active + unexpired Meta grant).
  available: boolean;
  permissionStatus?: "requested" | "granted" | "denied" | "expired" | "revoked" | string;
  permissionExpiresAt?: string;
  canRequestPermission: boolean;
  canRequestReason?: string;
}

export interface CallTranscriptRow {
  speaker: 'omaya' | 'mother';
  text: string;
}

export interface Call {
  id: string;
  motherId: string;
  motherName: string;
  callType: string;
  status: CallStatus;
  scheduledAt: string;
  durationSeconds?: number;
  dayInCare?: number;
  deliveryType?: string;
  flagsRaised?: number;
  severity?: Severity;
  summary?: string;
  transcript?: CallTranscriptRow[];
  audioUrl?: string;
  // 'whatsapp' is the TEXT channel (an episode); 'whatsapp_call' is a real
  // voice conversation over WhatsApp — same call pipeline, different transport.
  channel?: "voice" | "whatsapp" | "whatsapp_call";
}

export interface EscalationItem {
  id: string;
  // Originating call — stable across the provisional→real-alert transition, so
  // the chime keys on this (not `id`, which changes when a provisional reconciles).
  callId: string;
  motherName: string;
  dayPostpartum: number;
  severity: Severity;
  timeLeftMinutes: number;
  createdAt: string;
  // Delivery state of the on-call clinician's SMS page for this escalation.
  pageStatus: PageStatus;
}

export type StaffRole = string;

export type StaffStatus = "active" | "invited" | "suspended";

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
  status: StaffStatus;
  lastActiveAt: string | null;
  isCurrentUser?: boolean;
}

export interface Me {
  id: string;
  name: string;
  email: string;
  role: string;
  hospitalId: string;
  hospitalName: string;
  mustChangePassword: boolean;
  permissions: RolePermissions;
  // OMA-341 — mother-facing intro card fields, meaningful only for an
  // expert-roster account (null otherwise).
  bio: string | null;
  yearsOfExperience: number | null;
  // Portal-visible only — not shown on the mother-facing card.
  languages: string[];
  // Shown on the consent card alongside category.
  specialty: string | null;
}

export interface RolePermissions {
  view_mothers: boolean;
  message_mothers: boolean;
  escalate: boolean;
  create_discharges: boolean;
  manage_staff: boolean;
}

export interface Role {
  id: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  permissions: RolePermissions;
}

// OMA-341 — expert requests (bloom-backend app/routers/expert_requests.py).
export type ExpertCategory =
  | "psychologist"
  | "lactation_consultant"
  | "postpartum_wellness_expert"
  | "other";

export type ExpertRequestStatus = "new" | "assigned" | "active" | "completed" | "cancelled";

export interface ExpertThreadMessage {
  id: string;
  speaker: "mother" | "expert";
  textBody: string;
  createdAt: string;
}

export type ExpertRating = "good" | "okay" | "not_helpful";

export interface ExpertRequestItem {
  id: string;
  category: ExpertCategory;
  questionText: string;
  // Consent-gated (OMA-341): the API omits these (null) unless she picked
  // "share my name too" on the combined consent card — not a client-side
  // choice, the backend simply doesn't send them otherwise.
  motherName: string | null;
  carePhase: string | null;
  language: string | null;
  status: ExpertRequestStatus;
  requestedAt: string;
  respondedAt: string | null;
  reported: boolean;
  rating: ExpertRating | null;
  // Sorts to the front of the queue — set only by the self-harm auto-queue
  // path today, never by a mother's ordinary request.
  urgent: boolean;
}

export interface MyExpertRequestItem extends ExpertRequestItem {
  messageCount: number;
  lastMessage: ExpertThreadMessage | null;
}
