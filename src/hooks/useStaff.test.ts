import { describe, expect, it } from "vitest";
import type { Role } from "./useRoles";
import { assignableRoles, creatableRoles } from "./useStaff";

const perms = {
  view_mothers: false,
  message_mothers: false,
  escalate: false,
  create_discharges: false,
  manage_staff: false,
};
const role = (name: string, isSystem = true): Role => ({
  id: name,
  name,
  description: null,
  isSystem,
  permissions: perms,
});

// A real hospital's GET /admin/roles after backend migration 0093, plus a
// custom role and the retired names a stale backend would still send.
const hospitalRoles = [
  role("Receptionist"),
  role("Administrator"),
  role("Midwife"),
  role("Doctor"),
  role("Night Desk", false),
  role("Physician"),
  role("Coordinator"),
  role("Paediatrician"),
];

const names = (roles: Role[]) => roles.map((r) => r.name);

describe("staff pickers", () => {
  it("Edit Staff offers the four hospital roles, never retired or custom ones", () => {
    expect(names(assignableRoles(hospitalRoles))).toEqual([
      "Receptionist",
      "Administrator",
      "Midwife",
      "Doctor",
    ]);
  });

  it("Add Staff offers the same minus Administrator", () => {
    expect(names(creatableRoles(hospitalRoles))).toEqual(["Receptionist", "Midwife", "Doctor"]);
  });
});
