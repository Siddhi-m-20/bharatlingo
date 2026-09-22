import { readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const files = readdirSync('tests').filter((f) => f.endsWith('.test.mjs'))

console.log(`Importing and running ${files.length} test suites in single Node process...\n`)

for (const file of files) {
  const fullPath = resolve('tests', file)
  const fileUrl = pathToFileURL(fullPath).href
  await import(fileUrl)
}
