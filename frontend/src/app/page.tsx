import { LandingNavbar } from '@/components/landing/LandingNavbar'
import { HeroSection } from '@/components/landing/HeroSection'
import { TrustBar } from '@/components/landing/TrustBar'
import { FeaturesSection } from '@/components/landing/FeaturesSection'
import { HowItWorksSection } from '@/components/landing/HowItWorksSection'
import { DemoSection } from '@/components/landing/DemoSection'
import { StatsSection } from '@/components/landing/StatsSection'
import { TestimonialsSection } from '@/components/landing/TestimonialsSection'
import { PricingSection } from '@/components/landing/PricingSection'
import { FAQSection } from '@/components/landing/FAQSection'
import { CTASection } from '@/components/landing/CTASection'
import { LandingFooter } from '@/components/landing/LandingFooter'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNavbar />
      <main>
        <HeroSection />
        {/* <TrustBar /> */}
        <FeaturesSection />
        <HowItWorksSection />
        <DemoSection />
        {/* <StatsSection /> */}
        {/* <TestimonialsSection /> */}
        <PricingSection />
        <FAQSection />
        <CTASection />
      </main>
      <LandingFooter />
    </div>
  )
}
