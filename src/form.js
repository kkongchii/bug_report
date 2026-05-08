import { supabase } from './supabase.js'
import { showToast } from './main.js'

export function initForm() {
  const form = document.getElementById('incident-form')
  // 중복 이벤트 방지
  form.onsubmit = handleSubmit
}

async function handleSubmit(e) {
  e.preventDefault()
  const fd = new FormData(e.target)

  // 필수 필드 유효성 검사
  const title = fd.get('title').trim()
  const occurred_at = fd.get('occurred_at')
  const severity = fd.get('severity')
  const status = fd.get('status')

  if (!title || !occurred_at || !severity || !status) {
    showToast('필수 항목을 모두 입력해주세요.')
    return
  }

  const payload = {
    title,
    occurred_at: new Date(occurred_at).toISOString(),
    severity,
    status,
    assignee: fd.get('assignee').trim() || null,
    department: fd.get('department').trim() || null,
    cause: fd.get('cause').trim() || null,
    resolution: fd.get('resolution').trim() || null,
  }

  const { error } = await supabase.from('incidents').insert(payload)

  if (error) {
    showToast('등록 실패: ' + error.message)
    return
  }

  e.target.reset()
  window.location.hash = 'list'
}
