import { useCallback, useRef } from 'react'

const FB_SDK_SRC = 'https://connect.facebook.net/en_US/sdk.js'
const APP_ID = import.meta.env.VITE_FACEBOOK_APP_ID

let sdkLoadingPromise = null
function loadFacebookSdk() {
  if (window.FB) return Promise.resolve()
  if (sdkLoadingPromise) return sdkLoadingPromise

  sdkLoadingPromise = new Promise((resolve, reject) => {
    window.fbAsyncInit = () => {
      window.FB.init({ appId: APP_ID, cookie: true, xfbml: false, version: 'v19.0' })
      resolve()
    }
    const script = document.createElement('script')
    script.src = FB_SDK_SRC
    script.async = true
    script.defer = true
    script.onerror = () => reject(new Error('Failed to load Facebook SDK'))
    document.head.appendChild(script)
  })
  return sdkLoadingPromise
}

/**
 * Returns a `signIn()` function that opens the Facebook login popup and
 * resolves with an access token — works from any plain button click.
 *
 * Requires VITE_FACEBOOK_APP_ID to be set (see frontend/.env.example).
 */
export function useFacebookAuth() {
  const ref = useRef(null)
  ref.current = ref.current || {}

  const signIn = useCallback(() => {
    if (!APP_ID) {
      return Promise.reject(new Error('Facebook Login is not configured yet (missing VITE_FACEBOOK_APP_ID).'))
    }

    return loadFacebookSdk().then(
      () =>
        new Promise((resolve, reject) => {
          window.FB.login(
            (response) => {
              if (response.authResponse) resolve(response.authResponse.accessToken)
              else reject(new Error('Facebook sign-in was cancelled'))
            },
            { scope: 'public_profile,email' }
          )
        })
    )
  }, [])

  return { signIn, isConfigured: !!APP_ID }
}

export default useFacebookAuth
