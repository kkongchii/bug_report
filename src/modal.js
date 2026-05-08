const esc = s => String(s ?? '').replace(/[&<>"']/g, c =>
  ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))

const SEVERITY_COLOR = { high: '#c44a2a', mid: '#d99752', low: '#6b8fc9' }
const SEVERITY_KO    = { high: '상', mid: '중', low: '하' }
const STATUS_KO      = { received: '접수', processing: '처리중', done: '완료' }
const STATUS_COLOR   = { received: '#8a8278', processing: '#c44a2a', done: '#5ea870' }

export function showModal(title, incidents) {
  document.getElementById('modal-title').textContent = `${title} · ${incidents.length}건`

  const body = document.getElementById('modal-body')

  if (incidents.length === 0) {
    body.innerHTML = '<div class="modal-empty">해당 조건의 장애가 없습니다.</div>'
  } else {
    body.innerHTML = `
      <table class="incidents-table">
        <thead>
          <tr><th>제목</th><th>발생일시</th><th>심각도</th><th>상태</th><th>담당자</th><th>본부/팀</th></tr>
        </thead>
        <tbody>
          ${incidents.map(r => `
            <tr class="clickable-row modal-incident-row" data-id="${r.id}">
              <td>${esc(r.title)}</td>
              <td>${new Date(r.occurred_at).toLocaleString('ko-KR')}</td>
              <td><span class="pill" style="background:${SEVERITY_COLOR[r.severity]};color:#fff">${SEVERITY_KO[r.severity]}</span></td>
              <td><span class="pill ghost" style="color:${STATUS_COLOR[r.status]}">${STATUS_KO[r.status]}</span></td>
              <td>${esc(r.assignee ?? '-')}</td>
              <td>${esc(r.department ?? '-')}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `
  }

  document.getElementById('chart-modal').classList.remove('hidden')
}

export function hideModal() {
  document.getElementById('chart-modal').classList.add('hidden')
}

export function initModal() {
  const overlay = document.getElementById('chart-modal')

  document.getElementById('modal-close').addEventListener('click', hideModal)

  // 오버레이 클릭 시 닫기
  overlay.addEventListener('click', e => {
    if (e.target === overlay) hideModal()
  })

  // 팝업 내 장애 행 클릭 → 상세 페이지
  document.getElementById('modal-body').addEventListener('click', e => {
    const row = e.target.closest('.modal-incident-row')
    if (!row) return
    hideModal()
    window.location.hash = `#detail/${row.dataset.id}`
  })
}
