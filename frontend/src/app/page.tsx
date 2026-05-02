import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { DemoSection } from '@/components/landing/DemoSection';
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
        <ScrollReveal variant="fade-up">
          <FeaturesSection />
        </ScrollReveal>
        <ScrollReveal variant="fade">
          <DemoSection />
        </ScrollReveal>
        <ScrollReveal variant="fade-up">
          <HowItWorksSection />
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
