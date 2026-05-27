'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { sendMessage, markConversationRead } from '@/app/(user)/me/messages/actions'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'

type Message = {
  id: string
  sender_id: string
  body: string
  read_at: string | null
  created_at: string
}

export function ConversationThread({
  conversationId,
  viewerId,
  initialMessages,
}: {
  conversationId: string
  viewerId: string
  initialMessages: Message[]
}) {
  const router = useRouter()
  const { show } = useToast()
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  // Realtime 订阅 — 新消息插入时实时推到本地
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(`conv:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const m = payload.new as Message
          setMessages((prev) => {
            // 去重（如果是自己发的，已经 optimistic 加过）
            if (prev.some((x) => x.id === m.id)) return prev
            return [...prev, m]
          })
          // 别人发的消息标记已读
          if (m.sender_id !== viewerId) {
            markConversationRead(conversationId)
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversationId, viewerId])

  // 新消息进来后滚到底
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages.length])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    const body = draft.trim()
    if (!body || sending) return
    setSending(true)
    const result = await sendMessage({ conversationId, body })
    setSending(false)
    if (result.error) {
      show(result.error, 'error')
      return
    }
    setDraft('')
    // 实际消息会通过 Realtime 推回；不用本地 optimistic
    router.refresh()
  }

  return (
    <div className="border border-brand-line rounded-2xl bg-white flex flex-col h-[60vh] min-h-[400px]">
      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-brand-muted text-sm gap-2">
            <span>开始对话</span>
            <span className="text-xs">先打个招呼，确认商品还在</span>
          </div>
        ) : (
          messages.map((m, i) => {
            const isMine = m.sender_id === viewerId
            const prev = messages[i - 1]
            const showTime =
              !prev || new Date(m.created_at).getTime() - new Date(prev.created_at).getTime() > 5 * 60 * 1000
            return (
              <div key={m.id}>
                {showTime && (
                  <div className="text-center text-[10px] font-mono text-brand-muted-soft my-2">
                    {formatStamp(m.created_at)}
                  </div>
                )}
                <div className={isMine ? 'flex justify-end' : 'flex justify-start'}>
                  <div
                    className={
                      isMine
                        ? 'max-w-[75%] bg-brand-ink text-white rounded-2xl rounded-br-md px-3.5 py-2 text-[14px] leading-relaxed break-words'
                        : 'max-w-[75%] bg-brand-cream text-brand-ink rounded-2xl rounded-bl-md px-3.5 py-2 text-[14px] leading-relaxed break-words'
                    }
                  >
                    {m.body}
                  </div>
                </div>
              </div>
            )
          })
        )}
        <div ref={endRef} />
      </div>

      {/* 输入框 */}
      <form
        onSubmit={handleSend}
        className="border-t border-brand-line px-3 py-2.5 flex gap-2 items-end"
      >
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSend(e)
            }
          }}
          placeholder="输入消息… (Enter 发送，Shift+Enter 换行)"
          rows={1}
          maxLength={2000}
          className="flex-1 resize-none px-3 py-2 text-[14px] bg-transparent outline-none placeholder:text-brand-muted-soft leading-relaxed max-h-32"
        />
        <Button type="submit" size="sm" loading={sending} disabled={!draft.trim()}>
          发送
        </Button>
      </form>

      <div className="border-t border-brand-line px-4 py-2 text-[10px] text-brand-muted-soft">
        ⚠ 在平台聊熟悉后再换微信。提前转账、奇怪链接、要求换平台谈判都是骗子常用套路。
      </div>
    </div>
  )
}

function formatStamp(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }
  return d.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}
