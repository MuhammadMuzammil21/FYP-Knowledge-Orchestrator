import { Mic, Users, Tag, AlertTriangle, MessageSquare, Network } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const features = [
  {
    icon: <Mic className="h-5 w-5" />,
    title: 'Accurate AI transcription',
    description: 'Industry-leading speech recognition turns your audio into clean, readable transcripts in minutes. Supports 9 languages.',
    colSpan: 'lg:col-span-2',
    illustration: (
      <div className="rounded-lg bg-muted p-3 mt-4 text-xs font-mono space-y-1.5">
        <div><span className="text-primary font-semibold">SPEAKER_00:</span> <span className="text-muted-foreground">The quarterly results exceeded our projections by 12%...</span></div>
        <div><span className="text-primary font-semibold">SPEAKER_01:</span> <span className="text-muted-foreground">That&apos;s great news. Let&apos;s discuss the roadmap for next quarter.</span></div>
        <div><span className="text-primary font-semibold">SPEAKER_00:</span> <span className="text-muted-foreground">Agreed. I have a few proposals ready to share with the team.</span></div>
      </div>
    ),
  },
  {
    icon: <Users className="h-5 w-5" />,
    title: 'Speaker identification',
    description: 'Automatically detects and labels each speaker. Rename them to real names with one click.',
    colSpan: 'lg:col-span-1',
    illustration: (
      <div className="mt-4 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-primary/10 text-primary text-xs px-3 py-1">Speaker 1</span>
          <span className="text-muted-foreground text-xs">→</span>
          <span className="rounded-full bg-primary/10 text-primary text-xs px-3 py-1 font-semibold">Sarah K.</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-primary/10 text-primary text-xs px-3 py-1">Speaker 2</span>
          <span className="text-muted-foreground text-xs">→</span>
          <span className="rounded-full bg-primary/10 text-primary text-xs px-3 py-1 font-semibold">James W.</span>
        </div>
      </div>
    ),
  },
  {
    icon: <Tag className="h-5 w-5" />,
    title: 'Extract what matters',
    description: 'Tasks, decisions, topics, and action items are pulled out automatically and categorized.',
    colSpan: 'lg:col-span-1',
    illustration: (
      <div className="mt-4 flex flex-wrap gap-2">
        <Badge className="bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary border-transparent text-xs">Task: Update roadmap</Badge>
        <Badge className="bg-accent/15 text-accent-foreground dark:bg-accent/20 dark:text-accent border-transparent text-xs">Decision: Launch Q1</Badge>
        <Badge className="bg-accent/10 text-accent-foreground dark:bg-accent/15 dark:text-accent border-transparent text-xs">Topic: Revenue growth</Badge>
      </div>
    ),
  },
  {
    icon: <AlertTriangle className="h-5 w-5" />,
    title: 'Cross-meeting conflict detection',
    description: 'HarBaat flags when a decision made in one meeting contradicts something said in a previous one.',
    colSpan: 'lg:col-span-1',
    illustration: (
      <div className="mt-4 rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive">
        ⚠ Deadline changed: was Dec 15, now Jan 5
      </div>
    ),
  },
  {
    icon: <MessageSquare className="h-5 w-5" />,
    title: 'Ask anything about your meeting',
    description: 'An AI assistant trained on your transcript answers questions, summarizes sections, and surfaces context you forgot was discussed.',
    colSpan: 'lg:col-span-2',
    illustration: (
      <div className="mt-4 space-y-3">
        <div className="flex justify-end">
          <div className="rounded-2xl rounded-br-md bg-primary text-primary-foreground px-4 py-2 text-xs max-w-[80%]">
            What action items came out of this meeting?
          </div>
        </div>
        <div className="flex justify-start">
          <div className="rounded-2xl rounded-bl-md bg-muted px-4 py-2 text-xs text-foreground max-w-[80%]">
            There were 3 action items: 1) James to prepare go-to-market checklist by Thursday, 2) Loop in design team for landing page refresh, 3) Finalize launch date by end of week.
          </div>
        </div>
      </div>
    ),
  },
  {
    icon: <Network className="h-5 w-5" />,
    title: 'Visual knowledge graph',
    description: 'Every entity, relationship, and decision is mapped into an interactive graph spanning your entire project.',
    colSpan: 'lg:col-span-1',
    illustration: (
      <div className="mt-4 flex justify-center">
        <svg width="160" height="100" viewBox="0 0 160 100" className="text-primary">
          {/* Edges */}
          <line x1="80" y1="20" x2="30" y2="60" stroke="currentColor" strokeOpacity="0.3" strokeWidth="1.5" />
          <line x1="80" y1="20" x2="130" y2="50" stroke="currentColor" strokeOpacity="0.3" strokeWidth="1.5" />
          <line x1="30" y1="60" x2="70" y2="85" stroke="currentColor" strokeOpacity="0.3" strokeWidth="1.5" />
          <line x1="130" y1="50" x2="70" y2="85" stroke="currentColor" strokeOpacity="0.3" strokeWidth="1.5" />
          <line x1="130" y1="50" x2="140" y2="85" stroke="currentColor" strokeOpacity="0.3" strokeWidth="1.5" />
          {/* Nodes */}
          <circle cx="80" cy="20" r="8" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="30" cy="60" r="6" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="130" cy="50" r="7" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="70" cy="85" r="5" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="140" cy="85" r="5" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </div>
    ),
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 sm:py-24 px-4">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <p className="text-xs font-semibold tracking-widest text-primary uppercase mb-3">Features</p>
        <h2 className="text-4xl font-bold tracking-tight">One upload. Infinite clarity.</h2>
        <p className="mt-4 text-muted-foreground text-lg">
          HarBaat processes your recording end-to-end so your team can focus on decisions, not notes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
        {features.map((feature) => (
          <div
            key={feature.title}
            className={`group relative rounded-2xl border border-border bg-card p-6 overflow-hidden hover:border-primary/30 transition-colors duration-300 ${feature.colSpan}`}
          >
            {/* Decorative corner glow */}
            <div className="pointer-events-none absolute -top-6 -right-6 h-24 w-24 rounded-full bg-primary/5 blur-2xl group-hover:bg-primary/10 transition-all" />
            {/* Icon */}
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              {feature.icon}
            </div>
            {/* Content */}
            <h3 className="font-semibold text-base mb-2">{feature.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            {/* Feature illustration */}
            {feature.illustration}
          </div>
        ))}
      </div>
    </section>
  )
}
