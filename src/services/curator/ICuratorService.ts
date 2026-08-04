export type Classification = 'Fact' | 'Artist statement' | 'Inference' | 'Counter-reading';

export interface CuratorResponse {
  classification: Classification;
  text: string;
  hashReference?: string;
}

export interface ICuratorService {
  /**
   * Submit a prompt to the curator.
   */
  submitPrompt(prompt: string, encounterCount: number): Promise<CuratorResponse>;
}
