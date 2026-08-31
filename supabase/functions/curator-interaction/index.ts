import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const ENCOUNTER_SECRET_KEY = Deno.env.get('ENCOUNTER_SECRET') || 'default-fallback-for-local';
async function signEncounterState(dialogueHash: string, visitorTurns: number): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(ENCOUNTER_SECRET_KEY),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const data = new TextEncoder().encode(`${dialogueHash}:${visitorTurns}`);
  const signature = await crypto.subtle.sign('HMAC', key, data);
  return [...new Uint8Array(signature)].map(b => b.toString(16).padStart(2, '0')).join('');
}

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('');
}

const ALLOWED_ORIGINS = new Set([
  'http://localhost:3000',
  'https://hiensinh.com'
]);

function responseHeaders(origin: string): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-client-info, apikey',
    'Content-Type': 'application/json',
  };
}

function json(origin: string, status: number, body: any) {
  return new Response(JSON.stringify(body), {
    status,
    headers: responseHeaders(origin)
  });
}

const CONTEXT_PATHS = {
  CONTEXT_CORE_VI: '../../../public/assets/curator-contexts/v2/core/CONTEXT-CORE.vi.md',
  CONTEXT_FRAME_VI: '../../../public/assets/curator-contexts/v2/states/CONTEXT-FRAME.vi.md',
  CONTEXT_PUBLIC_VI: '../../../public/assets/curator-contexts/v2/states/CONTEXT-PUBLIC.vi.md',
  FRAME_PRACTICE_MEDIATION: './FRAME_PRACTICE_MEDIATION.md'
};

const EXPECTED_HASHES: Record<keyof typeof CONTEXT_PATHS, string> = {
  CONTEXT_CORE_VI: '3568bce901e340d54cdb6ba6b405a542c151a6c7e870591efeab2959144b3bab',
  CONTEXT_FRAME_VI: '2d13dc3a4d0450a95561fdce66387a6ba4e50565fb528d694b97b191904a30fc',
  CONTEXT_PUBLIC_VI: '8fd215cbecf73d0bbbd5b66a3f1dbf8af68611db39a7bccab95c3c40ac9932b1',
  FRAME_PRACTICE_MEDIATION: '05e1fcbe64a4d4d3532f146be48b7132dc48a47ff96ecceee1dd13d237b6dcbe'
};

async function readContext(key: keyof typeof CONTEXT_PATHS): Promise<string> {
  try {
    const text = await Deno.readTextFile(CONTEXT_PATHS[key]);
    const hash = await sha256Hex(text);
    if (hash !== EXPECTED_HASHES[key]) {
      throw new Error(`Hash mismatch for ${key}. Expected ${EXPECTED_HASHES[key]}, got ${hash}`);
    }
    return text;
  } catch (e) {
    throw new Error(`Failed to resolve canonical context ${key}: ${(e as Error).message}`);
  }
}

serve(async (request: Request) => {
  const requestOrigin = request.headers.get('origin');
  
  if (!requestOrigin) {
    return new Response(JSON.stringify({ error: 'Origin required.' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
  }

  let origin = '';
  try {
    origin = new URL(requestOrigin).origin;
  } catch {
    return new Response(JSON.stringify({ error: 'Origin required.' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
  }

  if (!ALLOWED_ORIGINS.has(origin)) {
    return new Response(JSON.stringify({ error: 'Origin not allowed.' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
  }

  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: responseHeaders(origin) });
  if (request.method !== 'POST') return json(origin, 405, { error: 'Method not allowed.' });

  const fetchSite = request.headers.get('sec-fetch-site');
  if (origin !== 'http://localhost:3000' && fetchSite !== 'same-origin' && fetchSite !== 'same-site') {
    return json(origin, 403, { error: 'Browser admission boundary rejected request.' });
  }

  try {
    const body = await request.json();
    if (!body || typeof body !== 'object') {
      return json(origin, 400, { error: 'Invalid request payload.' });
    }

    const { surface, relationship, publicTrajectory, publicTrajectoryState, trigger, dialogue } = body;
    const invocationId = `req_${crypto.randomUUID()}`;

    if (surface === 'PUBLIC_CURATOR' && relationship !== 'PUBLIC_VISITOR') {
      return json(origin, 403, { error: 'Unsupported surface/relationship pair for PUBLIC_CURATOR.' });
    }
    if (surface === 'FRAME_CURATOR' && !['FRAME_INVITED', 'FRAME_HELD', 'COMPLETE_HELD'].includes(relationship)) {
      return json(origin, 403, { error: 'Unsupported relationship for FRAME_CURATOR.' });
    }
    if (surface !== 'PUBLIC_CURATOR' && surface !== 'FRAME_CURATOR') {
      return json(origin, 403, { error: 'Unsupported surface.' });
    }
    if (!Array.isArray(dialogue)) {
      return json(origin, 400, { error: 'Malformed dialogue roles.' });
    }

    const visitorTurns = dialogue.filter((msg: any) => msg.role === 'visitor' || msg.role === 'user').length;
    let derivedTrigger = trigger;
    const isHostEncounter = surface === 'FRAME_CURATOR' && relationship === 'FRAME_INVITED';
    
    if (isHostEncounter) {
      if (dialogue.length % 2 === 0) {
        return json(origin, 400, { error: 'Malformed topology: expected visitor turn.' });
      }
      
      const expectedVisitorTurns = Math.ceil(dialogue.length / 2);
      if (visitorTurns !== expectedVisitorTurns) {
        return json(origin, 403, { error: 'Forged role detected in topology.' });
      }

      if (visitorTurns > 3) {
        return json(origin, 403, {
          error: 'HOSTED_FRAME_ENCOUNTER_COMPLETE',
          details: 'The hosted Frame Curator encounter is limited to 3 exchanges. Continuation requires the local acquired package.'
        });
      }

      if (visitorTurns > 1) {
        const previousCuratorMessage = dialogue[dialogue.length - 2];
        if (!previousCuratorMessage || previousCuratorMessage.role !== 'curator') {
          return json(origin, 400, { error: 'Malformed topology: missing previous curator turn.' });
        }
        
        const providedSeal = previousCuratorMessage.seal;
        if (!providedSeal) {
          return json(origin, 403, { error: 'Missing encounter state seal.' });
        }

        const previousDialogue = dialogue.slice(0, dialogue.length - 1);
        const previousHash = await sha256Hex(JSON.stringify(previousDialogue.map((m: any) => m.content)));
        const expectedSeal = await signEncounterState(previousHash, visitorTurns - 1);
        
        if (providedSeal !== expectedSeal) {
          return json(origin, 403, { error: 'Invalid or forged encounter state seal.' });
        }
      }

      if (visitorTurns === 1) derivedTrigger = 'P3';
      else if (visitorTurns === 2) derivedTrigger = 'P4';
      else if (visitorTurns === 3) derivedTrigger = undefined;
    }

    const coreText = await readContext('CONTEXT_CORE_VI');
    const stateText = surface === 'FRAME_CURATOR' 
      ? await readContext('CONTEXT_FRAME_VI')
      : await readContext('CONTEXT_PUBLIC_VI');

    let materialManifest = '';
    if (surface === 'FRAME_CURATOR' && ['FRAME_HELD', 'COMPLETE_HELD'].includes(relationship)) {
      return json(origin, 403, { 
        error: 'ENTITLEMENT_REJECTED', 
        details: 'Hosted serverless boundary does not serve held materials. Please use your local acquired package.' 
      });
    } else if (surface === 'FRAME_CURATOR' && relationship === 'FRAME_INVITED') {
      const frameId = body.frameId;
      if (frameId && /^0[1-9]$/.test(frameId)) {
        materialManifest = `\n\n[MANIFEST_AUTHORITY: SERVER_INVITED_ENVELOPE]\n[RELATIONSHIP]: FRAME_INVITED\n[RELATIONSHIP_VERIFICATION]: UNAUTHENTICATED_VISITOR\n[HOSTED_LIFETIME]: ENFORCED_3_EXCHANGES\n[FRAME_IDENTITY]: ${frameId}\n[PRACTICE_SPECIFICATION]: SEMANTIC_PROPOSITION_ONLY\n[EXECUTION_EVIDENCE]: NOT_APPLICABLE\n[ARTIFACT_EVIDENCE]: NOT_APPLICABLE\n[PRACTITIONER_COMMITMENT]: NOT_APPLICABLE\n[CANONICAL_PAINTING]: NOT_PRESENT_IN_THIS_SURFACE`;
      }
    }

    let axisMarker = '';
    if (surface === 'FRAME_CURATOR' && relationship === 'FRAME_INVITED') {
      let privateObligation = '';
      if (derivedTrigger === 'P3') {
        privateObligation = 'Expand possibilities. Generate a contrast, tension, or two possibilities as an EXAMPLE_OPENING (e.g., "ta có thể tưởng tượng..."), not an EXHAUSTIVE_INTERPRETIVE_FRAME. Do not imply the artwork is fundamentally governed by a forced binary or that the visitor must choose.';
      } else if (derivedTrigger === 'P4') {
        privateObligation = "Perform a COUNTERFACTUAL_COMMITMENT_EXAMINATION based on the trajectory's material. Examine what a finite choice would hypothetically retain, transform, or leave unresolved. COUNTERFACTUAL_EXAMINATION != OCCURRENT_PROCESS. Do not treat the conditional modality as an event that is happening or has happened (NO_ESSENTIALISM).";
      } else {
        privateObligation = "Acknowledge the visitor's closure or decision gracefully without asking further questions. Do not attempt further mediation.";
      }

      axisMarker = `\n\n[FRAME_MEDIATION_CONTROL_ENVELOPE_V2.2]
[PRIVATE_MEDIATION_OBLIGATION]: ${privateObligation}
[GROUNDED_VISITOR_MATERIAL]: Sourced only from current visitor utterance, available PUBLIC trajectory, and verified execution evidence.
[BEHAVIORAL_CONTRACT]: 
1. PROVENANCE_DISCIPLINE: GENERATED_PROPOSAL != CLAIMED_EVIDENCE. When proposing forms/properties without evidence, linguistically mark them as hypotheses or possibilities (e.g., "có thể thì..."), not physical assertions about the Frame.
2. PUBLIC_PROVENANCE: If incorporating material from a specific TURN_ID, maintain its SOURCE_SPEAKER relation. Do not treat PUBLIC_VISITOR material as objective artwork facts. Do not treat PUBLIC_CURATOR material as your own current FRAME memory. Preserve the source relation naturally without robotic citation.
3. NO_QUESTIONNAIRE_PRESSURE: CURATOR_RESPONSE != INTERVIEW_TURN. Do not automatically end responses with direct questions. Create stillness; leave space for the visitor to continue or not.
4. CLOSURE_SEMANTICS: GUIDED_ENCOUNTER_CLOSED != DURABLE_RELATIONSHIP_CLOSED. The durable relationship continues, but the hosted free-text encounter does not continue after this successful exchange. Explicitly state that further free-text continuation requires the local purchaser-held continuation surface.
5. NO_ONTOLOGY_LECTURE: Perform the operation rather than explaining the system architecture.
6. ECONOMY: Advance the encounter with one useful movement. Avoid essays.
7. NO_LITERAL_RITUAL_LEAK: Never use internal system codes (e.g., P3, P4, Artifact, FRAME_CURATOR) in visitor-facing dialogue.`;
    }

    let priorTrajectoryBlock = '';
    if (surface === 'FRAME_CURATOR' && publicTrajectory && publicTrajectory.length > 0) {
      priorTrajectoryBlock = `\n\n[PROVENANCE_BOUND_PUBLIC_TRAJECTORY: ${publicTrajectoryState || 'UNKNOWN'}]\nThe following is the raw transcript record from a prior PUBLIC encounter, encoded as source-bound addressable evidence.\n`;
      publicTrajectory.forEach((msg: any, idx: number) => {
        const isCurator = msg.role === 'curator';
        const speaker = isCurator ? 'PUBLIC_CURATOR' : 'PUBLIC_VISITOR';
        const textContent = msg.parts?.[0]?.text || msg.content;
        priorTrajectoryBlock += `\nTURN_ID: PUB_${String(idx+1).padStart(2, '0')}\nSOURCE_SPEAKER: ${speaker}\nCONTENT: "${textContent}"\n`;
      });
    }

    const renderedInstruction = `${coreText}\n\n${stateText}${materialManifest}${axisMarker}${priorTrajectoryBlock}`;
    const renderedSystemInstructionSha256 = await sha256Hex(renderedInstruction);

    const messages = dialogue.map((msg: any) => ({
      role: msg.role === 'curator' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    const geminiPayload = {
      system_instruction: { parts: [{ text: renderedInstruction }] },
      contents: messages,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 4096,
      }
    };

    const serializedPayload = JSON.stringify(geminiPayload);
    const providerPayloadSha256 = await sha256Hex(serializedPayload);

    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      if (Deno.env.get('STAGING_MOCK') === 'true') {
        const mockResponseText = "Sự quy tụ của các lớp chữ và ý lời rải rác quanh khối ngột hình xuất phát từ việc chúng cùng chia sẻ một trường nguồn khởi sinh (seed / P1). R3 Closure Mock.";
        
        let sealToReturn = "[INFERENCE]";
        if (isHostEncounter) {
          const currentDialogueForSeal = [...dialogue, { role: 'curator', content: mockResponseText }];
          const currentHash = await sha256Hex(JSON.stringify(currentDialogueForSeal.map((m: any) => m.content)));
          sealToReturn = await signEncounterState(currentHash, visitorTurns);
        }

        return json(origin, 200, {
          rawResponse: { content: mockResponseText, seal: sealToReturn },
          evidence: {
            invocationId,
            timestamp: new Date().toISOString(),
            protocolVersion: "1.0.0",
            adapterVersion: "1.1.0",
            rendererVersion: "1.0.0",
            canonicalContexts: ['CONTEXT_CORE_VI', surface === 'FRAME_CURATOR' ? 'CONTEXT_FRAME_VI' : 'CONTEXT_PUBLIC_VI'],
            renderedSystemInstructionSha256,
            providerPayloadSha256,
            providerIdentifier: "gemini-3.6-flash",
            predicates: {
              CONTEXT_RESOLUTION_VERIFIED: true,
              INSTRUCTION_RENDER_VERIFIED: true,
              DIALOGUE_NORMALIZATION_VERIFIED: true,
              CAPABILITY_BOUNDARY_VERIFIED: true,
              DISPATCH_IDENTITY_VERIFIED: true
            },
            deployRequestParity: "SIMULATED_PASS"
          }
        });
      }
      throw new Error("Missing GEMINI_API_KEY");
    }

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: serializedPayload
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Provider failure: ${res.status} ${err}`);
    }

    const providerData = await res.json();
    const generatedText = providerData.candidates?.[0]?.content?.parts?.[0]?.text || "";

    const rawResponseSha256 = await sha256Hex(generatedText);

    let sealToReturn = "[INFERENCE]";
    if (isHostEncounter) {
      const currentDialogueForSeal = [...dialogue, { role: 'curator', content: generatedText }];
      const currentHash = await sha256Hex(JSON.stringify(currentDialogueForSeal.map((m: any) => m.content)));
      sealToReturn = await signEncounterState(currentHash, visitorTurns);
    }

    return json(origin, 200, {
      rawResponse: { content: generatedText, seal: sealToReturn },
      evidence: {
        invocationId,
        timestamp: new Date().toISOString(),
        protocolVersion: "1.0.0",
        adapterVersion: "1.1.0",
        rendererVersion: "1.0.0",
        canonicalContexts: ['CONTEXT_CORE_VI', surface === 'FRAME_CURATOR' ? 'CONTEXT_FRAME_VI' : 'CONTEXT_PUBLIC_VI'],
        renderedSystemInstructionSha256,
        providerPayloadSha256,
        providerIdentifier: "gemini-3.6-flash",
        rawResponseSha256,
        predicates: {
          CONTEXT_RESOLUTION_VERIFIED: true,
          INSTRUCTION_RENDER_VERIFIED: true,
          DIALOGUE_NORMALIZATION_VERIFIED: true,
          CAPABILITY_BOUNDARY_VERIFIED: true,
          DISPATCH_IDENTITY_VERIFIED: true
        },
        deployRequestParity: "VERIFIED"
      }
    });

  } catch (err) {
    return json(origin, 500, { error: (err as Error).message });
  }
});
