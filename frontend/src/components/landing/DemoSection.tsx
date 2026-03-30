'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const tabs = ['Transcript', 'Entities', 'Chat', 'Graph'] as const
type Tab = typeof tabs[number]

interface TabContent {
  heading: string
  bullets: string[]
  mockup: React.ReactNode
}

const tabContent: Record<Tab, TabContent> = {
  Transcript: {
    heading: 'Clean, searchable transcripts',
    bullets: [
      'Speaker labels on every utterance',
      'Full-text search with highlighting',
      'AI-enhanced cleanup for filler removal',
      'Toggle between raw and final transcript',
    ],
    mockup: (
      <div className="p-4 space-y-3 text-sm max-h-72 overflow-y-auto">
        <div className="flex gap-3">
          <span className="text-primary font-semibold shrink-0">Sarah:</span>
          <span className="text-muted-foreground">Let&apos;s review the progress on the Q4 launch. Where are we with the marketing site?</span>
        </div>
        <div className="flex gap-3">
          <span className="text-primary font-semibold shrink-0">James:</span>
          <span className="text-muted-foreground">The landing page is 90% complete. We&apos;re waiting on final copy from the content team.</span>
        </div>
        <div className="flex gap-3">
          <span className="text-primary font-semibold shrink-0">Sarah:</span>
          <span className="text-muted-foreground">Good. And the API documentation — is that on track for the developer preview?</span>
        </div>
        <div className="flex gap-3">
          <span className="text-primary font-semibold shrink-0">James:</span>
          <span className="text-muted-foreground">We&apos;re slightly behind on that. I&apos;ll prioritize it this week and have it ready by Friday.</span>
        </div>
        <div className="flex gap-3">
          <span className="text-primary font-semibold shrink-0">Sarah:</span>
          <span className="text-muted-foreground">Perfect. Let&apos;s also make sure we have load testing sorted before the public launch.</span>
        </div>
      </div>
    ),
  },
  Entities: {
    heading: 'Key information, automatically extracted',
    bullets: [
      'Tasks with assignees and deadlines',
      'Decisions with full context',
      'Topic clustering across meetings',
      'Due date and timeline detection',
    ],
    mockup: (
      <div className="p-4 space-y-4">
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Tasks</h4>
          <div className="space-y-2">
            <Badge className="bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary border-transparent text-xs">Finalize landing page copy</Badge>
            <Badge className="bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary border-transparent text-xs ml-2">Complete API documentation by Friday</Badge>
            <Badge className="bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary border-transparent text-xs ml-2">Schedule load testing</Badge>
          </div>
        </div>
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Decisions</h4>
          <div className="space-y-2">
            <Badge className="bg-accent/15 text-accent-foreground dark:bg-accent/20 dark:text-accent border-transparent text-xs">Prioritize API docs this week</Badge>
            <Badge className="bg-accent/15 text-accent-foreground dark:bg-accent/20 dark:text-accent border-transparent text-xs ml-2">Load test before public launch</Badge>
          </div>
        </div>
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Topics</h4>
          <div className="space-y-2">
            <Badge className="bg-accent/10 text-accent-foreground dark:bg-accent/15 dark:text-accent border-transparent text-xs">Q4 product launch</Badge>
            <Badge className="bg-accent/10 text-accent-foreground dark:bg-accent/15 dark:text-accent border-transparent text-xs ml-2">Developer preview</Badge>
          </div>
        </div>
      </div>
    ),
  },
  Chat: {
    heading: 'Ask anything about your meeting',
    bullets: [
      'Answers grounded in transcript context',
      'Cites specific parts of the conversation',
      'Supports multi-turn follow-ups',
      'Won\'t hallucinate on off-topic questions',
    ],
    mockup: (
      <div className="p-4 space-y-3">
        <div className="flex justify-end">
          <div className="rounded-2xl rounded-br-md bg-primary text-primary-foreground px-4 py-2.5 text-sm max-w-[80%]">
            What were the main action items from this meeting?
          </div>
        </div>
        <div className="flex justify-start">
          <div className="rounded-2xl rounded-bl-md bg-muted px-4 py-2.5 text-sm text-foreground max-w-[80%]">
            Based on the transcript, there are 3 action items:
            <ol className="list-decimal ml-4 mt-1 space-y-0.5 text-muted-foreground">
              <li>James to finalize API documentation by Friday</li>
              <li>Content team to deliver landing page copy</li>
              <li>Schedule load testing before public launch</li>
            </ol>
          </div>
        </div>
        <div className="flex justify-end">
          <div className="rounded-2xl rounded-br-md bg-primary text-primary-foreground px-4 py-2.5 text-sm max-w-[80%]">
            Who is responsible for load testing?
          </div>
        </div>
      </div>
    ),
  },
  Graph: {
    heading: 'Visual knowledge graph across all meetings',
    bullets: [
      'Entities represented as nodes',
      'Relationships shown as edges',
      'Filter by entity type or meeting',
      'Click any node to explore context',
    ],
    mockup: (
      <div className="p-6 flex items-center justify-center min-h-[240px]">
        <svg width="300" height="200" viewBox="0 0 300 200" className="w-full max-w-[300px]">
          {/* Edges */}
          <line x1="150" y1="40" x2="60" y2="100" className="stroke-primary/30" strokeWidth="1.5" />
          <line x1="150" y1="40" x2="240" y2="80" className="stroke-primary/30" strokeWidth="1.5" />
          <line x1="60" y1="100" x2="120" y2="160" className="stroke-primary/30" strokeWidth="1.5" />
          <line x1="240" y1="80" x2="120" y2="160" className="stroke-primary/30" strokeWidth="1.5" />
          <line x1="240" y1="80" x2="260" y2="150" className="stroke-primary/30" strokeWidth="1.5" />
          <line x1="60" y1="100" x2="40" y2="160" className="stroke-primary/30" strokeWidth="1.5" />
          {/* Nodes */}
          <circle cx="150" cy="40" r="12" className="fill-primary/20 stroke-primary" strokeWidth="1.5" />
          <circle cx="60" cy="100" r="10" className="fill-primary/20 stroke-primary" strokeWidth="1.5" />
          <circle cx="240" cy="80" r="10" className="fill-accent/20 stroke-accent" strokeWidth="1.5" />
          <circle cx="120" cy="160" r="8" className="fill-primary/15 stroke-primary" strokeWidth="1.5" />
          <circle cx="260" cy="150" r="7" className="fill-primary/15 stroke-primary" strokeWidth="1.5" />
          <circle cx="40" cy="160" r="7" className="fill-primary/15 stroke-primary" strokeWidth="1.5" />
          {/* Labels */}
          <text x="150" y="22" textAnchor="middle" className="fill-foreground text-[10px] font-medium">Sarah</text>
          <text x="60" y="84" textAnchor="middle" className="fill-foreground text-[10px] font-medium">Q4 Launch</text>
          <text x="240" y="64" textAnchor="middle" className="fill-foreground text-[10px] font-medium">Design review</text>
        </svg>
      </div>
    ),
  },
}

export function DemoSection() {
  const [activeTab, setActiveTab] = useState<Tab>('Transcript')
  const content = tabContent[activeTab]

  return (
    <section className="py-20 sm:py-24 px-4">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <p className="text-xs font-semibold tracking-widest text-primary uppercase mb-3">Demo</p>
        <h2 className="text-4xl font-bold tracking-tight">Everything in one place</h2>
        <p className="mt-4 text-muted-foreground text-lg">
          See how HarBaat turns your meeting recordings into structured, searchable knowledge.
        </p>
      </div>

      {/* Tab pills */}
      <div className="flex rounded-xl border border-border bg-muted p-1 gap-1 w-fit mx-auto">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'rounded-lg px-4 py-2 text-sm font-medium transition-all',
              activeTab === tab
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mt-8 items-center max-w-5xl mx-auto">
        {/* Left - copy */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xl font-semibold">{content.heading}</h3>
          <ul className="space-y-3">
            {content.bullets.map((bullet) => (
              <li key={bullet} className="flex items-start gap-2 text-sm">
                <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-muted-foreground">{bullet}</span>
              </li>
            ))}
          </ul>
          <button className="text-sm text-primary hover:underline">
            Learn more →
          </button>
        </div>

        {/* Right - mockup */}
        <div className="lg:col-span-3">
          <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xl shadow-primary/5">
            {content.mockup}
          </div>
        </div>
      </div>
    </section>
  )
}
