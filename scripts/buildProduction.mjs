import { build } from 'vite'

console.log('--- Starting Vite Production Build ---')
const startTime = Date.now()

try {
  await build({
    configFile: './vite.config.js',
    logLevel: 'info',
  })
  const duration = ((Date.now() - startTime) / 1000).toFixed(2)
  console.log(`\n🎉 Vite Production Build succeeded in ${duration}s!`)
  process.exit(0)
} catch (err) {
  console.error('\n❌ Vite Production Build failed:', err)
  process.exit(1)
}
