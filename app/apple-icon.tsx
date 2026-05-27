import { ImageResponse } from 'next/og'

// iOS / iPadOS 「添加到主屏幕」生成的图标。Apple 不接受 SVG，所以走 ImageResponse PNG。
// Apple 自己会加圆角，所以这里只画方形即可。
export const runtime = 'edge'
export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#0d0d0d',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#F4C300',
          fontSize: 130,
          fontWeight: 800,
          fontFamily: 'serif',
        }}
      >
        要
      </div>
    ),
    { ...size },
  )
}
