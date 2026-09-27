import fs from 'fs';
import path from 'path';
import http from 'http';

const distDir = 'dist';
const assetsDir = path.join(distDir, 'assets');

console.log('===========================================================');
console.log('PRODUCTION BUNDLE & NETWORK TRANSFER ANALYSIS');
console.log('===========================================================\n');

if (!fs.existsSync(distDir)) {
  console.error('dist directory does not exist! Run build first.');
  process.exit(1);
}

// 1. Audit dist/assets files and sizes
const files = fs.readdirSync(assetsDir);
let totalAssetBytes = 0;
let jsBytes = 0;
let cssBytes = 0;
const fileStats = [];

for (const f of files) {
  const fp = path.join(assetsDir, f);
  const stat = fs.statSync(fp);
  totalAssetBytes += stat.size;

  if (f.endsWith('.js')) jsBytes += stat.size;
  if (f.endsWith('.css')) cssBytes += stat.size;

  fileStats.push({
    name: f,
    sizeBytes: stat.size,
    sizeKB: (stat.size / 1024).toFixed(2),
    ext: path.extname(f)
  });
}

fileStats.sort((a, b) => b.sizeBytes - a.sizeBytes);

console.log(`TOTAL DIST ASSET SIZE: ${(totalAssetBytes / 1024).toFixed(2)} KB (${(totalAssetBytes / (1024 * 1024)).toFixed(2)} MB)`);
console.log(`- JavaScript Total: ${(jsBytes / 1024).toFixed(2)} KB`);
console.log(`- CSS Total: ${(cssBytes / 1024).toFixed(2)} KB\n`);

console.log('--- TOP 10 LARGEST ASSETS IN BUNDLE ---');
fileStats.slice(0, 10).forEach((f, i) => {
  console.log(`${i + 1}. ${f.name}: ${f.sizeKB} KB (${f.sizeBytes} bytes)`);
});

// 2. Check html index file and initial load scripts
const htmlContent = fs.readFileSync(path.join(distDir, 'index.html'), 'utf8');
console.log('\n--- INITIAL HTML SCRIPT/CSS INJECTIONS ---');
const scriptMatches = htmlContent.match(/<script[^>]*src="([^"]+)"[^>]*>/g) || [];
const linkMatches = htmlContent.match(/<link[^>]*href="([^"]+)"[^>]*>/g) || [];

scriptMatches.forEach(s => console.log('Script Injection:', s));
linkMatches.forEach(l => console.log('Link Injection:', l));

// 3. Inspect large JS chunks for specific libraries / dictionaries
console.log('\n--- AUDIT OF HEAVY DEPENDENCY & DATA CHUNKS ---');

fileStats.filter(f => f.ext === '.js').forEach(f => {
  const content = fs.readFileSync(path.join(assetsDir, f.name), 'utf8');
  const sizeKB = f.sizeKB;

  const hasUiTranslations = content.includes('explore_topics_subtitle') || content.includes('topic_greetings') || content.includes('Find My Level');
  const hasLucide = content.includes('createLucideIcon') || content.includes('LucideIcon') || content.includes('lucide-react');
  const hasFramer = content.includes('framer-motion') || content.includes('AnimatePresence') || content.includes('motion.');
  const hasSupabase = content.includes('supabase') || content.includes('SupabaseClient') || content.includes('auth.supabase');

  if (hasUiTranslations || hasLucide || hasFramer || hasSupabase || parseFloat(sizeKB) > 50) {
    console.log(`\nChunk [${f.name}] (${sizeKB} KB):`);
    if (hasUiTranslations) console.log('  ⚠️ Contains uiTranslations dictionary');
    if (hasLucide) console.log('  ⚠️ Contains lucide-react icon library code');
    if (hasFramer) console.log('  ⚠️ Contains framer-motion animation library code');
    if (hasSupabase) console.log('  ⚠️ Contains Supabase client SDK code');
  }
});

// 4. Test HTTP connection to Preview Server
http.get('http://localhost:4173/dashboard', (res) => {
  console.log(`\n--- PRODUCTION PREVIEW SERVER CHECK (http://localhost:4173/dashboard) ---`);
  console.log('HTTP Status:', res.statusCode);
  console.log('Content-Type:', res.headers['content-type']);
  console.log('Content-Encoding:', res.headers['content-encoding'] || 'none');
}).on('error', (err) => {
  console.log('\nPreview Server connection error:', err.message);
});
