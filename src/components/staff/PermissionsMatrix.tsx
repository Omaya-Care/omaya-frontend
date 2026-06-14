import { useState } from 'react';
import { Check } from 'lucide-react';
import { Button } from '../ui/Button';

type RoleKey = 'Administrator' | 'Physician' | 'Midwife' | 'Coordinator';
type PermissionKey = 'view_mothers' | 'message_mothers' | 'escalate' | 'create_discharges' | 'manage_staff';

const ROLES: RoleKey[] = ['Administrator', 'Physician', 'Midwife', 'Coordinator'];

const PERMISSIONS: Array<{ key: PermissionKey; label: string }> = [
  { key: 'view_mothers',      label: 'View mothers & alerts' },
  { key: 'message_mothers',   label: 'Message mothers' },
  { key: 'escalate',          label: 'Escalate & resolve alerts' },
  { key: 'create_discharges', label: 'Create discharges' },
  { key: 'manage_staff',      label: 'Manage staff & roles' },
];

type Matrix = Record<PermissionKey, Record<RoleKey, boolean>>;

const DEFAULT_MATRIX: Matrix = {
  view_mothers:      { Administrator: true,  Physician: true,  Midwife: true,  Coordinator: false },
  message_mothers:   { Administrator: false, Physician: true,  Midwife: true,  Coordinator: false },
  escalate:          { Administrator: true,  Physician: true,  Midwife: true,  Coordinator: false },
  create_discharges: { Administrator: true,  Physician: true,  Midwife: true,  Coordinator: true  },
  manage_staff:      { Administrator: true,  Physician: false, Midwife: false, Coordinator: false  },
};

interface PermissionsMatrixProps {
  onAddRole: () => void;
}

const PermissionsMatrix = ({ onAddRole }: PermissionsMatrixProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [matrix, setMatrix] = useState<Matrix>(DEFAULT_MATRIX);

  const toggle = (perm: PermissionKey, role: RoleKey) => {
    setMatrix(prev => ({
      ...prev,
      [perm]: { ...prev[perm], [role]: !prev[perm][role] },
    }));
  };

  return (
    <div className="bg-white rounded-2xl p-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Roles & permissions</h3>
          <p className="text-sm text-gray-400 mt-0.5">What each role can do in the portal.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-[#93406B] text-[#93406B] hover:bg-[#F7E8F0]"
            onClick={() => setIsEditing(e => !e)}
          >
            {isEditing ? 'Done' : 'Edit'}
          </Button>
          <Button variant="default" size="sm" onClick={onAddRole}>
            + Add role
          </Button>
        </div>
      </div>

      {/* Matrix table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-2 pr-6 text-xs font-medium text-gray-400 uppercase tracking-wide w-56">
                Permission
              </th>
              {ROLES.map(role => (
                <th key={role} className="text-center py-2 px-4 text-xs font-medium text-gray-700 w-28">
                  <div>{role}</div>
                  {isEditing && (
                    <div className="text-xs font-normal text-gray-400 mt-0.5">core</div>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PERMISSIONS.map(({ key, label }, rowIdx) => (
              <tr
                key={key}
                className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
              >
                <td className="py-3 pr-6 text-sm text-gray-700 font-normal">{label}</td>
                {ROLES.map(role => {
                  const checked = matrix[key][role];
                  return (
                    <td key={role} className="py-3 px-4 text-center">
                      {isEditing ? (
                        <div className="flex items-center justify-center">
                          <div
                            onClick={() => toggle(key, role)}
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer transition-colors ${
                              checked
                                ? 'bg-[#93406B] border-[#93406B]'
                                : 'bg-white border-gray-300 hover:border-gray-400'
                            }`}
                          >
                            {checked && <Check size={12} className="text-white" strokeWidth={3} />}
                          </div>
                        </div>
                      ) : (
                        <span className={checked ? 'text-[#93406B] font-semibold' : 'text-gray-300'}>
                          {checked ? '✓' : '–'}
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export { PermissionsMatrix };
