import { StaffMember, StaffRole, StaffStatus } from "../types";

// Re-export so existing component imports from this file keep working.
export type { StaffMember, StaffRole, StaffStatus };

export const staffMembers: StaffMember[] = [
  { id: 's1', initials: 'KB', name: 'Kwame Boateng',  email: 'k.boateng@korlebu.gov.gh', role: 'Administrator', status: 'active',    lastActive: 'Just now',   isCurrentUser: true },
  { id: 's2', initials: 'EA', name: 'Efua Asante',    email: 'e.asante@korlebu.gov.gh',  role: 'Physician',     status: 'active',    lastActive: '12m ago' },
  { id: 's3', initials: 'CO', name: 'Comfort Owusu',  email: 'c.owusu@korlebu.gov.gh',   role: 'Midwife',       status: 'active',    lastActive: '1h ago' },
  { id: 's4', initials: 'AM', name: 'Abena Mensah',   email: 'a.mensah@korlebu.gov.gh',  role: 'Midwife',       status: 'active',    lastActive: '3h ago' },
  { id: 's5', initials: 'JA', name: 'Joseph Adjei',   email: 'j.adjei@korlebu.gov.gh',   role: 'Coordinator',   status: 'invited',   lastActive: 'Invite sent' },
  { id: 's6', initials: 'GD', name: 'Grace Darko',    email: 'g.darko@korlebu.gov.gh',   role: 'Midwife',       status: 'suspended', lastActive: '8 May' },
];
