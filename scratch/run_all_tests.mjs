import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const testDir = 'tests';
const files = fs.readdirSync(testDir).filter(f => f.endsWith('.test.mjs') || f.endsWith('.mjs') || f.endsWith('.js'));
console.log(`Found ${files.length} test files in tests/:\n${files.map(f => ' - ' + f).join('\n')}\n`);

const nodeBin = process.argv[0];
let passedFiles = 0;
let failedFiles = 0;

for (const file of files) {
  const filePath = path.join(testDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  const isNodeTest = content.includes("from 'node:test'") || content.includes('import test') || content.includes('describe(') || content.includes('it(');
  
  const cmd = isNodeTest ? `"${nodeBin}" --test "${filePath}"` : `"${nodeBin}" "${filePath}"`;
  
  try {
    console.log(`\n====================================`);
    console.log(`▶ RUNNING ${file} (${isNodeTest ? 'node --test' : 'node script'})`);
    console.log(`====================================`);
    execSync(cmd, { stdio: 'inherit' });
    console.log(`\n✔ [PASS] ${file}`);
    passedFiles++;
  } catch (err) {
    console.log(`\n✖ [FAIL] ${file}`);
    failedFiles++;
  }
}

console.log('\n====================================');
console.log(`FINAL TEST SUITE SUMMARY: ${passedFiles}/${files.length} test files passed.`);
console.log('====================================');
