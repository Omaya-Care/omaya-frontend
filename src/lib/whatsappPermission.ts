/**
 * Copy for WhatsApp call-permission state, shared by the two surfaces that
 * render it (the call detail footer and the mother record) so they cannot
 * drift on what a status word means to a clinician.
 *
 * The raw vocabulary is Meta's, mirrored on the backend; a midwife should not
 * have to learn it. "no permission" in particular read as a system fault
 * rather than "she hasn't been asked yet", which is what it actually means.
 */

/** Why the WhatsApp call option is unavailable, phrased as her state. */
export function permissionLabel(status?: string): string {
  switch (status) {
    case undefined:
    case "":
      return "not asked yet";
    case "requested":
      return "waiting for her reply";
    case "denied":
      return "she declined";
    case "expired":
      return "permission expired";
    case "revoked":
      return "she turned calls off";
    default:
      // An unknown status is still information — show it rather than
      // flattening it to a wrong label.
      return status;
  }
}

/** Why the "ask her" action itself is currently unavailable. `undefined` when
 *  there is nothing to explain (the action is clickable). */
export function askBlockedLabel(reason?: string): string | undefined {
  switch (reason) {
    case "cooldown_24h":
      return "already asked today";
    case "cooldown_7d":
      return "weekly limit reached";
    // She was never actually asked — WhatsApp refused to carry the request
    // because the limit for this clinic-and-mother pair was already spent
    // (see `cooldown_meta` in the API docs). Deliberately NOT worded as
    // "already asked today": that is `cooldown_24h`, and telling a midwife we
    // asked her when we did not is the small version of the bug this whole
    // path exists to fix.
    case "cooldown_meta":
      return "WhatsApp limit reached";
    case "calling_disabled":
      return "WhatsApp calling is off";
    case "ask_in_flight":
      return "already sending";
    case "no_phone":
      return "no phone number";
    case "withdrawn":
    case "mother_not_active":
      return "consent not active";
    case "not_opted_in":
      return "WhatsApp not enabled for her";
    default:
      return undefined;
  }
}

/** Why the action is held shut by the LAST attempt rather than by her state.
 *  Takes precedence over `askBlockedLabel` — it is the more recent fact. */
export function askHeldLabel(blocked?: "cooloff" | "unconfigured" | null): string | undefined {
  switch (blocked) {
    case "cooloff":
      return "send failed — retry shortly";
    case "unconfigured":
      return "not configured on this server";
    default:
      return undefined;
  }
}

/**
 * How long her permission to be called lasts, phrased for a clinician.
 *
 * Meta grants are either permanent (no expiry) or a bounded window — and the
 * backend already resolves which, stamping `permission_expires_at` from the
 * webhook (or defaulting to Meta's documented 7 days when the webhook is
 * malformed). That window reached the client but was never rendered, so
 * "she allowed calls" looked open-ended even when it had days to run.
 *
 * `undefined` when there is nothing useful to say, so callers can omit the
 * element entirely rather than print an empty parenthetical.
 */
export function permissionWindowLabel(
  status?: string,
  expiresAt?: string,
): string | undefined {
  if (status !== "granted") return undefined;
  if (!expiresAt) return "no expiry";
  const expiry = new Date(expiresAt);
  if (Number.isNaN(expiry.getTime())) return undefined;
  const hoursLeft = (expiry.getTime() - Date.now()) / 3_600_000;
  // Already lapsed by the client's clock but the server still says granted:
  // trust the SERVER (its clock is the one the placement gate uses) and say
  // nothing rather than contradict the row we were handed.
  if (hoursLeft <= 0) return undefined;
  // Under a day, hours are what a midwife can act on; past that a date is
  // easier to hold in mind than "in 73 hours".
  if (hoursLeft < 24) {
    const hours = Math.max(1, Math.round(hoursLeft));
    return `expires in ${hours}h`;
  }
  return `until ${expiry.toLocaleDateString(undefined, { day: "numeric", month: "short" })}`;
}
