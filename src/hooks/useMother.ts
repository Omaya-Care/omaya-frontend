import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

export interface CheckIn {
  id: string;
  date: string;
  day: number | null;
  summary: string;
  severity: string;
}

/** Derived server-side — render, never compute (see backend WhatsAppCallInfo). */
export interface WhatsAppCallInfo {
  available: boolean;
  permissionStatus?: string;
  permissionExpiresAt?: string;
  canRequestPermission: boolean;
  canRequestReason?: string;
}

export interface MotherProfile {
  id: string;
  name: string;
  phone: string;
  hospital: string;
  severity: string;
  consentStatus: string;
  dayPostpartum: number | null;
  lastInteraction: string;
  currentFlag: string;
  nextCallAt: string;
  dateOfBirth: string;
  language: string;
  preferredCallWindow: string;
  deliveryType: string;
  deliveryDate: string;
  dischargeDate: string;
  gravida: number | null;
  para: number | null;
  risks: string[];
  medications: string[];
  emergencyContacts: EmergencyContact[];
  checkIns: CheckIn[];
  whatsappCall: WhatsAppCallInfo | null;
}

const str = (v: unknown) => (typeof v === "string" ? v : "");
const num = (v: unknown) => (typeof v === "number" ? v : null);

function toWhatsAppCallInfo(raw: unknown): WhatsAppCallInfo | null {
  if (!raw || typeof raw !== "object") return null;
  const wc = raw as Record<string, unknown>;
  return {
    available: Boolean(wc.available),
    permissionStatus: str(wc.permission_status) || undefined,
    permissionExpiresAt: str(wc.permission_expires_at) || undefined,
    canRequestPermission: Boolean(wc.can_request_permission),
    canRequestReason: str(wc.can_request_reason) || undefined,
  };
}

function toProfile(r: Record<string, unknown>): MotherProfile {
  const contacts = ((r.emergency_contacts as Record<string, unknown>[]) ?? []).map((c) => ({
    name: str(c.name),
    phone: str(c.phone),
    relationship: str(c.relationship),
  }));
  // Records saved before the contacts array existed only carry the single fields.
  if (contacts.length === 0 && r.emergency_contact_name) {
    contacts.push({
      name: str(r.emergency_contact_name),
      phone: str(r.emergency_contact_phone),
      relationship: str(r.emergency_contact_relationship),
    });
  }
  return {
    id: str(r.id),
    name: str(r.name),
    phone: str(r.phone),
    hospital: str(r.hospital),
    severity: str(r.severity),
    consentStatus: str(r.consent_status),
    dayPostpartum: num(r.day_postpartum),
    lastInteraction: str(r.last_interaction),
    currentFlag: str(r.current_flag),
    nextCallAt: str(r.next_call_at),
    dateOfBirth: str(r.date_of_birth),
    language: str(r.language),
    preferredCallWindow: str(r.preferred_call_window),
    deliveryType: str(r.delivery_type),
    deliveryDate: str(r.delivery_date),
    dischargeDate: str(r.discharge_date),
    gravida: num(r.gravida),
    para: num(r.para),
    risks: (r.risks as string[]) ?? [],
    medications: (r.medications as string[]) ?? [],
    emergencyContacts: contacts,
    checkIns: ((r.check_ins as Record<string, unknown>[]) ?? []).map((c) => ({
      id: str(c.id),
      date: str(c.date),
      day: num(c.day),
      summary: str(c.summary),
      severity: str(c.severity),
    })),
    whatsappCall: toWhatsAppCallInfo(r.whatsapp_call),
  };
}

/** GET /mothers/{id} — full profile + check-in history. `null` id = nothing selected. */
export function useMother(id: string | null) {
  const [state, setState] = useState<{ id: string; data: MotherProfile | null } | null>(null);
  const [version, setVersion] = useState(0);
  // Re-read in place: the current profile stays on screen until the new one lands.
  const reload = useCallback(() => setVersion((v) => v + 1), []);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    api
      .get(`/mothers/${id}`)
      .then((res) => toProfile(res.data as Record<string, unknown>))
      .catch(() => null)
      .then((data) => {
        if (!cancelled) setState({ id, data });
      });
    return () => {
      cancelled = true;
    };
  }, [id, version]);

  const current = state && state.id === id ? state : null;
  return {
    data: current?.data ?? null,
    loading: !!id && current === null,
    failed: !!current && !current.data,
    reload,
  };
}
