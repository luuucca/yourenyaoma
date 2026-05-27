import Hero from '@/components/home/Hero'
import CategoryGrid from '@/components/home/CategoryGrid'
import LatestListings from '@/components/home/LatestListings'
import MovingSaleSection from '@/components/home/MovingSaleSection'
import HangoutsSection from '@/components/home/HangoutsSection'
import ProsSection from '@/components/home/ProsSection'
import JobsSection from '@/components/home/JobsSection'
import FreeStuffSection from '@/components/home/FreeStuffSection'
import SafetyStepsSection from '@/components/home/SafetyStepsSection'
import TrustBadges from '@/components/home/TrustBadges'

// Section 顺序：Hero → 分类 → 附近的好物 → 搬家甩卖 → 找搭子 → 找师傅 → 找工作
// → 免费送 → 安全交易 → 信任栏. (Marquee 在 Header 顶部)
export default function HomePage() {
  return (
    <>
      <Hero />
      <CategoryGrid />
      <LatestListings />
      <MovingSaleSection />
      <HangoutsSection />
      <ProsSection />
      <JobsSection />
      <FreeStuffSection />
      <SafetyStepsSection />
      <TrustBadges />
    </>
  )
}
