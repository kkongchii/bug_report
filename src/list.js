import { supabase } from './supabase.js'
import { showToast } from './main.js'

const esc = s => String(s ?? '').replace(/[&<>"']/g, c =>
  ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))

const SEVERITY_COLOR = { high: '#c44a2a', mid: '#d99752', low: '#6b8fc9' }
const SEVERITY_KO    = { high: '상', mid: '중', low: '하' }
const STATUS_KO      = { received: '접수', processing: '처리중', done: '완료' }
const STATUS_COLOR   = { received: '#8a8278', processing: '#c44a2a', done: '#5ea870' }

let listListenerAdded = false

function renderListTable(data) {
  const tbody = document.getElementById('list-tbody')
  if (data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--ink-3);padding:32px">장애 내역이 없습니다.</td></tr>'
    return
  }
  tbody.innerHTML = data.map(r => `
    <tr class="clickable-row" data-id="${r.id}">
      <td>${esc(r.title)}</td>
      <td>${new Date(r.occurred_at).toLocaleString('ko-KR')}</td>
      <td><span class="pill" style="background:${SEVERITY_COLOR[r.severity]};color:#fff">${SEVERITY_KO[r.severity]}</span></td>
      <td><span class="pill ghost" style="color:${STATUS_COLOR[r.status]}">${STATUS_KO[r.status]}</span></td>
      <td>${esc(r.assignee ?? '-')}</td>
      <td>${esc(r.department ?? '-')}</td>
    </tr>
  `).join('')
}

export async function loadList(filters = {}) {
  let query = supabase
    .from('incidents')
    .select('*')
    .order('occurred_at', { ascending: false })

  if (filters.severity)   query = query.eq('severity', filters.severity)
  if (filters.status)     query = query.eq('status', filters.status)
  if (filters.department) query = query.ilike('department', `%${filters.department}%`)

  const { data, error } = await query

  if (error) {
    showToast('목록 로드 실패: ' + error.message)
    return
  }

  renderListTable(data)
}

function applyFilters() {
  const filters = {
    severity:   document.getElementById('filter-severity').value,
    status:     document.getElementById('filter-status').value,
    department: document.getElementById('filter-department').value.trim(),
  }
  loadList(filters)
}

export function initList() {
  if (!listListenerAdded) {
    document.getElementById('list-tbody').addEventListener('click', e => {
      const row = e.target.closest('.clickable-row')
      if (row) window.location.hash = `#detail/${row.dataset.id}`
    })
    listListenerAdded = true
  }

  loadList()

  document.getElementById('filter-severity').onchange  = applyFilters
  document.getElementById('filter-status').onchange    = applyFilters
  document.getElementById('filter-department').oninput = applyFilters
}
