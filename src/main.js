import { initDashboard } from './dashboard.js'
import { initForm } from './form.js'
import { initList } from './list.js'

// 토스트 메시지 표시
export function showToast(message) {
  const toast = document.getElementById('toast')
  toast.textContent = message
  toast.classList.remove('hidden')
  setTimeout(() => toast.classList.add('hidden'), 3000)
}

// 탭 전환
function activateTab(tabName) {
  document.querySelectorAll('.tab-panel').forEach(el => el.classList.add('hidden'))
  document.querySelectorAll('.tab-link').forEach(el => el.classList.remove('active'))

  const panel = document.getElementById(`tab-${tabName}`)
  const link = document.querySelector(`.tab-link[data-tab="${tabName}"]`)
  if (panel) panel.classList.remove('hidden')
  if (link) link.classList.add('active')

  if (tabName === 'dashboard') initDashboard()
  if (tabName === 'register') initForm()
  if (tabName === 'list') initList()
}

// 해시 기반 라우팅
function route() {
  const hash = window.location.hash.replace('#', '') || 'dashboard'
  activateTab(hash)
}

window.addEventListener('hashchange', route)
document.addEventListener('DOMContentLoaded', route)
