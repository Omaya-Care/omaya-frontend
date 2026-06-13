# Omaya Portal — Missing API Endpoints

All endpoints require `Authorization: Bearer <jwt>` unless stated otherwise.
All dates are ISO-8601 UTC. All IDs are UUIDs.

---

## 1. Auth

### `POST /auth/sign-in`
> In spec, not yet wired in the portal.

**Request**
```json
{
  "email": "k.boateng@korlebu.gov.gh",
  "password": "string"
}
```

**Response 200**
```json
{
  "token": "eyJ...",
  "token_type": "bearer",
  "expires_in": 28800,
  "must_change_password": false,
  "clinician": {
    "id": "uuid",
    "name": "Kwame Boateng",
    "email": "k.boateng@korlebu.gov.gh",
    "role": "Administrator",
    "hospital_id": "uuid",
    "hospital_name": "Korle Bu Teaching Hospital"
  }
}
```

**Errors:** `401 invalid_credentials`, `403 account_suspended`, `423 account_locked`, `429 too_many_requests`

---

### `POST /auth/change-password`
> In spec, not yet wired in the portal.

**Request**
```json
{
  "current_password": "string",
  "new_password": "string"
}
```

**Response 200**
```json
{
  "token": "eyJ...",
  "token_type": "bearer",
  "expires_in": 28800
}
```

**Errors:** `400 weak_password`, `401 invalid_credentials`

---

## 2. Mothers

### `GET /mothers`
List all mothers for the signed-in clinician's hospital.

**Query params**

| Param | Type | Description |
|---|---|---|
| `severity` | `crisis\|elevated\|monitor\|routine\|inactive` | Filter by severity |
| `consent_status` | `active\|withdrawn\|pending` | Filter by consent |
| `search` | string | Name or phone number (min 2 chars) |
| `sort` | `most_urgent\|newest\|name` | Default: `most_urgent` |

**Response 200**
```json
{
  "mothers": [
    {
      "id": "uuid",
      "name": "Ama Mensah",
      "phone": "+233241234567",
      "day_postpartum": 7,
      "severity": "crisis",
      "midwife": "K. Boateng",
      "hospital": "Korle Bu Teaching Hospital",
      "discharge_date": "2026-06-02T00:00:00Z",
      "delivery_type": "caesarean",
      "consent_status": "active",
      "last_interaction": "Day 5 check-in · 2 days ago",
      "note": "Missed scheduled check-in",
      "current_flag": "Has not responded to two consecutive calls."
    }
  ]
}
```

---

### `GET /mothers/{mother_id}`
Single mother profile with full check-in history.

**Response 200**
```json
{
  "id": "uuid",
  "name": "Ama Mensah",
  "phone": "+233241234567",
  "date_of_birth": "1995-03-14T00:00:00Z",
  "day_postpartum": 7,
  "severity": "crisis",
  "midwife": "K. Boateng",
  "hospital": "Korle Bu Teaching Hospital",
  "discharge_date": "2026-06-02T00:00:00Z",
  "delivery_date": "2026-06-01T00:00:00Z",
  "delivery_type": "caesarean",
  "consent_status": "active",
  "consent_recording": true,
  "last_interaction": "Day 5 check-in · 2 days ago",
  "note": "Missed scheduled check-in",
  "current_flag": "Has not responded to two consecutive calls.",
  "language": "twi",
  "risks": ["prior_csection", "hypertension"],
  "medications": ["pain_relief", "wound_care"],
  "gravida": 2,
  "para": 1,
  "check_ins": [
    {
      "id": "uuid",
      "date": "2026-06-07T09:00:00Z",
      "day": 5,
      "summary": "Flagged severe pain and breastfeeding difficulties.",
      "severity": "crisis"
    }
  ]
}
```

**Errors:** `404 not_found`

---

### `GET /mothers/search`
Search for antenatally enrolled mothers by name or phone. Used in the New Discharge flow.

**Query params**

| Param | Type | Description |
|---|---|---|
| `q` | string (required, min 2) | Name or phone number |

**Response 200**
```json
{
  "results": [
    {
      "id": "uuid",
      "name": "Abena Frimpong",
      "phone": "+233241234567",
      "edd": "2026-06-12T00:00:00Z",
      "enrolled": true
    }
  ]
}
```

---

### `POST /mothers`
Antenatal enrollment — from the **Add Mother** flow (4 steps: intro → her details → clinical background → consent).

**Request**
```json
{
  "full_name": "Ama Mensah",
  "phone": "+233241234567",
  "date_of_birth": "1995-03-14",
  "edd": "2026-09-10",
  "gravida": 2,
  "para": 1,
  "language": "twi",
  "risks": ["hypertension", "prior_csection"],
  "consent_calls": true,
  "consent_recording": false
}
```

**Valid `risks` values**
`prior_csection`, `hypertension`, `diabetes`, `multiple`, `sickle_cell`, `prior_loss`, `hiv_pmtct`

**Valid `language` values**
`english`, `twi`, `ga`, `ewe`, `dagbani`

**Response 201**
```json
{
  "mother_id": "uuid",
  "name": "Ama Mensah",
  "status": "enrolled",
  "first_call_scheduled": null
}
```

**Errors:** `409 phone_already_enrolled`, `422 validation`

---

### `POST /mothers/{mother_id}/discharge`
Records a discharge for a mother — from the **New Discharge** flow (4 steps: find record → delivery details → baby outcome → medications → confirm).

Can be called on an existing mother found via search, or omit `mother_id` and include a `mother` object in the body for mothers who were not antenatally enrolled (backend to decide pattern).

**Request**
```json
{
  "delivery_date": "2026-06-01",
  "discharge_date": "2026-06-02",
  "delivery_type": "caesarean",
  "outcome": "well",
  "medications": ["pain_relief", "wound_care"]
}
```

**Valid `delivery_type` values:** `vaginal`, `caesarean`

**Valid `outcome` values:** `well`, `loss`

**Valid `medications` values:** `pain_relief`, `antibiotics`, `iron_folic`, `wound_care`, `none`

**Response 201**
```json
{
  "mother_id": "uuid",
  "discharge_id": "uuid",
  "first_call_scheduled_at": "2026-06-03T08:00:00Z",
  "automated_calls_enabled": true
}
```

> If `outcome = "loss"`, set `automated_calls_enabled: false` and do not schedule any calls.

**Errors:** `404 mother_not_found`, `409 already_discharged`, `422 validation`

---

## 3. Alerts

### `GET /alerts`
List escalation alerts for the hospital. Used in the dashboard "Needs attention now" panel — polled every 60 seconds.

**Query params**

| Param | Type | Description |
|---|---|---|
| `status` | `open\|acknowledged\|resolved` | Default: `open` |

**Response 200**
```json
{
  "alerts": [
    {
      "id": "uuid",
      "mother_id": "uuid",
      "mother_name": "Ama Serwaa",
      "day_postpartum": 6,
      "severity": "crisis",
      "created_at": "2026-06-11T07:30:00Z",
      "sla_deadline_at": "2026-06-11T09:30:00Z",
      "time_left_minutes": 42,
      "status": "open"
    }
  ]
}
```

---

## 4. Calls

### `GET /calls`
List calls for the hospital. Used in the dashboard "Today's calls" panel and the Calls page.

**Query params**

| Param | Type | Description |
|---|---|---|
| `date` | `YYYY-MM-DD` | Default: today |
| `status` | `completed\|in_progress\|upcoming\|missed` | Filter by status |
| `mother_id` | uuid | Filter to one mother |

**Response 200**
```json
{
  "calls": [
    {
      "id": "uuid",
      "mother_id": "uuid",
      "mother_name": "Abena Mansa",
      "scheduled_at": "2026-06-11T09:00:00Z",
      "call_type": "Day 2 check-in",
      "status": "completed",
      "duration_seconds": 272,
      "delivery_type": "vaginal",
      "day_in_care": 2,
      "severity": "routine",
      "flags_raised": 0,
      "transcript": [
        { "speaker": "omaya", "text": "How are you feeling since leaving the hospital?" },
        { "speaker": "mother", "text": "I am doing well. A little tired but managing." }
      ]
    }
  ]
}
```

---

## 5. Staff

### `GET /admin/clinicians`
List all clinicians at the hospital.

**Response 200**
```json
{
  "clinicians": [
    {
      "id": "uuid",
      "name": "Kwame Boateng",
      "email": "k.boateng@korlebu.gov.gh",
      "role": "Administrator",
      "status": "active",
      "last_active_at": "2026-06-11T11:00:00Z",
      "is_current_user": true
    }
  ]
}
```

---

### `PATCH /admin/clinicians/{clinician_id}`
Edit a staff member — change their role, name, or suspend/reactivate them.

**Request** *(all fields optional)*
```json
{
  "name": "Kwame Boateng",
  "role": "Midwife",
  "status": "suspended"
}
```

**Response 200**
```json
{
  "id": "uuid",
  "name": "Kwame Boateng",
  "role": "Midwife",
  "status": "suspended"
}
```

**Errors:** `403 cannot_edit_own_role`, `403 insufficient_role`, `404 not_found`

---

### `DELETE /admin/clinicians/{clinician_id}`
Remove a clinician seat entirely.

**Response 204** *(no body)*

**Errors:** `403 cannot_delete_self`, `404 not_found`

---

## 6. Roles & Permissions

### `GET /admin/roles`
Get all roles and their permission matrix. Used to populate the Permissions Matrix on the Staff page.

**Response 200**
```json
{
  "roles": [
    {
      "id": "uuid",
      "name": "Midwife",
      "description": "Frontline care staff",
      "is_system": true,
      "permissions": {
        "view_mothers": true,
        "message_mothers": true,
        "escalate": true,
        "create_discharges": true,
        "manage_staff": false
      }
    }
  ]
}
```

> `is_system: true` roles (Administrator, Physician, Midwife, Coordinator, Paediatrician, Psychologist) cannot be deleted or renamed.

---

### `POST /admin/roles`
Create a custom role. From the **Add role** modal on the Staff page.

**Request**
```json
{
  "name": "Lactation Consultant",
  "description": "Supports breastfeeding follow-up",
  "permissions": {
    "view_mothers": true,
    "message_mothers": true,
    "escalate": false,
    "create_discharges": false,
    "manage_staff": false
  }
}
```

**Response 201**
```json
{
  "id": "uuid",
  "name": "Lactation Consultant",
  "description": "Supports breastfeeding follow-up",
  "is_system": false,
  "permissions": {
    "view_mothers": true,
    "message_mothers": true,
    "escalate": false,
    "create_discharges": false,
    "manage_staff": false
  }
}
```

**Errors:** `409 role_name_taken`

---

### `PATCH /admin/roles/{role_id}`
Update a role's permissions or description. Triggered when the admin clicks **Edit** in the Permissions Matrix and toggles checkboxes.

**Request** *(all fields optional)*
```json
{
  "description": "Updated description",
  "permissions": {
    "view_mothers": true,
    "message_mothers": false,
    "escalate": true,
    "create_discharges": true,
    "manage_staff": false
  }
}
```

**Response 200**
```json
{
  "id": "uuid",
  "name": "Midwife",
  "description": "Updated description",
  "permissions": {
    "view_mothers": true,
    "message_mothers": false,
    "escalate": true,
    "create_discharges": true,
    "manage_staff": false
  }
}
```

**Errors:** `403 cannot_rename_system_role`, `404 not_found`

---

### `DELETE /admin/roles/{role_id}`
Delete a custom role. Not allowed on system roles or roles still assigned to clinicians.

**Response 204** *(no body)*

**Errors:** `403 cannot_delete_system_role`, `409 role_in_use`, `404 not_found`

---

## Summary

| # | Method | Path | Status |
|---|---|---|---|
| 1 | `POST` | `/auth/sign-in` | Spec exists — portal not wired |
| 2 | `POST` | `/auth/change-password` | Spec exists — portal not wired |
| 3 | `GET` | `/mothers` | Missing from spec |
| 4 | `GET` | `/mothers/search` | Missing from spec |
| 5 | `GET` | `/mothers/{mother_id}` | Missing from spec |
| 6 | `POST` | `/mothers` | Missing from spec |
| 7 | `POST` | `/mothers/{mother_id}/discharge` | Missing from spec |
| 8 | `GET` | `/alerts` | Missing from spec |
| 9 | `GET` | `/calls` | Missing from spec |
| 10 | `GET` | `/admin/clinicians` | Missing from spec |
| 11 | `PATCH` | `/admin/clinicians/{clinician_id}` | Missing from spec |
| 12 | `DELETE` | `/admin/clinicians/{clinician_id}` | Missing from spec |
| 13 | `GET` | `/admin/roles` | Missing from spec |
| 14 | `POST` | `/admin/roles` | Missing from spec |
| 15 | `PATCH` | `/admin/roles/{role_id}` | Missing from spec |
| 16 | `DELETE` | `/admin/roles/{role_id}` | Missing from spec |

---

## Notes for the backend developer

- All list endpoints must be scoped to the JWT's `hospital_id` via Postgres RLS — the same pattern used by existing endpoints.
- Severity values are always one of: `crisis`, `elevated`, `monitor`, `routine`, `inactive`.
- The portal polls `GET /alerts` every 60 seconds — keep this endpoint fast (index on `hospital_id + status`).
- `GET /mothers/search` must be defined before `GET /mothers/{mother_id}` in the router to avoid route conflicts.
