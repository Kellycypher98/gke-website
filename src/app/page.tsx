import HeroSection from '@/components/HeroSection'
import FeaturedEvents from '@/components/FeaturedEvents'
import BrandPreview from '@/components/BrandPreview'
import NewsletterSignup from '@/components/NewsletterSignup'
import StatsSection from '@/components/StatsSection'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      {/* <StatsSection /> */}
      {/* <BrandPreview />*/}
      <FeaturedEvents />
      <NewsletterSignup />
    </div>
  )
}
