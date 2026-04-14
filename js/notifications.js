// js/notifications.js
// Utility for triggering email notifications via Supabase Edge Function
// and showing in-app toast notifications.

/**
 * Send a notification via Supabase Edge Function.
 * Types: PAYMENT_RECORDED, PAYOUT_RELEASED, PENALTY_IMPOSED, DUE_REMINDER
 *
 * @param {string} type - Notification type
 * @param {object} data - Payload (member_name, group_name, amount, cycle, etc.)
 */
async function sendNotification(type, data) {
  try {
    // Try calling Supabase Edge Function (if deployed)
    const { data: result, error } = await db.functions.invoke('send-notification', {
      body: { type, ...data }
    })
    if (error) {
      console.warn('[Notification] Edge Function not available:', error.message)
    } else {
      console.log('[Notification] Sent:', type, result)
    }
  } catch (e) {
    // Edge Function not deployed — silently log
    console.warn('[Notification] Could not reach Edge Function:', e.message)
  }
}

/**
 * Show an in-app toast notification (bottom-right corner).
 * @param {string} message - Toast message
 * @param {'success'|'error'|'info'|'warning'} variant
 * @param {number} duration - ms to show (default 4000)
 */
function showToast(message, variant = 'success', duration = 4000) {
  // Create container if not exists
  let container = document.getElementById('toast-container')
  if (!container) {
    container = document.createElement('div')
    container.id = 'toast-container'
    container.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:9999;display:flex;flex-direction:column;gap:10px;pointer-events:none;'
    document.body.appendChild(container)
  }

  const colors = {
    success: { bg: '#ecfdf5', border: '#a7f3d0', text: '#065f46', icon: '✅' },
    error:   { bg: '#fef2f2', border: '#fecaca', text: '#991b1b', icon: '❌' },
    info:    { bg: '#eff6ff', border: '#bfdbfe', text: '#1e40af', icon: 'ℹ️' },
    warning: { bg: '#fffbeb', border: '#fde68a', text: '#92400e', icon: '⚠️' },
  }
  const c = colors[variant] || colors.info

  const toast = document.createElement('div')
  toast.style.cssText = `
    background:${c.bg};border:1px solid ${c.border};color:${c.text};
    padding:14px 20px;border-radius:12px;font-size:13.5px;font-weight:600;
    font-family:'Instrument Sans',sans-serif;
    box-shadow:0 8px 30px rgba(0,0,0,.12);pointer-events:auto;
    display:flex;align-items:center;gap:10px;min-width:280px;max-width:420px;
    animation:toastIn .3s ease;
  `
  toast.innerHTML = `<span style="font-size:18px;">${c.icon}</span><span>${message}</span>`

  // Inject animation if not present
  if (!document.getElementById('toast-keyframes')) {
    const style = document.createElement('style')
    style.id = 'toast-keyframes'
    style.textContent = `
      @keyframes toastIn { from { opacity:0; transform:translateX(40px); } to { opacity:1; transform:translateX(0); } }
      @keyframes toastOut { from { opacity:1; transform:translateX(0); } to { opacity:0; transform:translateX(40px); } }
    `
    document.head.appendChild(style)
  }

  container.appendChild(toast)

  setTimeout(() => {
    toast.style.animation = 'toastOut .3s ease forwards'
    setTimeout(() => toast.remove(), 300)
  }, duration)
}
