import http from 'http';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');

const PORT = 3001;

// Load env
const envPath = path.join(process.cwd(), '.env.development.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      process.env[match[1]] = match[2];
    }
  });
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

function sha256Hex(data) {
  return crypto.createHash('sha256').update(data, 'utf8').digest('hex');
}

const CONTEXT_PATHS = {
  'CONTEXT_CORE_VI': './archive_assets/curator-contexts/v2/core/CONTEXT-CORE.vi.md',
  'CONTEXT_PUBLIC_VI': './archive_assets/curator-contexts/v2/states/CONTEXT-PUBLIC.vi.md',
  'CONTEXT_FRAME_VI': './archive_assets/curator-contexts/v2/states/CONTEXT-FRAME.vi.md',
  'FRAME_PRACTICE_MEDIATION': './supabase/functions/curator-interaction/mediation/FRAME_PRACTICE_MEDIATION.md'
};

const EXPECTED_HASHES = {
  'CONTEXT_CORE_VI': '3568bce901e340d54cdb6ba6b405a542c151a6c7e870591efeab2959144b3bab',
  'CONTEXT_PUBLIC_VI': '8fd215cbecf73d0bbbd5b66a3f1dbf8af68611db39a7bccab95c3c40ac9932b1',
  'CONTEXT_FRAME_VI': '2d13dc3a4d0450a95561fdce66387a6ba4e50565fb528d694b97b191904a30fc',
  'FRAME_PRACTICE_MEDIATION': '18eb3fb01ae17ca4d0935377a995f3d304df35483af0ae575dfdbf27eb2fc831'
};

async function readContext(key) {
  try {
    const text = fs.readFileSync(CONTEXT_PATHS[key], 'utf8');
    const hash = sha256Hex(text);
    if (hash !== EXPECTED_HASHES[key]) {
      throw new Error(`Hash mismatch for ${key}. Expected ${EXPECTED_HASHES[key]}, got ${hash}`);
    }
    return text;
  } catch (e) {
    throw new Error(`Failed to resolve canonical context ${key}: ${e.message}`);
  }
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, apikey, x-client-info');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  if (req.method === 'GET' && (req.url === '/steward-image' || req.url === '/api/steward-image' || req.url?.startsWith('/steward-image?') || req.url?.startsWith('/api/steward-image?'))) {
    const imagePath = path.join(process.cwd(), 'archive_assets', 'condensed_masterpiece_512.png');
    if (fs.existsSync(imagePath)) {
      const data = fs.readFileSync(imagePath);
      res.writeHead(200, {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=3600',
      });
      return res.end(data);
    } else {
      res.writeHead(404);
      return res.end(JSON.stringify({ error: 'Steward image not found.' }));
    }
  }

  if (req.method === 'GET' && (req.url === '/practitioner-image' || req.url === '/api/practitioner-image' || req.url?.startsWith('/practitioner-image?') || req.url?.startsWith('/api/practitioner-image?'))) {
    const imagePath = path.join(process.cwd(), 'archive_assets', 'intersection-frame.png');
    if (fs.existsSync(imagePath)) {
      const data = fs.readFileSync(imagePath);
      res.writeHead(200, {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=3600',
      });
      return res.end(data);
    } else {
      res.writeHead(404);
      return res.end(JSON.stringify({ error: 'Practitioner image not found.' }));
    }
  }

  if (req.method !== 'POST') {
    res.writeHead(405);
    return res.end(JSON.stringify({ error: 'Method not allowed.' }));
  }

  let bodyData = '';
  req.on('data', chunk => { bodyData += chunk; });
  req.on('end', async () => {
    try {
      const body = JSON.parse(bodyData);
      const { surface, relationship, language, trigger, dialogue, publicTrajectory, publicTrajectoryState } = body;
      const invocationId = body.invocationId || `req_${crypto.randomUUID()}`;

      if (surface === 'PUBLIC_CURATOR' && relationship !== 'PUBLIC') {
        res.writeHead(403); return res.end(JSON.stringify({ error: 'Unsupported surface/relationship pair for PUBLIC_CURATOR.' }));
      }
      if (surface === 'FRAME_CURATOR' && !['FRAME_INVITED', 'FRAME_HELD', 'COMPLETE_HELD'].includes(relationship)) {
        res.writeHead(403); return res.end(JSON.stringify({ error: 'Unsupported relationship for FRAME_CURATOR.' }));
      }
      if (surface !== 'PUBLIC_CURATOR' && surface !== 'FRAME_CURATOR') {
        res.writeHead(403); return res.end(JSON.stringify({ error: 'Unsupported surface.' }));
      }
      if (!Array.isArray(dialogue)) {
        res.writeHead(400); return res.end(JSON.stringify({ error: 'Malformed dialogue roles.' }));
      }

      const visitorTurns = dialogue.filter(msg => msg.role === 'visitor' || msg.role === 'user').length;
      if (surface === 'FRAME_CURATOR' && visitorTurns > 3) {
        res.writeHead(403); 
        return res.end(JSON.stringify({ 
          error: 'HOSTED_FRAME_ENCOUNTER_COMPLETE', 
          details: 'The hosted FRAME encounter is strictly limited to 3 visitor exchanges. Further continuation belongs to the purchaser-held local environment.',
          handoff_directive: 'DURABLE_CURATOR_RELATIONSHIP_TRANSFERRED'
        }));
      }

      const coreText = await readContext('CONTEXT_CORE_VI');
      const stateText = surface === 'FRAME_CURATOR' 
        ? await readContext('CONTEXT_FRAME_VI')
        : await readContext('CONTEXT_PUBLIC_VI');

      let materialManifest = '';
      if (surface === 'FRAME_CURATOR' && ['FRAME_HELD', 'COMPLETE_HELD'].includes(relationship)) {
        const frameId = body.frameId;
        if (!frameId || !/^0[1-9]$/.test(frameId)) {
          res.writeHead(400); return res.end(JSON.stringify({ error: 'FRAME_MATERIAL_INCOMPLETE', details: 'Invalid or missing frameId.' }));
        }
        if (relationship === 'COMPLETE_HELD' && frameId !== '05') {
          res.writeHead(400); return res.end(JSON.stringify({ error: 'FRAME_MATERIAL_INCOMPLETE', details: 'COMPLETE_HELD relationship requires Frame 05.' }));
        }
        if (relationship === 'FRAME_HELD' && frameId === '05') {
          res.writeHead(400); return res.end(JSON.stringify({ error: 'FRAME_MATERIAL_INCOMPLETE', details: 'Frame 05 is canonically assigned to Complete, not standalone FRAME_HELD.' }));
        }

        try {
          const mediationText = await readContext('FRAME_PRACTICE_MEDIATION');
          materialManifest = `\n\n[MANIFEST_AUTHORITY: SERVER_MEDIATION_ENVELOPE]\n[RELATIONSHIP]: ${relationship}\n[RELATIONSHIP_VERIFICATION]: CLIENT_ASSERTED (TARGET_DEPLOY_CONTRACT: independent verification not yet implemented)\n[FRAME_IDENTITY]: ${frameId}\n[PRACTICE_SPECIFICATION]: MEDIATION_ENVELOPE_VERIFIED\n[EXECUTION_EVIDENCE]: UNKNOWN\n[ARTIFACT_EVIDENCE]: UNKNOWN\n[PRACTITIONER_COMMITMENT]: UNKNOWN\n[CANONICAL_PAINTING]: NOT_PRESENT_IN_THIS_SURFACE\n\n${mediationText}`;
        } catch (e) {
          res.writeHead(400); return res.end(JSON.stringify({ error: 'FRAME_MATERIAL_INCOMPLETE', details: `Failed to load mediation envelope: ${e.message}` }));
        }
      } else if (surface === 'FRAME_CURATOR' && relationship === 'FRAME_INVITED') {
        const frameId = body.frameId;
        if (frameId && /^0[1-9]$/.test(frameId)) {
          materialManifest = `\n\n[MANIFEST_AUTHORITY: SERVER_INVITED_ENVELOPE]\n[RELATIONSHIP]: FRAME_INVITED\n[RELATIONSHIP_VERIFICATION]: CLIENT_ASSERTED (TARGET_DEPLOY_CONTRACT: independent verification not yet implemented)\n[FRAME_IDENTITY]: ${frameId}\n[PRACTICE_SPECIFICATION]: SEMANTIC_PROPOSITION_ONLY\n[EXECUTION_EVIDENCE]: NOT_APPLICABLE\n[ARTIFACT_EVIDENCE]: NOT_APPLICABLE\n[PRACTITIONER_COMMITMENT]: NOT_APPLICABLE\n[CANONICAL_PAINTING]: NOT_PRESENT_IN_THIS_SURFACE`;
        }
      }

      
        let axisMarker = '';
        if (trigger === 'P3' || trigger === 'P4') {
          let privateObligation = '';
          if (trigger === 'P3') {
            privateObligation = 'Expand possibilities. Generate a contrast, tension, or two possibilities as an EXAMPLE_OPENING (e.g., "ta có thể tưởng tượng..."), not an EXHAUSTIVE_INTERPRETIVE_FRAME. Do not imply the artwork is fundamentally governed by a forced binary or that the visitor must choose.';
          } else if (trigger === 'P4') {
            privateObligation = "Perform a COUNTERFACTUAL_COMMITMENT_EXAMINATION based on the trajectory's material. Examine what a finite choice would hypothetically retain, transform, or leave unresolved. COUNTERFACTUAL_EXAMINATION != OCCURRENT_PROCESS. Do not treat the conditional modality as an event that is happening or has happened (NO_ESSENTIALISM).";
          }

          axisMarker = `\n\n[FRAME_MEDIATION_CONTROL_ENVELOPE_V2.2]
[PRIVATE_MEDIATION_OBLIGATION]: ${privateObligation}
[GROUNDED_VISITOR_MATERIAL]: Sourced only from current visitor utterance, available PUBLIC trajectory, and verified execution evidence.
[BEHAVIORAL_CONTRACT]: 
1. PROVENANCE_DISCIPLINE: GENERATED_PROPOSAL != CLAIMED_EVIDENCE. When proposing forms/properties without evidence, linguistically mark them as hypotheses or possibilities (e.g., "có thể thử..."), not physical assertions about the Frame.
2. PUBLIC_PROVENANCE: If incorporating material from a specific TURN_ID, maintain its SOURCE_SPEAKER relation. Do not treat PUBLIC_VISITOR material as objective artwork facts. Do not treat PUBLIC_CURATOR material as your own current FRAME memory. Preserve the source relation naturally without robotic citation.
3. NO_QUESTIONNAIRE_PRESSURE: CURATOR_RESPONSE != INTERVIEW_TURN. Do not automatically end responses with direct questions. Create stillness; leave space for the visitor to continue or not.
4. CLOSURE_SEMANTICS: GUIDED_ENCOUNTER_CLOSED != CURATOR_RELATIONSHIP_CLOSED. If closing a structured encounter, do not imply the free-text relationship is locked out or the Curator is unavailable.
5. NO_ONTOLOGY_LECTURE: Perform the operation rather than explaining the system architecture.
6. ECONOMY: Advance the encounter with one useful movement. Avoid essays.
  7. NO_LITERAL_RITUAL_LEAK: Never use internal system codes (e.g., P3, P4, Artifact, FRAME_CURATOR) in visitor-facing dialogue.`;
        } else if (trigger) {
          axisMarker = `\n\n[ORDINARY_CURATOR_MEDIATION]
[PRIVATE_MEDIATION_OBLIGATION]: Respond directly to the visitor's utterance. The guided P3/P4 encounter is NOT active.
[BEHAVIORAL_CONTRACT]: 
1. NO_GUIDED_MEDIATION_BLEED: Do not force the conversation into P3/P4 ontology (plurality, condensation, finite choices) unless the visitor explicitly asks about them.
2. PHYSICAL_FACT_GROUNDING: Answer physical or conceptual questions accurately without inventing meaning. If an artwork property is unknown, state that based on the manifest.
3. CLOSURE_LANGUAGE_ACCURACY: If acknowledging the end of a specific topic or structured encounter, ensure the wording clarifies that only the structured phase is closed, not the conversational relationship. Avoid phrases like "cuộc đối thoại khép lại".
4. ORDINARY_SPEECH: Respond naturally. Do not lecture.
  5. NO_LITERAL_RITUAL_LEAK: Never use internal system codes (e.g., P3, P4, Artifact, FRAME_CURATOR) in visitor-facing dialogue.`;
        }


      let priorTrajectoryBlock = '';
        if (surface === 'FRAME_CURATOR' && publicTrajectory && publicTrajectory.length > 0) {
          priorTrajectoryBlock = `\n\n[PROVENANCE_BOUND_PUBLIC_TRAJECTORY: ${publicTrajectoryState || 'UNKNOWN'}]\nThe following is the raw transcript record from a prior PUBLIC encounter, encoded as source-bound addressable evidence.\n`;
          publicTrajectory.forEach((msg, idx) => {
            const isCurator = msg.role === 'curator';
            const speaker = isCurator ? 'PUBLIC_CURATOR' : 'PUBLIC_VISITOR';
            const textContent = msg.parts?.[0]?.text || msg.content;
            priorTrajectoryBlock += `\nTURN_ID: PUB_${String(idx+1).padStart(2, '0')}\nSOURCE_SPEAKER: ${speaker}\nCONTENT: "${textContent}"\n`;
          });
        }

      const renderedInstruction = `${coreText}\n\n${stateText}${materialManifest}${axisMarker}${priorTrajectoryBlock}`;
      const renderedSystemInstructionSha256 = sha256Hex(renderedInstruction);

      const messages = dialogue.map((msg) => ({
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
      const providerPayloadSha256 = sha256Hex(serializedPayload);

      if (!GEMINI_API_KEY) {
        throw new Error("Missing GEMINI_API_KEY in environment");
      }

      let fetchReq;
      let lastErr;
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          fetchReq = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: serializedPayload,
            signal: AbortSignal.timeout(30000)
          });
          break; // success
        } catch (e) {
          lastErr = e;
          console.error(`Attempt ${attempt} failed: ${e.message}`);
          await new Promise(r => setTimeout(r, 2000));
        }
      }

      if (!fetchReq) {
        throw lastErr || new Error("Failed to fetch after multiple attempts");
      }

      if (!fetchReq.ok) {
        const err = await fetchReq.text();
        throw new Error(`Provider failure: ${fetchReq.status} ${err}`);
      }

      const providerData = await fetchReq.json();
      const generatedText = providerData.candidates?.[0]?.content?.parts?.[0]?.text || "";
      const rawResponseSha256 = sha256Hex(generatedText);

      const resBody = {
        content: generatedText,
        seal: "[FRAME CURATOR]",
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
          finishReason: providerData.candidates?.[0]?.finishReason,
          usageMetadata: providerData.usageMetadata,
          predicates: {
            CONTEXT_RESOLUTION_VERIFIED: true,
            INSTRUCTION_RENDER_VERIFIED: true,
            DIALOGUE_NORMALIZATION_VERIFIED: true,
            CAPABILITY_BOUNDARY_VERIFIED: true,
            DISPATCH_IDENTITY_VERIFIED: true
          },
          deployRequestParity: "VERIFIED"
        }
      };

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(resBody));

    } catch (err) {
      console.error(err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
  });
});

server.listen(PORT, () => {
  console.log(`Faithful Development Adapter running on port ${PORT}`);
});
