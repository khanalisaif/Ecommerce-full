// Simple frontend-only auth helper for the hidden admin panel.
// NOTE: There is no backend in this project, so this only guards the route
// on the client (localStorage flag). Jab bhi is project mein real backend/API
// jode, isko proper server-side session/JWT check se replace karna.

const ADMIN_SESSION_KEY = 'htl_admin_session'

export function getAdminSession() {
  try {
    const raw = localStorage.getItem(ADMIN_SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function isAdminLoggedIn() {
  return !!getAdminSession()?.loggedIn
}

export function setAdminSession(email) {
  localStorage.setItem(
    ADMIN_SESSION_KEY,
    JSON.stringify({ loggedIn: true, email, loginAt: Date.now() })
  )
}

export function clearAdminSession() {
  localStorage.removeItem(ADMIN_SESSION_KEY)
}
