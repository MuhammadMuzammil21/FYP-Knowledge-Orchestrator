import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { TrustBar } from '@/components/landing/TrustBar';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { DemoSection } from '@/components/landing/DemoSection';
import { StatsSection } from '@/components/landing/StatsSection';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { PricingSection } from '@/components/landing/PricingSection';
import { FAQSection } from '@/components/landing/FAQSection';
import { CTASection } from '@/components/landing/CTASection';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { ScrollReveal } from '@/components/landing/ScrollReveal';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNavbar />
      <main>
        <HeroSection />
        {/* <TrustBar /> */}
        <ScrollReveal variant="fade-up">
          <FeaturesSection />
        </ScrollReveal>
        <ScrollReveal variant="fade-up">
          <HowItWorksSection />
        </ScrollReveal>
        <ScrollReveal variant="fade">
          <DemoSection />
        </ScrollReveal>
        {/* <StatsSection /> */}
        {/* <TestimonialsSection /> */}
        <ScrollReveal variant="fade-up">
          <PricingSection />
        </ScrollReveal>
        <ScrollReveal variant="fade-up">
          <FAQSection />
        </ScrollReveal>
        <ScrollReveal variant="scale">
          <CTASection />
        </ScrollReveal>
      </main>
      <ScrollReveal variant="fade">
        <LandingFooter />
      </ScrollReveal>
    </div>
  );
}
