import type { MetadataRoute } from 'next'

/**
 * Web App Manifest — 让浏览器知道「这个站可以作为 PWA 安装到主屏」。
 *
 * iOS 16.4+ Safari 支持，Android Chrome 全支持，桌面 Chrome/Edge 也支持。
 *
 * 关键字段：
 * - display: 'standalone' → 安装后全屏运行（隐藏地址栏）
 * - theme_color: 顶部状态栏颜色（Android）
 * - background_color: 启动加载时背景色
 * - icons: 多尺寸 PNG（必须 192 + 512 才符合 PWA 安装条件）
 * - purpose: 'any maskable' → Android 自适应图标，系统可裁剪外框
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: '有人要吗 · 海外华人邻里社区',
    short_name: '有人要吗',
    description:
      '面向海外华人的同城邻里社区。一个平台解决四件事：闲置二手、找师傅、找搭子、找工作。',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#ffffff',
    theme_color: '#F4C300',
    lang: 'zh-CN',
    dir: 'ltr',
    categories: ['shopping', 'lifestyle', 'social'],
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    shortcuts: [
      {
        name: '发布闲置',
        short_name: '发布',
        description: '快速发布一件闲置物品',
        url: '/publish',
        icons: [{ src: '/icon-192.png', sizes: '192x192' }],
      },
      {
        name: '站内信',
        short_name: '消息',
        description: '查看未读私信',
        url: '/me/messages',
        icons: [{ src: '/icon-192.png', sizes: '192x192' }],
      },
      {
        name: '找搭子',
        short_name: '搭子',
        description: '浏览同城活动',
        url: '/buddies',
        icons: [{ src: '/icon-192.png', sizes: '192x192' }],
      },
    ],
  }
}
