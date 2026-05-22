# 有人要吗 — 维也纳华人二手闲置交易平台

> 你不要的，正好有人要。

面向维也纳本地华人社区的二手闲置发布、浏览、自取交易平台。第一版仅提供信息发布 / 展示 / 搜索 / 联系 / 审核，不做担保交易、平台支付或抽佣。

## 技术栈

- **Next.js 14**（App Router）
- **Supabase**（Postgres / Auth / Storage）
- **Tailwind CSS**
- **Vercel**（部署）

## 第一次启动

### 1. 装依赖

```bash
cd C:\Users\ASUS\youren-yaoma
npm install
```

### 2. 创建 Supabase 项目

1. 打开 https://supabase.com/dashboard
2. New project，选 `eu-central-1`（法兰克福）或 `eu-west-2`，密码自己存好
3. 等待 Provisioning 完成（~2 分钟）
4. 进入 **Settings → API**，记下：
   - `Project URL`
   - `anon` `public` key
   - `service_role` key（仅服务端使用）

### 3. 跑 migrations

打开 Supabase Dashboard → **SQL Editor → New query**，依次复制粘贴执行：

1. `supabase/migrations/001_init_schema.sql`
2. `supabase/migrations/002_rls_policies.sql`
3. `supabase/migrations/003_seed_blocked_words.sql`
4. `supabase/migrations/004_helper_functions.sql`

### 4. 配置 Auth 邮件

Supabase Dashboard → **Authentication → URL Configuration**：

- **Site URL**：`http://localhost:3000`（开发）/ `https://你的域名.com`（生产）
- **Redirect URLs**：加入 `http://localhost:3000/auth/callback` 和生产域名的 `/auth/callback`

**Authentication → Email Templates** 里把模板里的中文/品牌名替换一下（可选）。

### 5. 创建 `.env.local`

```bash
cp .env.local.example .env.local
```

填入 Supabase 的 URL 和 key：

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhb...
SUPABASE_SERVICE_ROLE_KEY=eyJhb...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 6. 启动 dev server

```bash
npm run dev
```

打开 http://localhost:3000，应该能看到首页。

## 把自己设为管理员

1. 在网站正常注册一个账号（用你想做管理员的邮箱）
2. 点击邮件里的链接完成验证
3. 打开 Supabase Dashboard → **SQL Editor**，跑：

```sql
update profiles
   set role = 'admin'
 where id = (select id from auth.users where email = '你的邮箱@xxx.com');
```

4. 退出再重新登录，就能在「我的」页面看到「🛡️ 管理员后台」入口

## 项目结构

```
youren-yaoma/
├── app/                          # Next.js App Router
│   ├── (public)/                 # 公开页（首页/浏览/详情/规则/关于）
│   ├── (auth)/                   # 登录/注册/验证
│   ├── (user)/                   # 需登录（发布/我的）
│   ├── (admin)/                  # 需管理员（审核/举报/用户）
│   ├── api/                      # API routes
│   └── auth/callback/            # Supabase 邮件验证回调
├── components/
│   ├── layout/ home/ listing/ publish/ user/ admin/ ui/
├── lib/
│   ├── supabase/                 # 客户端/服务端/middleware client
│   ├── constants/                # 分类/成色/区域/举报原因
│   ├── moderation/               # 违禁词检查
│   ├── utils/                    # 工具函数
│   └── validations/              # zod schemas
├── supabase/migrations/          # 数据库迁移
├── middleware.ts                 # 路由保护（user / admin）
└── public/                       # 静态资源
```

## 部署到 Vercel

1. `git init && git add . && git commit -m "init"`
2. 推到 GitHub
3. https://vercel.com/new 导入项目
4. 配置环境变量（与 `.env.local` 一致，但 `NEXT_PUBLIC_SITE_URL` 改为生产域名）
5. Deploy
6. 部署完成后，把生产域名加到 Supabase Dashboard → Authentication → URL Configuration 的 Site URL 和 Redirect URLs

## 日常维护

- **新增违禁词**：在 `blocked_words` 表里 insert，立即生效
- **审核新发布**：登录管理员账号 → `/admin/pending`
- **处理举报**：`/admin/reports`，被举报 ≥2 次的商品会自动隐藏
- **看用户行为**：`/admin/users` 搜索昵称
- **看审核记录**：`/admin/logs`

## 第一版不做（已预留接口）

- 站内支付 / 担保交易 / 抽佣
- 复杂聊天系统（用微信/WhatsApp）
- 身份证 / 手机短信验证
- App
- 商品置顶 / 首页推荐 / 商家广告位（数据库字段已留：`is_featured`, `is_urgent`, `featured_until`）

## 待办（v2 候选）

- [ ] 草稿保存（status `draft` 已存在）
- [ ] 商品编辑（目前只支持删除重发）
- [ ] 德语切换
- [ ] 商品置顶付费
- [ ] 邮件通知（新举报、商品通过）
- [ ] 防爬虫加强（联系方式 token、CAPTCHA）
- [ ] 卖家信誉评分

---

**Slogan**：你不要的，正好有人要 — 让好物继续发光 ✨
