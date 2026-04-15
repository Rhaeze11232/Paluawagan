// js/auth.js
// Handles login, logout, and session checking across all pages

// Call this at the top of every PROTECTED page (dashboard, contributions, etc.)
//Balik sa login if naka login un nainput na account 
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
    const userData = await getUserRole()
    if (userData?.role === 'MEMBER') {
      window.location.href = 'pages/user-portal.html'
    } else {
      window.location.href = 'pages/dashboard.html'
    }
  }
}

// Get the role and member_id of the currently logged-in user
async function getUserRole() {
  const user = await getCurrentUser()
  if (!user) return null
  const { data } = await db.from('system_user').select('role, member_id').eq('user_id', user.id).maybeSingle()
  return data
}

// Sign in with email tas password
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
