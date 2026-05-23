'use client'

// Top-level error boundary for the ROOT layout itself failing (rare). Has to
// render its own <html><body> because no parent layout is available.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="zh-CN">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          background: '#ffffff',
          color: '#0d0d0d',
          padding: '24px',
        }}
      >
        <div style={{ maxWidth: 480, textAlign: 'center' }}>
          <div style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#888', marginBottom: 16 }}>
            site-level error
          </div>
          <h1 style={{ fontSize: 40, fontWeight: 700, margin: 0, letterSpacing: '-0.025em' }}>
            网站挂了一下
          </h1>
          <p style={{ marginTop: 16, color: '#444', lineHeight: 1.6 }}>
            底层组件加载失败。请刷新页面，若持续出问题请联系管理员。
          </p>
          {error?.digest && (
            <p style={{ marginTop: 8, fontSize: 11, fontFamily: 'monospace', color: '#888' }}>
              错误编号：{error.digest}
            </p>
          )}
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: 24,
              padding: '12px 24px',
              background: '#0d0d0d',
              color: 'white',
              border: 0,
              borderRadius: 999,
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            重试
          </button>
        </div>
      </body>
    </html>
  )
}
