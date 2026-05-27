import { NextRequest } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@/lib/supabase/server'
import { CATEGORIES } from '@/lib/constants/categories'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * AI 识别商品图片，返回建议的标题、类别、标签、估价。
 *
 * 输入: { imagePath: 'user-id/uuid.webp' } — 上传到 Supabase Storage 后的路径
 * 输出: { category: 'furniture', title: '...', tags: [], estimated_price_eur: number|null }
 *
 * 用 Google Gemini 1.5 Flash（每天 1500 次免费）。无 key 时返回 503，前端静默降级。
 */
export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return Response.json(
      { error: 'GEMINI_API_KEY 未配置，跳过 AI 建议' },
      { status: 503 }
    )
  }

  // Auth gate — 只有登录用户能调
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return Response.json({ error: '请先登录' }, { status: 401 })
  }

  let body: { imagePath?: string } = {}
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'invalid JSON body' }, { status: 400 })
  }
  const { imagePath } = body
  if (!imagePath || typeof imagePath !== 'string') {
    return Response.json({ error: 'imagePath required' }, { status: 400 })
  }

  // 防越权：图片路径必须以当前用户 ID 开头
  if (!imagePath.startsWith(`${user.id}/`)) {
    return Response.json({ error: '只能识别自己上传的图' }, { status: 403 })
  }

  // 从 Supabase Storage 拉图（用 service-role 不需要，listings bucket 是 public）
  const imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/listings/${imagePath}`
  let imageBase64: string
  let mimeType = 'image/webp'
  try {
    const imgRes = await fetch(imageUrl, { cache: 'no-store' })
    if (!imgRes.ok) {
      return Response.json({ error: '图片读取失败' }, { status: 502 })
    }
    const buf = await imgRes.arrayBuffer()
    if (buf.byteLength > 4 * 1024 * 1024) {
      return Response.json({ error: '图片过大' }, { status: 413 })
    }
    imageBase64 = Buffer.from(buf).toString('base64')
    mimeType = imgRes.headers.get('content-type') || 'image/webp'
  } catch (e: any) {
    return Response.json({ error: `下载图片出错: ${e.message}` }, { status: 502 })
  }

  // 拼可用类别列表给 Gemini 看
  const categoryList = CATEGORIES.map((c) => `${c.id}(${c.label})`).join(', ')

  const prompt = `你是「有人要吗」海外华人二手交易平台的智能助手。看这张物品照片，识别后只返回一个 JSON 对象，不要任何额外文字或 markdown：

{
  "category": "从这个列表里选 1 个 id (只填 id 不填中文): ${categoryList}",
  "title": "10-25 字的中文标题。要写品牌/型号(如能看出)、状况(几成新)、关键卖点。不要废词('出售/转让/出/求')。例如: 'IKEA POÄNG 单人沙发椅，9成新', 'MacBook Pro 13寸 M1 2020 8G+256G'",
  "estimated_price_eur": 如果是常见品牌物可估个数字(整数欧元)，否则填 null,
  "tags": ["最多 4 个 2-4 字的中文短标签，比如 ['宜家','沙发','北欧']"]
}

务必：JSON 解析必须成功。category 必须是上面 id 之一。不要回答任何其他东西。`

  try {
    const ai = new GoogleGenerativeAI(apiKey)
    const model = ai.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: { responseMimeType: 'application/json' },
    })

    const result = await model.generateContent([
      prompt,
      { inlineData: { data: imageBase64, mimeType } },
    ])
    const text = result.response.text()
    let parsed: any
    try {
      parsed = JSON.parse(text)
    } catch {
      // 兜底：从文本里抓第一个 {...}
      const match = text.match(/\{[\s\S]*\}/)
      if (!match) {
        return Response.json({ error: 'AI 返回格式错误', raw: text }, { status: 502 })
      }
      parsed = JSON.parse(match[0])
    }

    // 校验 + 清洗
    const validCategoryIds = CATEGORIES.map((c) => c.id) as readonly string[]
    const category =
      typeof parsed.category === 'string' && validCategoryIds.includes(parsed.category)
        ? parsed.category
        : 'other'
    const title =
      typeof parsed.title === 'string' && parsed.title.length > 0
        ? parsed.title.slice(0, 60)
        : ''
    const estimated_price_eur =
      typeof parsed.estimated_price_eur === 'number' && parsed.estimated_price_eur >= 0
        ? Math.round(parsed.estimated_price_eur)
        : null
    const tags = Array.isArray(parsed.tags)
      ? parsed.tags.filter((t: any) => typeof t === 'string').slice(0, 4)
      : []

    return Response.json({ category, title, estimated_price_eur, tags })
  } catch (e: any) {
    // Gemini quota / rate limit / network 错误 — 静默降级
    console.error('[ai/analyze-listing] gemini error:', e.message)
    return Response.json(
      { error: e.message || 'AI 服务暂时不可用' },
      { status: 502 }
    )
  }
}
