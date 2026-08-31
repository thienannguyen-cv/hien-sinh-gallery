export type CuratorSurface = 'PUBLIC_CURATOR' | 'FRAME_CURATOR';
export type RelationshipState = 'PUBLIC' | 'FRAME_INVITED' | 'FRAME_HELD' | 'COMPLETE_HELD';
export type EncounterTrigger = 'P1' | 'P2' | 'P3' | 'P4' | 'IMAGE';
export type EncounterCompletionSource = 'audited-preset' | 'live';

export interface EncounterSlotCompletion {
  trigger: EncounterTrigger;
  source: EncounterCompletionSource;
}

export const ENCOUNTER_ORDER: Record<CuratorSurface, readonly EncounterTrigger[]> = {
  PUBLIC_CURATOR: ['P1', 'P2', 'IMAGE'],
  FRAME_CURATOR: ['P3', 'P4', 'IMAGE'],
};

export function nextEncounterTrigger(
  surface: CuratorSurface,
  completedCount: number,
): EncounterTrigger | null {
  return ENCOUNTER_ORDER[surface][completedCount] ?? null;
}

export function isEncounterTriggerSelectable(
  surface: CuratorSurface,
  completedCount: number,
  trigger: EncounterTrigger,
): boolean {
  return nextEncounterTrigger(surface, completedCount) === trigger;
}

/**
 * A live utterance occupies the current temporal slot, just as an audited
 * preset click would. It does not claim that the visitor literally uttered
 * the P-axis prompt; it only advances the encounter trajectory by one place.
 */
export function completeCurrentEncounterSlot(
  surface: CuratorSurface,
  completedCount: number,
  source: EncounterCompletionSource,
): EncounterSlotCompletion | null {
  const trigger = nextEncounterTrigger(surface, completedCount);
  return trigger ? { trigger, source } : null;
}

export function completedRailIds(
  surface: CuratorSurface,
  completedCount: number,
): Array<'P1' | 'P2' | 'P3' | 'P4'> {
  return ENCOUNTER_ORDER[surface]
    .slice(0, completedCount)
    .filter((trigger): trigger is 'P1' | 'P2' | 'P3' | 'P4' => trigger !== 'IMAGE');
}
