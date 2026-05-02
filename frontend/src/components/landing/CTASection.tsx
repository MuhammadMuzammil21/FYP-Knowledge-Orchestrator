import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CTASection() {
  return (
    <section className="py-32 px-4 relative overflow-hidden bg-card border-y border-border">
      {/* Background blurs */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-primary/8 blur-3xl" />
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}
        />
      </div>

      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent z-10" />

      {/* Content */}
      <div className="relative z-20 max-w-3xl mx-auto flex flex-col items-center">
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-800 tracking-tight hero-headline text-foreground text-center">
          Stop losing insights to forgotten notes.
        </h2>
        <p className="mt-5 text-lg md:text-xl text-muted-foreground text-center max-w-xl mx-auto font-sans">
          Join thousands of teams turning their meetings into momentum.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4 w-full sm:w-auto">
          <Link href="/signup" className="w-full sm:w-auto">
            <Button size="lg" className="w-full bg-primary text-primary-foreground btn-shimmer rounded-full px-8 py-6 text-base font-medium gap-2">
              Get started for free
            </Button>
          </Link>
          <Link href="mailto:hello@harbaat.ai" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full border-border/80 text-foreground hover:border-primary/40 rounded-full px-8 py-6 text-base font-medium">
              Book a demo
            </Button>
          </Link>
        </div>

        {/* Stats Row */}
        <div className="mt-16 grid grid-cols-3 gap-2 sm:gap-0 w-full max-w-3xl mx-auto border-t border-border/50 pt-8">
          <div className="text-center border-r border-border/50 px-1 sm:px-4">
            <div className="font-display text-xl sm:text-3xl font-800 text-foreground">500+</div>
            <div className="text-xs sm:text-sm text-muted-foreground font-sans mt-1">Teams</div>
          </div>
          <div className="text-center border-r border-border/50 px-1 sm:px-4">
            <div className="font-display text-xl sm:text-3xl font-800 text-foreground">10k+</div>
            <div className="text-xs sm:text-sm text-muted-foreground font-sans mt-1">Hours</div>
          </div>
          <div className="text-center px-1 sm:px-4">
            <div className="font-display text-xl sm:text-3xl font-800 text-foreground">99%</div>
            <div className="text-xs sm:text-sm text-muted-foreground font-sans mt-1">Accuracy</div>
          </div>
        </div>
      </div>
    </section>
  );
}
