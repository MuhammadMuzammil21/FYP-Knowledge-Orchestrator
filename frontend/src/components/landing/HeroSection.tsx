import Link from 'next/link'
import { ArrowRight, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function HeroSection() {
  return (
    <section className="min-h-[88vh] flex flex-col items-center justify-center text-center px-4 pt-16 pb-24 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-[600px] w-[600px] rounded-full bg-primary/5 blur-3xl animate-hero-glow" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Announcement badge */}
        <div className="animate-hero-badge inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/60 px-4 py-1.5 text-sm text-muted-foreground backdrop-blur-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          Now in early access — join 500+ teams
        </div>

        {/* Headline */}
        <h1 className="animate-hero-headline mt-6 text-5xl font-bold tracking-tight leading-[1.08] sm:text-6xl md:text-7xl max-w-3xl">
          Your meetings,{' '}
          <span className="bg-gradient-to-r from-[oklch(0.88_0.05_150)] via-[oklch(0.65_0.12_195)] to-[oklch(0.88_0.05_150)] bg-clip-text text-transparent">
            finally understood.
          </span>
        </h1>

        {/* Subheadline */}
        <p className="animate-hero-sub mt-5 max-w-xl text-lg text-muted-foreground sm:text-xl leading-relaxed">
          Upload any recording. Get transcripts, decisions, action items, and AI-powered answers — automatically, in minutes.
        </p>

        {/* CTA buttons */}
        <div className="animate-hero-cta mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/signup">
            <Button size="lg" className="w-full sm:w-auto gap-2">
              Start for free <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="#how-it-works">
            <Button variant="outline" size="lg" className="w-full sm:w-auto gap-2">
              <Play className="h-4 w-4" /> See how it works
            </Button>
          </Link>
        </div>

        {/* Micro-trust line */}
        <p className="mt-4 text-xs text-muted-foreground flex flex-wrap items-center justify-center gap-3">
          <span>No credit card required</span>
          <span className="h-px w-3 bg-border" />
          <span>MP3 · WAV · M4A · OGG</span>
          <span className="h-px w-3 bg-border" />
          <span>100MB max upload</span>
        </p>

        {/* Product mockup */}
        <div className="mt-16 w-full max-w-4xl mx-auto">
          {/* Browser chrome */}
          <div className="rounded-t-xl border border-border/60 bg-muted/80 px-4 py-3 flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-border" />
              <div className="h-3 w-3 rounded-full bg-border" />
              <div className="h-3 w-3 rounded-full bg-border" />
            </div>
            <div className="mx-auto flex-1 max-w-sm rounded-md border border-border/40 bg-background/60 px-3 py-1 text-xs text-muted-foreground text-center">
              app.harbaat.ai/meetings/e3f9a1
            </div>
          </div>
          {/* Mockup content */}
          <div className="rounded-b-xl border border-t-0 border-border/60 bg-card/80 backdrop-blur-sm shadow-2xl shadow-primary/5 overflow-hidden">
            {/* Meeting header */}
            <div className="border-b border-border px-6 py-4 flex items-center justify-between">
              <div className="text-left">
                <h3 className="font-semibold text-sm">Q4 product review</h3>
                <p className="text-xs text-muted-foreground mt-0.5">December 10, 2025 · 2 speakers detected</p>
              </div>
              <Badge className="bg-accent/15 text-accent dark:bg-accent/20 border-transparent">
                Completed
              </Badge>
            </div>
            {/* Transcript preview */}
            <div className="px-6 py-4 space-y-3 text-sm max-h-48 overflow-hidden text-left">
              <div>
                <span className="font-medium text-primary">Sarah:</span>{' '}
                <span className="text-muted-foreground">The Q4 numbers are looking strong. We need to decide on the launch date before end of week.</span>
              </div>
              <div>
                <span className="font-medium text-primary">James:</span>{' '}
                <span className="text-muted-foreground">Agreed. I&apos;ll own the go-to-market checklist and have it ready by Thursday.</span>
              </div>
              <div>
                <span className="font-medium text-primary">Sarah:</span>{' '}
                <span className="text-muted-foreground">Perfect. Let&apos;s also loop in the design team — the landing page needs a refresh before we go live.</span>
              </div>
            </div>
            {/* Entity pills row */}
            <div className="border-t border-border px-6 py-3 flex gap-2 flex-wrap">
              <Badge variant="secondary">Task: go-to-market checklist</Badge>
              <Badge variant="secondary">Decision: launch date end of week</Badge>
              <Badge variant="secondary">Topic: product launch</Badge>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
