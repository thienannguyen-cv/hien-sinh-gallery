export type UserRole = 'Public' | 'Practitioner' | 'Steward';

export interface IAuthAdapter {
  /**
   * Returns the current role of the connected user.
   */
  getCurrentRole(): Promise<UserRole>;
  
  /**
   * Switches the role (primarily for Mock/Dev environments).
   */
  switchRole(role: UserRole): void;
}
