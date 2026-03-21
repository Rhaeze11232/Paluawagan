// js/auth.js
// Handles login, logout, and session checking across all pages

// Call this at the top of every PROTECTED page (dashboard, contributions, etc.)
// It redirects to login if the user is not signed in
async function requireAuth() {
  const { data: { session } } = await db.auth.getSession()
  if (!session) {
    window.location.href = '../index.html'
  }
  return session
}

// Call this on the login page to redirect already-logged-in users
async function redirectIfLoggedIn() {
  const { data: { session } } = await db.auth.getSession()
  if (session) {
    window.location.href = 'pages/dashboard.html'
  }
}

// Sign in with email + password
async function signIn(email, password) {
  const { data, error } = await db.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

// Sign out
async function signOut() {
  await db.auth.signOut()
  window.location.href = '../index.html'
}

// Get the currently logged-in user
async function getCurrentUser() {
  const { data: { user } } = await db.auth.getUser()
  return user
}
