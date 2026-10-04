import { useState } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Input } from '../ui/Input';
import { Alert, AlertDescription } from '../ui/alert';
import type { useMe } from '../../hooks/useMe';
import { extractApiError } from '../../lib/api';
import { toast } from '../../lib/notify';
import { PendingButton } from './SettingsPrimitives';

/* ─── Password field (show/hide toggle via rightIcon) ─────────── */
const PasswordField = ({
  label,
  value,
  onChange,
  error,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  placeholder?: string;
}) => {
  const [show, setShow] = useState(false);
  return (
    <div className="flex flex-col">
      <Input
        label={label}
        type={show ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        fullWidth
        rightIcon={
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            className="text-gray-400 hover:text-gray-500 transition-colors"
            tabIndex={-1}
          >
            {show ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        }
      />
      {error && (
        <p className="text-xs text-red-500 mt-1 ml-0.5">{error}</p>
      )}
    </div>
  );
};

/* ─── Password validation ──────────────────────────────────────── */
function passwordMeetsPolicy(p: string): boolean {
  return p.length >= 10 && /[a-zA-Z]/.test(p) && /[0-9]/.test(p);
}

interface PasswordErrors {
  currentError?: string;
  newError?: string;
  confirmError?: string;
}

function newPasswordError(newPass: string): string | undefined {
  if (!newPass) return 'Enter a new password.';
  if (!passwordMeetsPolicy(newPass)) return 'At least 10 characters, one letter, and one digit.';
  return undefined;
}

function passwordErrors(
  attempted: boolean,
  current: string,
  newPass: string,
  confirm: string,
): PasswordErrors {
  if (!attempted) return {};
  return {
    currentError: current ? undefined : 'Enter your current password.',
    newError: newPasswordError(newPass),
    confirmError: newPass && confirm !== newPass ? "Passwords don't match." : undefined,
  };
}

/**
 * Map a failed change-password call to an inline message, or `null` when the
 * failure should fall through to the generic toast.
 */
function changePasswordErrorMessage(err: unknown): string | null {
  // Read the CANONICAL envelope ({error_code, message} under `detail`) via
  // the shared helper. The hand-rolled shape probing this replaces matched
  // nothing the backend actually sends: it tested `status === 400` and
  // `data.error === 'incorrect_current_password'`, but a wrong current
  // password is 401 `invalid_credentials` (auth.py). So the real case fell
  // to the generic toast with no inline message — and 400, which is only
  // ever about the NEW password (weak_password / password_too_long), was
  // mislabelled "your current password is incorrect", sending clinicians to
  // retype a password that was never wrong.
  //
  // This also completes the contract the 401 interceptor now depends on:
  // `invalid_credentials` is deliberately NOT treated as a dead session
  // (lib/api.ts AMBIGUOUS_401_CODES), on the premise that this page renders
  // it. Now it does.
  const { error_code, message, status } = extractApiError(err);
  if (error_code === 'invalid_credentials') {
    return 'Your current password is incorrect.';
  }
  if (error_code === 'weak_password' || error_code === 'password_too_long') {
    // Surface the server's own text: the client policy check mirrors the
    // length/letter/digit rule but NOT bcrypt's 72-BYTE ceiling, so a long
    // accented or non-Latin passphrase passes here and fails there.
    return message;
  }
  if (status === 403) {
    return "You don't have permission to change your password.";
  }
  return null;
}

/* ─── Change password section ─────────────────────────────────── */
export const ChangePasswordSection = ({
  changePassword,
  isPending,
}: {
  changePassword: ReturnType<typeof useMe>['changePassword'];
  isPending: boolean;
}) => {

  const [current, setCurrent] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirm, setConfirm] = useState('');
  const [attempted, setAttempted] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const { currentError, newError, confirmError } = passwordErrors(attempted, current, newPass, confirm);

  const handleSubmit = async () => {
    setAttempted(true);
    setApiError(null);
    if (!current || !newPass || !passwordMeetsPolicy(newPass) || newPass !== confirm) return;

    try {
      await changePassword({ currentPassword: current, newPassword: newPass });
      toast.success('Password updated successfully.');
      setCurrent('');
      setNewPass('');
      setConfirm('');
      setAttempted(false);
    } catch (err: unknown) {
      const inline = changePasswordErrorMessage(err);
      if (inline === null) {
        toast.error('Something went wrong. Please try again.');
      } else {
        setApiError(inline);
      }
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {apiError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{apiError}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <PasswordField
          label="Current password"
          value={current}
          onChange={(v) => { setCurrent(v); setApiError(null); }}
          error={currentError}
        />

        {/* Empty cell to keep new password below current on the left column */}
        <span className="hidden sm:block" />

        <PasswordField
          label="New password"
          value={newPass}
          onChange={setNewPass}
          error={newError}
          placeholder="Min. 10 chars, one letter, one digit"
        />

        <PasswordField
          label="Confirm new password"
          value={confirm}
          onChange={setConfirm}
          error={confirmError}
        />
      </div>

      <div className="flex justify-end mt-2">
        <PendingButton
          onClick={handleSubmit}
          disabled={isPending}
          isPending={isPending}
          idleLabel="Update password"
          pendingLabel="Updating..."
        />
      </div>
    </div>
  );
};
