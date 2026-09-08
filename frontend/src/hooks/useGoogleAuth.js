import { useCallback, useRef } from 'react'

const GOOGLE_SCRIPT_SRC = 'https://accounts.google.com/gsi/client'
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

let scriptLoadingPromise = null
function loadGoogleScript() {
  if (window.google?.accounts?.oauth2) return Promise.resolve()
  if (scriptLoadingPromise) return scriptLoadingPromise

  scriptLoadingPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = GOOGLE_SCRIPT_SRC
    script.async = true
    script.defer = true
    script.onload = resolve
    script.onerror = () => reject(new Error('Failed to load Google Sign-In script'))
    document.head.appendChild(script)
  })
  return scriptLoadingPromise
}

/**
 * Returns a `signIn()` function that opens Google's account picker and
 * resolves with an OAuth2 access token — works from any plain button click,
 * so the site's own button design never has to change.
 *
 * Requires VITE_GOOGLE_CLIENT_ID to be set (see frontend/.env.example).
 */
export function useGoogleAuth() {
  const tokenClientRef = useRef(null)

  const signIn = useCallback(() => {
    if (!CLIENT_ID) {
      return Promise.reject(new Error('Google Sign-In is not configured yet (missing VITE_GOOGLE_CLIENT_ID).'))
    }

    return loadGoogleScript().then(
      () =>
        new Promise((resolve, reject) => {
          if (!tokenClientRef.current) {
            tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
              client_id: CLIENT_ID,
              scope: 'openid email profile',
              callback: (response) => {
                if (response.error) reject(new Error(response.error_description || 'Google sign-in was cancelled'))
                else resolve(response.access_token)
              },
              error_callback: (err) => reject(new Error(err.message || 'Google sign-in failed')),
            })
          }
          tokenClientRef.current.requestAccessToken()
        })
    )
  }, [])

  return { signIn, isConfigured: !!CLIENT_ID }
}

export default useGoogleAuth
