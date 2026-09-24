import { readFileSync } from 'node:fs'

const TOKEN = 'vcp_73JmYPrq3f5JtPMz9t9vMkfaQXfDonxIKMZ6ZeBOQrlFUmzY3d2W3eRV'
const HEADERS = {
  Authorization: `Bearer ${TOKEN}`,
  'Content-Type': 'application/json',
}

console.log('=== Step 1: Create or Connect BharatLingo Project on Vercel ===')
let project
const createRes = await fetch('https://api.vercel.com/v10/projects', {
  method: 'POST',
  headers: HEADERS,
  body: JSON.stringify({
    name: 'bharatlingo',
    framework: 'vite',
    gitRepository: {
      type: 'github',
      repo: 'Siddhi-m-20/bharatlingo',
    },
  }),
})

if (createRes.ok) {
  project = await createRes.json()
  console.log('✅ Project created:', project.name, `(ID: ${project.id})`)
} else {
  const err = await createRes.json()
  console.log('Project creation response:', err)
  // If already exists or repo link needs no gitRepo field
  if (err.error?.code === 'project_already_exists') {
    const getRes = await fetch('https://api.vercel.com/v9/projects/bharatlingo', { headers: HEADERS })
    project = await getRes.json()
    console.log('✅ Loaded existing project:', project.name)
  } else {
    // Retry without gitRepository first if GitHub app is not yet connected
    const fallbackRes = await fetch('https://api.vercel.com/v10/projects', {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify({
        name: 'bharatlingo',
        framework: 'vite',
      }),
    })
    project = await fallbackRes.json()
    console.log('✅ Project created without initial git link:', project.name, `(ID: ${project.id})`)
  }
}

console.log('\n=== Step 2: Configure Production Environment Variables ===')
const envVars = [
  { key: 'VITE_SUPABASE_URL', value: 'https://riyrfdkfdathzfcqlnvc.supabase.co' },
  { key: 'VITE_SUPABASE_ANON_KEY', value: 'sb_publishable_sIj5ndgNaixgk4j68IlY2A_PIK2kI5L' },
  { key: 'VAPID_PUBLIC_KEY', value: 'BCvkNefqYlkTi1ATnFmoz-t906jPgPvctWCaI8ujqNZHLCWtDddvj0eyS6e5nQKn6D4GwtDj0FoWu2cG5qUnU0Y' },
  { key: 'VAPID_PRIVATE_KEY', value: '7v9pCsV-juMrSGLN-dGEZuTL4tQcavHouQcC5tVZn54' },
  { key: 'VAPID_SUBJECT', value: 'mailto:support@bharatlingo.in' },
  { key: 'VITE_VAPID_PUBLIC_KEY', value: 'BCvkNefqYlkTi1ATnFmoz-t906jPgPvctWCaI8ujqNZHLCWtDddvj0eyS6e5nQKn6D4GwtDj0FoWu2cG5qUnU0Y' },
]

for (const env of envVars) {
  const envRes = await fetch(`https://api.vercel.com/v10/projects/${project.id || 'bharatlingo'}/env`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({
      key: env.key,
      value: env.value,
      type: 'encrypted',
      target: ['production', 'preview', 'development'],
    }),
  })
  if (envRes.ok) {
    console.log(`✅ Set env var ${env.key}`)
  } else {
    const e = await envRes.json()
    console.log(`ℹ️ Env var ${env.key}: ${e.error?.message || 'already set'}`)
  }
}
