import { ImageResponse } from 'next/og'

// Default OG image for the root + most pages. Generated server-side at build
// time using next/og — no need for a static PNG asset.
// Override per-route by adding an opengraph-image.tsx in that route folder.

export const runtime = 'edge'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = '有人要吗 — 海外华人邻里社区'

export default async function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#FAF8F2',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '72px',
          position: 'relative',
        }}
      >
        {/* mono eyebrow */}
        <div
          style={{
            fontSize: 22,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: '#888',
            fontFamily: 'monospace',
            marginBottom: 24,
          }}
        >
          OVERSEAS · 海外华人邻里社区
        </div>

        {/* Big serif title with yellow highlight */}
        <div
          style={{
            fontSize: 120,
            fontWeight: 700,
            lineHeight: 1.02,
            letterSpacing: '-0.025em',
            color: '#0d0d0d',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div>你不要的，</div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span
              style={{
                background: 'linear-gradient(180deg, transparent 60%, #F4C300 60%, #F4C300 92%, transparent 92%)',
                padding: '0 8px',
              }}
            >
              正好有人要
            </span>
          </div>
        </div>

        <div
          style={{
            fontSize: 28,
            color: '#555',
            marginTop: 36,
            lineHeight: 1.5,
          }}
        >
          闲置二手 · 靠谱师傅 · 同城搭子
        </div>

        {/* brand corner */}
        <div
          style={{
            position: 'absolute',
            bottom: 60,
            right: 72,
            fontSize: 32,
            fontWeight: 700,
            color: '#0d0d0d',
            display: 'flex',
            alignItems: 'baseline',
            gap: 8,
          }}
        >
          有人要吗
          <div
            style={{
              width: 12,
              height: 12,
              background: '#F4C300',
              borderRadius: 2,
            }}
          />
        </div>
      </div>
    ),
    { ...size },
  )
}
