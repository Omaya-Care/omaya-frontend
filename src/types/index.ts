export type Severity = 'crisis' | 'elevated' | 'monitor' | 'routine' | 'inactive';

export type CallStatus = 'completed' | 'in_progress' | 'upcoming' | 'missed';

export type DeliveryType = 'vaginal' | 'caesarean';
export type ConsentStatus = 'active' | 'withdrawn' | 'pending';

export interface CheckIn {
  id: string;
  date: string;          // "03 Jun"
  day: number;           // day postpartum
  summary: string;       // one sentence summary
  severity: Severity;
}

export interface Mother {
  id: string;
  name: string;
  dayPostpartum: number;
  severity: Severity;
  midwife: string;
  phone: string;
  hospital: string;
  dischargeDate: string;
  deliveryType: DeliveryType;
  consentStatus: ConsentStatus;
  lastInteraction: string;     // e.g. "Day 3 call · 2h ago"
  note: string;                // short status note shown in list
  checkIns: CheckIn[];
  currentFlag?: string;        // the AI-generated flag text
}

export interface CallSummaryRow {
  speaker: 'omaya' | 'mother';
  text: string;
}

export interface Call {
  duration?: string;
  deliveryType?: string;
  dayInCare?: number;
  severity?: Severity;
  summaryRows?: CallSummaryRow[];
  flagsRaised?: number;
...

  time: string;
  motherId: string;
  motherName: string;
  callType: string;
  status: CallStatus;
}

export interface EscalationItem {
  id: string;
  motherName: string;
  dayPostpartum: number;
  severity: Severity;
  timeLeftMinutes: number;
}
