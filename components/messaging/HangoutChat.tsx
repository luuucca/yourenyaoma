'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { sendHangoutMessage } from '@/app/(public)/buddies/[id]/actions'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'

type Message = {
  id: string
  sender_id: string
  body: string
  created_at: string
}

/**
 * 搭子群聊面板。
 * - 历史消息从 server 端传入 initialMessages
 * - Supabase Realtime 订阅 hangout_messages where hangout_id=...
 * - 不同 sender 用不同气泡颜色区分（自己/host/其他参与者）
 * - participantMap 把 sender_id → nickname 映射（新加入的人发消息会显示「邻居」直到下次刷新）
 */
export function HangoutChat({
  hangoutId,
  viewerId,
  hostId,
  initialMessages,
  participantMap,
}: {
  hangoutId: string
  viewerId: string
  hostId: string
  initialMessages: Message[]
  participantMap: Record<string, string> // sender_id -> nickname
}) {
  const router = useRouter()
  const { show } = useToast()
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  // Realtime 订阅
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(`hangout:${hangoutId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'hangout_messages',
          filter: `hangout_id=eq.${hangoutId}`,
        },
        (payload) => {
          const m = payload.new as Message
          setMessages((prev) => {
            if (prev.some((x) => x.id === m.id)) return prev
            return [...prev, m]
          })
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [hangoutId])

  // 新消息进来后滚到底
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages.length])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    const body = draft.trim()
    if (!body || sending) return
    setSending(true)
    const result = await sendHangoutMessage({ hangoutId, body })
    setSending(false)
    if (result.error) {
      show(result.error, 'error')
      return
    }
    setDraft('')
    // 乐观把刚插入的消息追到本地 state — 立即看见自己发的内容。
    // Realtime 兜底（如果也推回来同一条，ID 去重不会重复显示）。
    if (result.message) {
      setMessages((prev) => {
        if (prev.some((x) => x.id === result.message!.id)) return prev
        return [...prev, result.message!]
      })
    }
  }

  return (
    <section className="mt-10">
      <div className="flex items-baseline justify-between mb-3">
        <h3 className="font-serif text-[18px] font-bold text-brand-ink">群聊</h3>
        <span className="text-[11px] font-mono text-brand-muted tracking-[0.05em]">
          {Object.keys(participantMap).length} 人 · 实时
        </span>
      </div>

      <div className="border border-brand-line rounded-2xl bg-white flex flex-col h-[60vh] min-h-[400px] overflow-hidden">
        {/* 消息流 */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-brand-muted text-sm gap-2">
              <span>群聊已开通</span>
              <span className="text-xs">第一个发消息的人 ✨</span>
            </div>
          ) : (
            messages.map((m, i) => {
              const isMine = m.sender_id === viewerId
              const isHost = m.sender_id === hostId
              const prev = messages[i - 1]
              const showStamp =
                !prev ||
                new Date(m.created_at).getTime() -
                  new Date(prev.created_at).getTime() >
                  5 * 60 * 1000
              const senderName =
                participantMap[m.sender_id] ||
                (isMine ? '你' : '邻居')
              const showSenderHeader =
                !prev || prev.sender_id !== m.sender_id || showStamp

              return (
                <div key={m.id}>
                  {showStamp && (
                    <div className="text-center text-[10px] font-mono text-brand-muted-soft my-2">
                      {formatStamp(m.created_at)}
                    </div>
                  )}
                  <div
                    className={
                      isMine ? 'flex flex-col items-end' : 'flex flex-col items-start'
                    }
                  >
                    {/* 发送者名（自己不显示） */}
                    {!isMine && showSenderHeader && (
                      <div className="text-[11px] text-brand-muted px-1 mb-1">
                        {senderName}
                        {isHost && (
                          <span className="ml-1.5 text-[10px] text-brand-yellow font-medium">
                            · 发起人
                          </span>
                        )}
                      </div>
                    )}
                    <div
                      className={
                        isMine
                          ? 'max-w-[75%] bg-brand-ink text-white rounded-2xl rounded-br-md px-3.5 py-2 text-[14px] leading-relaxed break-words'
                          : isHost
                            ? 'max-w-[75%] bg-brand-yellow-soft text-brand-ink rounded-2xl rounded-bl-md px-3.5 py-2 text-[14px] leading-relaxed break-words border border-brand-yellow-line'
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
          <Button
            type="submit"
            size="sm"
            loading={sending}
            disabled={!draft.trim()}
          >
            发送
          </Button>
        </form>

        <div className="border-t border-brand-line px-4 py-2 text-[10px] text-brand-muted-soft">
          ⚠ 公共场所碰面，AA 提前讲清楚。退出活动后无法继续读群聊。
        </div>
      </div>
    </section>
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
