'use client'
import { useState } from 'react'
import { CATEGORY_LABEL } from '@/lib/constants/categories'

export type AiSuggestion = {
  category?: string
  title?: string
  estimated_price_eur?: number | null
  tags?: string[]
}

/**
 * AI 识别建议卡片。用户上传第一张图后由 PublishForm 调用 /api/ai/analyze-listing 后渲染。
 * 每项都可单独 [采用] 或一键 [全部采用]，不强制覆盖用户已填内容。
 */
export function AiSuggestionCard({
  loading,
  suggestion,
  currentTitle,
  currentCategory,
  currentPrice,
  onApplyTitle,
  onApplyCategory,
  onApplyPrice,
  onApplyAll,
  onDismiss,
}: {
  loading: boolean
  suggestion: AiSuggestion | null
  currentTitle: string
  currentCategory: string
  currentPrice: string
  onApplyTitle: (title: string) => void
  onApplyCategory: (category: string) => void
  onApplyPrice: (price: string) => void
  onApplyAll: () => void
  onDismiss: () => void
}) {
  const [dismissed, setDismissed] = useState(false)
  if (dismissed) return null

  if (loading) {
    return (
      <div className="border border-brand-line-2 rounded-2xl px-4 py-3.5 bg-brand-yellow-soft flex items-center gap-3 animate-card-rise">
        <SparkleIcon className="w-4 h-4 animate-sparkle-breathe text-brand-ink shrink-0" />
        <span className="text-[13px] text-brand-ink-soft">
          AI 看图中…几秒后给你标题、分类、估价建议
        </span>
      </div>
    )
  }

  if (!suggestion) return null

  const titleApplied = currentTitle === suggestion.title
  const categoryApplied = currentCategory === suggestion.category
  const priceApplied =
    suggestion.estimated_price_eur !== null &&
    suggestion.estimated_price_eur !== undefined &&
    currentPrice === String(suggestion.estimated_price_eur)

  return (
    <div className="border border-brand-line-2 rounded-2xl bg-brand-yellow-soft px-4 py-4 space-y-3 animate-card-rise">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SparkleIcon className="w-4 h-4 text-brand-ink" />
          <span className="text-[13px] font-semibold text-brand-ink">
            AI 给你拟了个建议
          </span>
        </div>
        <button
          type="button"
          onClick={() => {
            setDismissed(true)
            onDismiss()
          }}
          className="text-[11px] text-brand-muted hover:text-brand-ink"
          aria-label="关闭建议"
        >
          忽略 ×
        </button>
      </div>

      <div className="space-y-2 text-[13px]">
        {suggestion.title && (
          <SuggestionRow
            label="标题"
            value={suggestion.title}
            applied={titleApplied}
            onApply={() => onApplyTitle(suggestion.title!)}
          />
        )}
        {suggestion.category && (
          <SuggestionRow
            label="分类"
            value={CATEGORY_LABEL[suggestion.category] || suggestion.category}
            applied={categoryApplied}
            onApply={() => onApplyCategory(suggestion.category!)}
          />
        )}
        {suggestion.estimated_price_eur !== null &&
          suggestion.estimated_price_eur !== undefined && (
            <SuggestionRow
              label="估价"
              value={`€${suggestion.estimated_price_eur}`}
              applied={priceApplied}
              onApply={() => onApplyPrice(String(suggestion.estimated_price_eur))}
            />
          )}
        {suggestion.tags && suggestion.tags.length > 0 && (
          <div className="flex items-baseline gap-3">
            <span className="text-brand-muted shrink-0 w-9">标签</span>
            <span className="flex flex-wrap gap-1.5">
              {suggestion.tags.map((t) => (
                <span
                  key={t}
                  className="text-[11px] px-2 py-0.5 rounded-pill border border-brand-line-3 text-brand-ink-soft bg-white"
                >
                  {t}
                </span>
              ))}
            </span>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={onApplyAll}
        className="w-full bg-brand-ink text-white rounded-pill py-2 text-[12px] font-medium hover:opacity-85 active:translate-y-px transition-all duration-150"
      >
        全部采用
      </button>
      <p className="text-[10px] text-brand-muted leading-relaxed">
        AI 仅供参考，发布前请核对。错的可以手动改。
      </p>
    </div>
  )
}

function SuggestionRow({
  label,
  value,
  applied,
  onApply,
}: {
  label: string
  value: string
  applied: boolean
  onApply: () => void
}) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="text-brand-muted shrink-0 w-9">{label}</span>
      <span className="flex-1 text-brand-ink font-medium leading-tight">{value}</span>
      {applied ? (
        <span className="text-[11px] text-brand-free shrink-0">✓ 已采用</span>
      ) : (
        <button
          type="button"
          onClick={onApply}
          className="text-[11px] underline underline-offset-2 text-brand-ink-soft hover:text-brand-ink shrink-0"
        >
          采用
        </button>
      )}
    </div>
  )
}

function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z" />
      <path d="M19 14L19.7 16.3L22 17L19.7 17.7L19 20L18.3 17.7L16 17L18.3 16.3L19 14Z" />
    </svg>
  )
}
