import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const testDir = 'tests';
const files = [
  'adaptiveEngine.test.js',
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
  'verify_supabase_sm2.mjs'
];

const nodeBin = process.argv[0];
const resultsFile = path.join('scratch', 'test_results.txt');
fs.writeFileSync(resultsFile, `RUNNING TEST SUITE AT ${new Date().toISOString()}\n\n`);

let totalPassed = 0;
let totalFailed = 0;

for (const file of files) {
  const filePath = path.join(testDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  const isNodeTest = content.includes("from 'node:test'") || content.includes('import test');
  const cmd = isNodeTest ? `"${nodeBin}" --test "${filePath}"` : `"${nodeBin}" "${filePath}"`;

  fs.appendFileSync(resultsFile, `--- ${file} (${isNodeTest ? 'node --test' : 'script'}) ---\n`);
  try {
    const out = execSync(cmd, { encoding: 'utf8' });
    fs.appendFileSync(resultsFile, out + `\nSTATUS: PASS\n\n`);
    totalPassed++;
  } catch (err) {
    const out = (err.stdout || '') + '\n' + (err.stderr || '') + '\n' + (err.message || '');
    fs.appendFileSync(resultsFile, out + `\nSTATUS: FAIL\n\n`);
    totalFailed++;
  }
}

fs.appendFileSync(resultsFile, `\n=== SUMMARY: ${totalPassed}/${files.length} PASSED, ${totalFailed} FAILED ===\n`);
console.log(`FINISHED TEST RUN: ${totalPassed}/${files.length} PASSED`);
