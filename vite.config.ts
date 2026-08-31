import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { createPublicKey, verify } from 'node:crypto'

const LOCAL_PRESENTATION_MESSAGE = 'hien-sinh:local-presentation:v1'

function verifyLocalPresentationEnvironment(publicKeySpki: string, signature: string): boolean {
  try {
    const publicKey = createPublicKey({
      key: Buffer.from(publicKeySpki, 'base64url'),
      format: 'der',
      type: 'spki',
    })
    return verify(
      'sha256',
      Buffer.from(LOCAL_PRESENTATION_MESSAGE, 'utf8'),
      { key: publicKey, dsaEncoding: 'ieee-p1363' },
      Buffer.from(signature, 'base64url'),
    )
  } catch {
    return false
  }
}

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const presentationPublicKey = (env.HIEN_SINH_LOCAL_PRESENTATION_PUBLIC_KEY_SPKI ?? '').trim()
  const presentationSignature = (env.HIEN_SINH_LOCAL_PRESENTATION_SIGNATURE ?? '').trim()
  const localPresentationEnabled = command === 'serve'
    && mode !== 'production'
    && verifyLocalPresentationEnvironment(presentationPublicKey, presentationSignature)

  if (command === 'serve' && mode !== 'production' && !localPresentationEnabled) {
    throw new Error('Local presentation environment requires a valid signed startup configuration.')
  }

  if (mode === 'production') {
    const forbiddenFlags = ['VITE_DEVMODE_ENABLED', 'VITE_LOCAL_MOCKS', 'VITE_BYPASS_AUTH']
      .filter(name => env[name] && env[name] !== 'false')
    const exposedSecretNames = Object.keys(env).filter(name =>
      name.startsWith('VITE_') && /(PRIVATE|SECRET|MNEMONIC|SERVICE_ROLE|SIGNING_SEED)/i.test(name),
    )
    const retiredReviewVariables = Object.keys(env).filter(name =>
      /^VITE_EXPERIENCE_REVIEW_/i.test(name),
    )
    const localPresentationVariables = Object.keys(env).filter(name =>
      /^HIEN_SINH_LOCAL_PRESENTATION_/i.test(name),
    )
    if (forbiddenFlags.length || exposedSecretNames.length || retiredReviewVariables.length || localPresentationVariables.length) {
      throw new Error(`Production security guard rejected environment variables: ${[
        ...forbiddenFlags,
        ...exposedSecretNames,
        ...retiredReviewVariables,
        ...localPresentationVariables,
      ].join(', ')}`)
    }
  }

  return {
    plugins: [react()],
    define: {
      __HIEN_SINH_LOCAL_PRESENTATION_ENABLED__: JSON.stringify(localPresentationEnabled),
    },
    server: {
      port: 5174,
      strictPort: true,
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    },
  }
})
