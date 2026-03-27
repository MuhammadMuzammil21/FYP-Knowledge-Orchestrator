import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function CTASection() {
  return (
    <section className="py-32 px-4 text-center relative overflow-hidden">
      {/* Background blurs */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-[800px] w-[800px] rounded-full bg-primary/5 blur-3xl" />
      </div>
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-[400px] w-[400px] rounded-full bg-primary/[0.08] blur-2xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-2xl mx-auto">
        <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Stop losing insights to forgotten notes.
        </h2>
        <p className="mt-5 text-lg text-muted-foreground">
          Join thousands of teams turning their meetings into momentum.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/signup">
            <Button size="lg" className="w-full sm:w-auto gap-2">
              Get started for free <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="mailto:hello@harbaat.ai">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              Book a demo
            </Button>
          </Link>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          14-day free trial · No credit card required · Cancel anytime
        </p>
      </div>
    </section>
  )
}
