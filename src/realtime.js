import { supabase } from './supabase.js'

let channel = null

// incidents 테이블 변경 구독
export function subscribeRealtime(onInsert, onUpdate) {
  if (channel) return // 이미 구독 중

  channel = supabase
    .channel('incidents-changes')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'incidents' },
      payload => onInsert(payload.new)
    )
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'incidents' },
      payload => onUpdate(payload.new)
    )
    .subscribe()
}

export function unsubscribeRealtime() {
  if (channel) {
    supabase.removeChannel(channel)
    channel = null
  }
}
