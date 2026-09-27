import { execSync } from 'child_process';
const nodeBin = process.argv[0];

console.log('Running Vite build...');
try {
  const out = execSync(`"${nodeBin}" "./node_modules/vite/bin/vite.js" build`, { encoding: 'utf8' });
  console.log('BUILD SUCCESS:');
  console.log(out);
} catch (err) {
  console.error('BUILD FAILED:');
  console.error(err.stdout || err.stderr || err.message);
}
