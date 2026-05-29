import Image from 'next/image'
import ProsSection from '@/components/home/ProsSection'

export const metadata = {
  title: '找师傅 — 认证服务',
  description: '法定翻译、搬家、家电维修、装修、月嫂、中医——海外华人最常找的几件事，平台认证、明码标价。',
}

export default function ProsPage() {
  return (
    <main className="pt-6 pb-20">
      <div className="max-w-[1360px] mx-auto px-4 md:px-16 pt-8 pb-2 flex flex-col md:flex-row md:items-center gap-6 md:gap-10">
        <div className="md:flex-1">
          <span className="font-mono text-[11px] tracking-[0.18em] uppercase text-brand-muted">
            PROS · 找师傅
          </span>
          <h1 className="font-serif text-[40px] md:text-[56px] font-semibold tracking-[-0.02em] text-brand-ink mt-3 mb-3">
            找师傅
          </h1>
          <p className="text-[15px] text-[#555] max-w-[640px] leading-[1.6]">
            法定翻译、搬家、家电维修、装修、月嫂、中医——海外华人最常找的几件事，资质审核 · 明码标价 · 中德双语。
          </p>
        </div>
        {/* 师傅上门动图 —— 桌面在标题右侧，手机叠到标题下方 */}
        <div className="w-full md:w-[440px] shrink-0 rounded-2xl overflow-hidden border border-brand-line bg-brand-cream">
          <Image
            src="/pros-hero.webp"
            alt="师傅上门服务"
            width={800}
            height={450}
            unoptimized
            className="block w-full h-auto"
          />
        </div>
      </div>
      <ProsSection />

      {/* Onboarding CTA — until the in-app pro application flow ships, route
          aspiring 师傅 to admin via WeChat. Sits at the bottom so it doesn't
          compete with the existing pro cards above. */}
      <section className="max-w-[1360px] mx-auto px-4 md:px-16 mt-14">
        <div className="rounded-2xl border border-brand-yellow-line bg-brand-yellow-soft p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
          <div className="flex-1">
            <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-brand-ink-soft mb-2">
              申请入驻 · BECOME A PRO
            </div>
            <h2 className="font-serif text-[22px] md:text-[28px] font-bold text-brand-ink m-0 tracking-[-0.02em]">
              想成为认证师傅？
            </h2>
            <p className="text-[14px] md:text-[15px] text-brand-ink-soft leading-relaxed mt-2 mb-0">
              如果你提供翻译、搬家、维修、装修、月嫂、中医等专业服务，欢迎申请入驻。
              请联系微信{' '}
              <strong className="font-mono font-bold text-brand-ink tracking-[0.05em]">
                LUUUCCA
              </strong>{' '}
              进行专业认证。
            </p>
            <p className="text-[12px] text-brand-muted mt-2 mb-0">
              资质材料一次审核 · 通过后免费展示 · 不抽佣
            </p>
          </div>
          <a
            href="weixin://"
            className="inline-flex items-center justify-center bg-brand-ink text-white rounded-pill px-5 py-3 text-[13px] font-medium hover:opacity-85 active:translate-y-px transition-all whitespace-nowrap self-start md:self-auto"
            aria-label="复制微信号 LUUUCCA"
            onClick={undefined}
          >
            打开微信
          </a>
        </div>
      </section>
    </main>
  )
}
