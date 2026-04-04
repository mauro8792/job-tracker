/**
 * Acceso tipo Pro para UI (perfil, futuros límites en cliente).
 * El servidor puede aplicar reglas adicionales por endpoint.
 */
export function hasProLikeAccess(user: {
  plan: string;
  trialEndsAt?: string | null;
  hasActiveBonusAccess?: boolean;
}): boolean {
  if (user.plan === "pro") return true;
  if (user.hasActiveBonusAccess) return true;
  if (user.plan === "trial" && user.trialEndsAt) {
    return new Date(user.trialEndsAt).getTime() > Date.now();
  }
  return false;
}
