import type { ICuratorService, CuratorResponse } from './ICuratorService';

export class MockCuratorService implements ICuratorService {
  async submitPrompt(prompt: string, encounterCount: number): Promise<CuratorResponse> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    if (encounterCount >= 3) {
      return {
        classification: 'Fact',
        text: 'Encounter limit reached. The monolith remains silent.',
      };
    }

    const lowerPrompt = prompt.toLowerCase();
    
    if (lowerPrompt.includes('hiện sinh') || lowerPrompt.includes('hien sinh')) {
      return {
        classification: 'Artist statement',
        text: '“Hiện sinh” is organized around a relation and a transmission, not primarily around an asset. Existence precedes essence.',
        hashReference: 'ROOT-COMMITMENTS.json'
      };
    }

    if (lowerPrompt.includes('ai') || lowerPrompt.includes('thuật toán')) {
      return {
        classification: 'Fact',
        text: 'Algorithmic output gains artistic status through human direction, curation, and structural editing.',
      };
    }

    if (lowerPrompt.includes('smap')) {
      return {
        classification: 'Inference',
        text: 'SMap provides contextual and logical seed material. It is the architectural foundation before the event.',
      };
    }

    return {
      classification: 'Inference',
      text: 'The curator registers your presence. The question is noted, but meaning must be derived independently.',
    };
  }
}
