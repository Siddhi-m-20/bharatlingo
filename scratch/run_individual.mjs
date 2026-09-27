import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';

const testDir = 'tests';
const files = [
  'adminDashboard.test.mjs',
  'assessment.test.mjs',
  'dashboardRealData.test.mjs',
  'games.test.mjs',
  'indicNlp.test.mjs',
  'persistenceAndSync.test.mjs',
  'pwaNotification.test.mjs',
  'speakingAudio.test.mjs',
  'stateTransitions.test.mjs',
  'traceCharacterCoverage.test.mjs',
  'tutorScenarios.test.mjs',
  'verify_supabase_sm2.mjs',
  'adaptiveEngine.test.js'
];

const nodeBin = process.argv[0];

console.log('=== BHARATLINGO COMPLETE TEST SUITE RUNNER ===\n');

let passed = 0;
let failed = 0;

for (const file of files) {
  const filePath = path.join(testDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  const isNodeTest = content.includes("from 'node:test'") || content.includes('import test');
  const args = isNodeTest ? ['--test', filePath] : [filePath];

  try {
    const out = execFileSync(nodeBin, args, { encoding: 'utf8' });
    console.log(`[PASS] ${file}`);
    passed++;
  } catch (err) {
    console.log(`[FAIL] ${file}`);
    console.log(err.stdout || err.stderr || err.message);
    failed++;
  }
}

console.log(`\n=== FINAL RESULTS: ${passed}/${files.length} PASSED, ${failed} FAILED ===`);
