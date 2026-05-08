import { supabase } from './supabase.js'
import { showToast } from './main.js'

// 목록 테이블 렌더링
function renderListTable(data) {
  const tbody = document.getElementById('list-tbody')
  if (data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#6c757d;">장애 내역이 없습니다.</td></tr>'
    return
  }
  tbody.innerHTML = data.map(r => `
    <tr>
      <td>${r.title}</td>
      <td>${new Date(r.occurred_at).toLocaleString('ko-KR')}</td>
      <td><span class="badge-${r.severity}">${{ high: '상', mid: '중', low: '하' }[r.severity]}</span></td>
      <td>${{ received: '접수', processing: '처리중', done: '완료' }[r.status]}</td>
      <td>${r.assignee ?? '-'}</td>
      <td>${r.department ?? '-'}</td>
    </tr>
  `).join('')
}

// 필터 조건으로 조회
export async function loadList(filters = {}) {
  let query = supabase
    .from('incidents')
    .select('*')
    .order('occurred_at', { ascending: false })

  if (filters.severity) query = query.eq('severity', filters.severity)
  if (filters.status) query = query.eq('status', filters.status)
  if (filters.department) query = query.ilike('department', `%${filters.department}%`)

  const { data, error } = await query

  if (error) {
    showToast('목록 로드 실패: ' + error.message)
    return
  }

  renderListTable(data)
}

// 필터 이벤트 처리
function applyFilters() {
  const filters = {
    severity: document.getElementById('filter-severity').value,
    status: document.getElementById('filter-status').value,
    department: document.getElementById('filter-department').value.trim(),
  }
  loadList(filters)
}

export function initList() {
  loadList()

  // 중복 이벤트 방지
  const severityEl = document.getElementById('filter-severity')
  const statusEl = document.getElementById('filter-status')
  const deptEl = document.getElementById('filter-department')

  severityEl.onchange = applyFilters
  statusEl.onchange = applyFilters
  deptEl.oninput = applyFilters
}
