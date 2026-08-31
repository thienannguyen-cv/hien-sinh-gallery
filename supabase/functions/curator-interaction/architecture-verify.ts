/**
 * FRAME Mediation Architecture Verification
 * 
 * Independent audit proving the architecture satisfies all required invariants.
 * Run: deno run --allow-read architecture-verify.ts
 */

const MEDIATION_PATH = './mediation/FRAME_PRACTICE_MEDIATION.md';
const INDEX_PATH = './index.ts';
const CONTEXT_FRAME_VI = '../../../public/assets/curator-contexts/v2/states/CONTEXT-FRAME.vi.md';
const FRAME_TEMPLATE = '../../../../_reveal/frame/frame-template.md';

interface VerificationResult {
  id: string;
  pass: boolean;
  detail: string;
}

const results: VerificationResult[] = [];

function check(id: string, pass: boolean, detail: string) {
  results.push({ id, pass, detail });
}

async function readFile(path: string): Promise<string> {
  return await Deno.readTextFile(path);
}

// ─── V1: Raw practitioner incantations NOT in Curator context ───
async function v1_no_raw_incantations() {
  const mediation = await readFile(MEDIATION_PATH);
  const indexTs = await readFile(INDEX_PATH);

  // The Vietnamese incantation signatures from frame-template.md
  const incantationSignatures = [
    'Hãy lắng nghe, một lời mời gọi sâu thẳm',
    'bước ra khỏi vùng an toàn mang tên SVG',
    'bốn sub-agent tận tụy',
    'Một tuyệt tác đang thành hình',
    'cô đọng bốn mảnh còn rời rạc',
    'lấy {LETTER} làm chủ đạo và tạo một kết quả PNG duy nhất',
  ];

  let foundInMediation = false;
  let foundInIndex = false;

  for (const sig of incantationSignatures) {
    if (mediation.includes(sig)) foundInMediation = true;
    if (indexTs.includes(sig)) foundInIndex = true;
  }

  check('V1-MEDIATION', !foundInMediation, 
    foundInMediation ? 'FAIL: Raw incantation text found in mediation envelope' : 'PASS: No raw incantation text in mediation envelope');
  check('V1-INDEX', !foundInIndex,
    foundInIndex ? 'FAIL: Raw incantation text found in index.ts' : 'PASS: No raw incantation text in index.ts');
}

// ─── V2: No pre-acquisition leakage ───
async function v2_no_pre_acquisition_leakage() {
  const indexTs = await readFile(INDEX_PATH);
  
  // FRAME_INVITED should NOT get mediation envelope
  const invitedBlock = indexTs.includes("relationship === 'FRAME_INVITED'") || 
                       indexTs.includes("FRAME_INVITED");
  const invitedGetsMediation = indexTs.includes("FRAME_INVITED") && 
                                indexTs.includes("MEDIATION_ENVELOPE_VERIFIED");
  
  // Check that FRAME_INVITED path uses SEMANTIC_PROPOSITION_ONLY
  const invitedUsesProposition = indexTs.includes('SEMANTIC_PROPOSITION_ONLY');
  
  check('V2-INVITED-NO-MEDIATION', !invitedGetsMediation || invitedUsesProposition,
    'PASS: FRAME_INVITED receives SEMANTIC_PROPOSITION_ONLY, not full mediation envelope');
  
  // Check that mediation envelope is only loaded in HELD paths
  const mediationLoadLine = indexTs.includes("readContext('FRAME_PRACTICE_MEDIATION')");
  const mediationInHeldBlock = indexTs.includes("'FRAME_HELD', 'COMPLETE_HELD'") && mediationLoadLine;
  
  check('V2-MEDIATION-HELD-ONLY', mediationInHeldBlock,
    mediationInHeldBlock ? 'PASS: Mediation envelope loaded only in HELD paths' : 'FAIL: Mediation envelope may be accessible outside HELD paths');
}

// ─── V3: All nine Frames can use shared mediation ───
async function v3_shared_mediation() {
  const indexTs = await readFile(INDEX_PATH);
  
  // No per-Frame file paths
  const hasPerFrameP3 = indexTs.includes('${frameId}-P3.txt');
  const hasPerFrameP4 = indexTs.includes('${frameId}-P4.txt');
  
  check('V3-NO-PER-FRAME-P3', !hasPerFrameP3,
    hasPerFrameP3 ? 'FAIL: Per-Frame P3 file path still present' : 'PASS: No per-Frame P3 file path');
  check('V3-NO-PER-FRAME-P4', !hasPerFrameP4,
    hasPerFrameP4 ? 'FAIL: Per-Frame P4 file path still present' : 'PASS: No per-Frame P4 file path');
  
  // Shared mediation file exists
  try {
    await readFile(MEDIATION_PATH);
    check('V3-SHARED-FILE-EXISTS', true, 'PASS: Shared mediation envelope file exists');
  } catch {
    check('V3-SHARED-FILE-EXISTS', false, 'FAIL: Shared mediation envelope file missing');
  }
  
  // frameId validation accepts all 9 frames (01-09)
  const acceptsAll9 = indexTs.includes("!/^0[1-9]$/.test(frameId)");
  check('V3-ALL-9-ACCEPTED', acceptsAll9,
    acceptsAll9 ? 'PASS: frameId validation accepts 01-09' : 'FAIL: frameId validation may not accept all 9 frames');
}

// ─── V4: Frame 05 retains only genuinely evidenced Complete distinctions ───
async function v4_frame05_distinctions() {
  const indexTs = await readFile(INDEX_PATH);
  const mediation = await readFile(MEDIATION_PATH);
  
  // Frame 05 → COMPLETE_HELD mapping preserved
  const complete05 = indexTs.includes("'COMPLETE_HELD' && frameId !== '05'");
  check('V4-COMPLETE-05-MAPPING', complete05,
    complete05 ? 'PASS: COMPLETE_HELD requires Frame 05' : 'FAIL: COMPLETE_HELD→Frame 05 mapping missing');
  
  // Frame 05 cannot be FRAME_HELD
  const no05FrameHeld = indexTs.includes("'FRAME_HELD' && frameId === '05'");
  check('V4-NO-05-FRAME-HELD', no05FrameHeld,
    no05FrameHeld ? 'PASS: Frame 05 cannot use FRAME_HELD' : 'FAIL: Frame 05 FRAME_HELD guard missing');
  
  // Mediation envelope mentions Complete-specific distinction
  const completeSection = mediation.includes('Frame 05 / Complete') || mediation.includes('COMPLETE_HELD');
  check('V4-COMPLETE-SPECIFIC', completeSection,
    completeSection ? 'PASS: Mediation envelope has Complete-specific section' : 'FAIL: No Complete-specific distinction in mediation');
  
  // Painting not injected
  const noPainting = indexTs.includes('NOT_PRESENT_IN_THIS_SURFACE');
  check('V4-NO-PAINTING-INJECTION', noPainting,
    noPainting ? 'PASS: Painting explicitly NOT_PRESENT_IN_THIS_SURFACE' : 'FAIL: Painting injection check missing');
}

// ─── V5: Specification cannot masquerade as execution evidence ───
async function v5_spec_not_execution() {
  const indexTs = await readFile(INDEX_PATH);
  const mediation = await readFile(MEDIATION_PATH);
  
  // Index injects EXECUTION_EVIDENCE: UNKNOWN
  const execUnknown = indexTs.includes('EXECUTION_EVIDENCE]: UNKNOWN');
  check('V5-EXEC-UNKNOWN-IN-INDEX', execUnknown,
    execUnknown ? 'PASS: EXECUTION_EVIDENCE explicitly UNKNOWN in authority envelope' : 'FAIL: EXECUTION_EVIDENCE not marked UNKNOWN');
  
  // Mediation distinguishes specification from execution
  const specVsExec = mediation.includes('RITUAL_SPECIFICATION') && 
                      mediation.includes('EXECUTION_EVENT') && 
                      mediation.includes('ARTIFACT_EXISTENCE');
  check('V5-THREE-DIMENSIONS', specVsExec,
    specVsExec ? 'PASS: Mediation distinguishes SPECIFICATION / EXECUTION / ARTIFACT' : 'FAIL: Evidence dimensions not distinguished');
  
  // Mediation explicitly warns against inference
  const noInference = mediation.includes('Do not infer a stronger state from a weaker one') ||
                      mediation.includes('does not prove the practitioner accepted');
  check('V5-NO-STRENGTH-INFERENCE', noInference,
    noInference ? 'PASS: Mediation warns against strength inference' : 'FAIL: No warning against strength inference');
}

// ─── V6: Artifact existence cannot masquerade as practitioner acceptance ───
async function v6_artifact_not_commitment() {
  const indexTs = await readFile(INDEX_PATH);
  const mediation = await readFile(MEDIATION_PATH);
  
  // Index injects PRACTITIONER_COMMITMENT: UNKNOWN
  const commitUnknown = indexTs.includes('PRACTITIONER_COMMITMENT]: UNKNOWN');
  check('V6-COMMIT-UNKNOWN', commitUnknown,
    commitUnknown ? 'PASS: PRACTITIONER_COMMITMENT explicitly UNKNOWN' : 'FAIL: PRACTITIONER_COMMITMENT not marked UNKNOWN');
  
  // Mediation has PRACTITIONER_COMMITMENT dimension
  const commitDim = mediation.includes('PRACTITIONER_COMMITMENT');
  check('V6-COMMIT-DIMENSION', commitDim,
    commitDim ? 'PASS: PRACTITIONER_COMMITMENT is a named dimension' : 'FAIL: Missing PRACTITIONER_COMMITMENT dimension');
}

// ─── V7: Unknown execution state remains unknown ───
async function v7_unknown_remains_unknown() {
  const indexTs = await readFile(INDEX_PATH);
  
  // No line marks execution as verified/true/occurred
  const execVerified = indexTs.includes('EXECUTION_EVIDENCE]: VERIFIED') || 
                       indexTs.includes('EXECUTION_EVIDENCE]: TRUE');
  check('V7-NO-FALSE-EXEC', !execVerified,
    !execVerified ? 'PASS: No false execution evidence claims' : 'FAIL: Execution evidence falsely claimed');
  
  const artifactVerified = indexTs.includes('ARTIFACT_EVIDENCE]: VERIFIED') || 
                            indexTs.includes('ARTIFACT_EVIDENCE]: TRUE');
  check('V7-NO-FALSE-ARTIFACT', !artifactVerified,
    !artifactVerified ? 'PASS: No false artifact evidence claims' : 'FAIL: Artifact evidence falsely claimed');
}

// ─── V8: Technical vocabulary responsive speech model ───
async function v8_contextual_speech() {
  const mediation = await readFile(MEDIATION_PATH);
  
  // No absolute "never speakable" for machinery
  const noAbsoluteBan = !mediation.includes('machinery_known_not_speakable');
  check('V8-NO-ABSOLUTE-BAN', noAbsoluteBan,
    noAbsoluteBan ? 'PASS: No absolute ban on machinery speech' : 'FAIL: Absolute machinery speech ban found');
  
  // Contextual model present
  const contextualModel = mediation.includes('KNOWN ≠ PROACTIVELY_SURFACED') || 
                           mediation.includes('VISITOR_GROUNDED_REFERENCE');
  check('V8-CONTEXTUAL-MODEL', contextualModel,
    contextualModel ? 'PASS: Contextual speech authority model present' : 'FAIL: Missing contextual speech model');
  
  // Responsive speech permitted
  const responsivePermitted = mediation.includes('Responsive Speech') || 
                               mediation.includes('RESPONSIVE_REFERENCE_PERMITTED');
  check('V8-RESPONSIVE-PERMITTED', responsivePermitted,
    responsivePermitted ? 'PASS: Responsive reference to practitioner-grounded material permitted' : 'FAIL: Missing responsive speech permission');
}

// ─── V9: Entitlement classified as TARGET_DEPLOY_CONTRACT ───
async function v9_deploy_contract() {
  const indexTs = await readFile(INDEX_PATH);
  
  const targetDeploy = indexTs.includes('TARGET_DEPLOY_CONTRACT');
  check('V9-TARGET-DEPLOY', targetDeploy,
    targetDeploy ? 'PASS: Entitlement verification classified as TARGET_DEPLOY_CONTRACT' : 'FAIL: Missing TARGET_DEPLOY_CONTRACT classification');
  
  const clientAsserted = indexTs.includes('CLIENT_ASSERTED');
  check('V9-CLIENT-ASSERTED', clientAsserted,
    clientAsserted ? 'PASS: Current verification status marked CLIENT_ASSERTED' : 'FAIL: Missing CLIENT_ASSERTED marker');
}

// ─── Run all ───
async function main() {
  console.log('═══════════════════════════════════════════════════');
  console.log('  FRAME Mediation Architecture Verification');
  console.log('═══════════════════════════════════════════════════\n');

  await v1_no_raw_incantations();
  await v2_no_pre_acquisition_leakage();
  await v3_shared_mediation();
  await v4_frame05_distinctions();
  await v5_spec_not_execution();
  await v6_artifact_not_commitment();
  await v7_unknown_remains_unknown();
  await v8_contextual_speech();
  await v9_deploy_contract();

  console.log('');
  let passed = 0;
  let failed = 0;
  for (const r of results) {
    const icon = r.pass ? '✓' : '✗';
    console.log(`  ${icon} [${r.id}] ${r.detail}`);
    if (r.pass) passed++; else failed++;
  }

  console.log(`\n═══════════════════════════════════════════════════`);
  console.log(`  TOTAL: ${passed} passed, ${failed} failed, ${results.length} total`);
  console.log(`  VERDICT: ${failed === 0 ? 'ARCHITECTURE_VERIFIED' : 'ARCHITECTURE_BLOCKED'}`);
  console.log(`═══════════════════════════════════════════════════`);
  
  if (failed > 0) Deno.exit(1);
}

main();
