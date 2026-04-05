/** Primera visita: modal global de bienvenida (layout). */
export function welcomeOnboardingStorageKey(userId: string) {
  return `djt_welcome_onboarding_v1:${userId}`;
}

/** Se dispara al cerrar el modal de bienvenida para que los intros de sección abran después. */
export const WELCOME_ONBOARDING_DISMISSED_EVENT = "djt-welcome-dismissed";
