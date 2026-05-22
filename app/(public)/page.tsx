import Hero from '@/components/home/Hero'
import CategoryGrid from '@/components/home/CategoryGrid'
import LatestListings from '@/components/home/LatestListings'
import MovingSaleSection from '@/components/home/MovingSaleSection'
import HangoutsSection from '@/components/home/HangoutsSection'
import ProsSection from '@/components/home/ProsSection'
import FreeStuffSection from '@/components/home/FreeStuffSection'
import SafetyStepsSection from '@/components/home/SafetyStepsSection'
import TrustBadges from '@/components/home/TrustBadges'

// The yellow marquee lives at the very top of the page (rendered by <Header>),
// not between sections. Section order here: Hero → categories → 附近的好物 →
// 搬家甩卖 → 找搭子 → 找师傅 → 免费送 → 安全交易 → 信任栏.
export default function HomePage() {
  return (
    <>
      <Hero />
      <CategoryGrid />
      <LatestListings />
      <MovingSaleSection />
      <HangoutsSection />
      <ProsSection />
      <FreeStuffSection />
      <SafetyStepsSection />
      <TrustBadges />
    </>
  )
}
