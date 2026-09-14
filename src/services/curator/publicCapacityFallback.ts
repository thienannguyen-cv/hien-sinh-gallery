import type { EncounterTrigger } from './encounterProtocol';

/** Fixed, deterministic English presentation for a *typed* fully-exhausted
 * provider result. It is Curator fallback speech, never a claim of a model
 * response, and each turn supplies the minimum PUBLIC obligation. */
const FALLBACKS: Record<EncounterTrigger, string> = {
  IMAGE: 'The source field and initial traces enter the composition; formal relations remain open within the space of encounter. Attend to one visible relation without treating it as a verdict on the work or on your own response.',
  P1: 'The source field and initial traces enter the composition; formal relations remain open within the space of encounter. A visible relation may be held provisionally rather than resolved into a final meaning.',
  P2: 'Constraints of rhythm and direction carry the material toward the symbolic threshold; the viewer retains authority to assess the image. Notice how a limit may organize relation without deciding what the image must mean.',
  P3: 'Multiple anchored reflections can remain present before they are compelled to converge. This is an opening for observation, not a demand to choose a correct reading.',
  P4: 'A finite form can hold a chosen relation while leaving other possibilities unresolved. Your judgment remains your own; no conclusion is being requested of you.',
};

export function publicCapacityFallback(trigger: EncounterTrigger): string {
  return FALLBACKS[trigger];
}
