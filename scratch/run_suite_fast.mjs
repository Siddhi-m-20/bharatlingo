import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';

const testDir = 'tests';
const files = fs.readdirSync(testDir).filter(f => f.endsWith('.test.mjs') || f.endsWith('.mjs') || f.endsWith('.js'));
const nodeBin = process.argv[0];
const outFile = path.join('scratch', 'suite_summary.log');

fs.writeFileSync(outFile, `FOUND ${files.length} TEST FILES IN tests/\n\n`);

let totalPassedFiles = 0;
let totalFailedFiles = 0;

for (const file of files) {
  const filePath = path.join(testDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  const isNodeTest = content.includes("from 'node:test'") || content.includes('import test');

  const args = isNodeTest ? ['--test', filePath] : [filePath];
  
  const res = spawnSync(nodeBin, args, { encoding: 'utf8' });
  
  const isOk = res.status === 0;
  if (isOk) {
    totalPassedFiles++;
    fs.appendFileSync(outFile, `✔ [PASS] ${file}\n`);
    console.log(`✔ [PASS] ${file}`);
  } else {
    totalFailedFiles++;
    fs.appendFileSync(outFile, `✖ [FAIL] ${file}\n${res.stdout || ''}\n${res.stderr || ''}\n`);
    console.log(`✖ [FAIL] ${file}`);
  }
}

fs.appendFileSync(outFile, `\nRESULTS: ${totalPassedFiles}/${files.length} test files passed, ${totalFailedFiles} failed.\n`);
console.log(`RESULTS: ${totalPassedFiles}/${files.length} test files passed, ${totalFailedFiles} failed.`);
