// js/layout.js
// Injects the sidebar and topbar into every page
// Call renderLayout('dashboard') at the bottom of each page

function renderLayout(activePage, pageTitle) {
  const nav = [
    { id: 'dashboard',     icon: '⊞', label: 'Dashboard',       href: 'dashboard.html',     group: 'Overview' },
    { id: 'contributions', icon: '💳', label: 'Contributions',   href: 'contributions.html', group: 'Transactions', badge: true },
    { id: 'payouts',       icon: '📅', label: 'Payout Schedule', href: 'payouts.html',       group: 'Transactions' },
    { id: 'members',       icon: '👥', label: 'Members',         href: 'members.html',       group: 'Management' },
    { id: 'groups',        icon: '🏘', label: 'Groups',          href: 'groups.html',        group: 'Management' },
    { id: 'penalties',     icon: '⚠️', label: 'Penalties',      href: 'penalties.html',     group: 'Management', badge: true },
  ]

  let lastGroup = ''
  let navHTML = ''
  nav.forEach(item => {
    if (item.group !== lastGroup) {
      navHTML += `<span class="nav-label">${item.group}</span>`
      lastGroup = item.group
    }
    navHTML += `
      <a href="${item.href}" class="nav-btn ${activePage === item.id ? 'active' : ''}">
        <span class="nav-icon">${item.icon}</span>
        ${item.label}
        ${item.badge ? '<span class="nav-badge" id="badge-' + item.id + '">0</span>' : ''}
      </a>`
  })

  const sidebar = `
    <aside class="sidebar">
      <div class="sidebar-top">
        <div class="brand">
          <div class="brand-icon">🌿</div>
          <div class="brand-name">Paluwag<span>AN</span></div>
        </div>
        ${navHTML}
      </div>
      <div class="sidebar-footer">
        <div class="user-pill" onclick="signOut()">
          <div class="user-av" id="userInitials">--</div>
          <div>
            <div class="user-name" id="userName">Loading...</div>
            <div class="user-role" id="userRole">Member</div>
          </div>
          <span style="margin-left:auto;color:rgba(255,255,255,.3);font-size:12px;">⎋</span>
        </div>
      </div>
    </aside>`

  const topbar = `
    <div class="topbar">
      <div class="flex items-center gap-8">
        <span style="font-family:var(--font-display);font-size:16px;font-weight:700;">${pageTitle || activePage}</span>
      </div>
      <div class="topbar-right">
        <button class="btn btn-ghost" style="padding:6px 10px;font-size:16px;">🔔</button>
        <button class="btn btn-primary" onclick="window.location.href='contributions.html'">+ Record Payment</button>
      </div>
    </div>`

  // Inject before the .page div
  const app = document.getElementById('app')
  app.innerHTML = sidebar + `<div class="main">${topbar}<div class="page">` + app.innerHTML + `</div></div>`

  // Load user info into sidebar
  loadUserInfo()
}

async function loadUserInfo() {
  const user = await getCurrentUser()
  if (!user) return

  // Fetch member record linked to this user
  const { data } = await db
    .from('system_user')
    .select('role, member:member_id(full_name)')
    .eq('user_id', user.id)
    .single()

  if (data) {
    const name = data.member?.full_name || user.email
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    document.getElementById('userName').textContent = name
    document.getElementById('userRole').textContent = data.role || 'Member'
    document.getElementById('userInitials').textContent = initials
  }
}
