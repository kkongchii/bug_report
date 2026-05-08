import { supabase } from './supabase.js'
import { showToast } from './main.js'

const esc = s => String(s ?? '').replace(/[&<>"']/g, c =>
  ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))

const SEVERITY_COLOR = { high: '#c44a2a', mid: '#d99752', low: '#6b8fc9' }
const SEVERITY_KO    = { high: '상', mid: '중', low: '하' }
const STATUS_KO      = { received: '접수', processing: '처리중', done: '완료' }
const STATUS_COLOR   = { received: '#8a8278', processing: '#c44a2a', done: '#5ea870' }

function row(label, value) {
  return `
    <div class="detail-row">
      <div class="detail-label">${label}</div>
      <div class="detail-value">${value}</div>
    </div>
  `
}

export async function initDetail(id) {
  const titleEl = document.getElementById('detail-title')
  const body    = document.getElementById('detail-body')
  titleEl.textContent = '불러오는 중…'
  body.innerHTML = ''

  const { data: r, error } = await supabase
    .from('incidents')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !r) {
    showToast('장애 정보를 불러오지 못했습니다.')
    titleEl.textContent = '불러오기 실패'
    return
  }

  titleEl.textContent = r.title

  const severityBadge = `<span class="pill" style="background:${SEVERITY_COLOR[r.severity]};color:#fff">${SEVERITY_KO[r.severity]}</span>`
  const statusBadge   = `<span class="pill ghost" style="color:${STATUS_COLOR[r.status]}">${STATUS_KO[r.status]}</span>`

  body.innerHTML = `
    <div class="detail-grid">
      ${row('발생일시', new Date(r.occurred_at).toLocaleString('ko-KR'))}
      ${row('심각도',   severityBadge)}
      ${row('상태',     statusBadge)}
      ${row('담당자',   esc(r.assignee   ?? '—'))}
      ${row('본부/팀',  esc(r.department ?? '—'))}
      ${row('원인',     `<span class="detail-text">${esc(r.cause      ?? '—')}</span>`)}
      ${row('해결내용', `<span class="detail-text">${esc(r.resolution ?? '—')}</span>`)}
    </div>
  `
}
