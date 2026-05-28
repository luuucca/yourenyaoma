/* 有人要吗 Service Worker
 * 职责：
 *  1. Web Push — 收到推送显示通知，点击跳转对应页面
 *  2. 轻量离线兜底 — 缓存核心 shell，断网时已访问页可看
 *
 * 注意：故意保持简单。不做激进的 stale-while-revalidate 全站缓存，
 * 避免开发期缓存把新代码挡住。主要价值是 push。
 */

const CACHE = 'yrym-v1'
const SHELL = ['/', '/offline']

self.addEventListener('install', (event) => {
  self.skipWaiting()
  event.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(SHELL)).catch(() => {}),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  )
})

// 仅对导航请求做离线兜底；其它请求走网络（不缓存 API / 动态数据）
self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return
  if (request.mode !== 'navigate') return

  event.respondWith(
    fetch(request).catch(() =>
      caches.match(request).then((cached) => cached || caches.match('/offline')),
    ),
  )
})

// 收到推送
self.addEventListener('push', (event) => {
  let data = {}
  try {
    data = event.data ? event.data.json() : {}
  } catch (_) {
    data = { title: '有人要吗', body: event.data ? event.data.text() : '' }
  }

  const title = data.title || '有人要吗'
  const options = {
    body: data.body || '',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: data.tag || undefined, // 同 tag 的通知会合并，避免刷屏
    data: { url: data.url || '/' },
    vibrate: [80, 40, 80],
  }
  event.waitUntil(self.registration.showNotification(title, options))
})

// 点击通知 — 聚焦已有标签页或新开
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = (event.notification.data && event.notification.data.url) || '/'
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if ('focus' in client) {
          client.navigate(url)
          return client.focus()
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(url)
    }),
  )
})
