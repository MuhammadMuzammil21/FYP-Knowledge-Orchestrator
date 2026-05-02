'use client';
import { useState, useRef, useEffect } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = ['Transcript', 'Entities', 'Chat', 'Graph'] as const;
type Tab = (typeof tabs)[number];

interface TabContent {
  heading: string;
  bullets: string[];
  mockup: React.ReactNode;
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
      <div className="p-4 space-y-3 text-sm max-h-72 overflow-y-auto bg-card rounded-2xl border border-border">
        <div className="flex gap-3">
          <span className="text-primary font-mono text-xs font-medium shrink-0 pt-0.5">Sarah:</span>
          <span className="text-foreground text-sm">
            Let&apos;s review the progress on the Q4 launch. Where are we with the marketing site?
          </span>
        </div>
        <div className="flex gap-3">
          <span className="text-primary font-mono text-xs font-medium shrink-0 pt-0.5">James:</span>
          <span className="text-foreground text-sm">
            The landing page is 90% complete. We&apos;re waiting on final copy from the content
            team.
          </span>
        </div>
        <div className="flex gap-3">
          <span className="text-primary font-mono text-xs font-medium shrink-0 pt-0.5">Sarah:</span>
          <span className="text-foreground text-sm">
            Good. And the API documentation — is that on track for the developer preview?
          </span>
        </div>
        <div className="flex gap-3">
          <span className="text-primary font-mono text-xs font-medium shrink-0 pt-0.5">James:</span>
          <span className="text-foreground text-sm">
            We&apos;re slightly behind on that. I&apos;ll prioritize it this week and have it ready
            by Friday.
          </span>
        </div>
        <div className="flex gap-3">
          <span className="text-primary font-mono text-xs font-medium shrink-0 pt-0.5">Sarah:</span>
          <span className="text-foreground text-sm">
            Perfect. Let&apos;s also make sure we have load testing sorted before the public launch.
          </span>
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
          <h4 className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-2">
            Tasks
          </h4>
          <div className="space-y-2 flex flex-col items-start gap-1">
            <span className="bg-primary/10 text-primary border border-primary/20 font-mono text-xs rounded-full px-3 py-1">
              Finalize landing page copy
            </span>
            <span className="bg-primary/10 text-primary border border-primary/20 font-mono text-xs rounded-full px-3 py-1 ml-2">
              Complete API documentation by Friday
            </span>
            <span className="bg-primary/10 text-primary border border-primary/20 font-mono text-xs rounded-full px-3 py-1 ml-2">
              Schedule load testing
            </span>
          </div>
        </div>
        <div>
          <h4 className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-2">
            Decisions
          </h4>
          <div className="space-y-2 flex flex-col items-start gap-1">
            <span className="bg-primary/10 text-primary border border-primary/20 font-mono text-xs rounded-full px-3 py-1">
              Prioritize API docs this week
            </span>
            <span className="bg-primary/10 text-primary border border-primary/20 font-mono text-xs rounded-full px-3 py-1 ml-2">
              Load test before public launch
            </span>
          </div>
        </div>
        <div>
          <h4 className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-2">
            Topics
          </h4>
          <div className="space-y-2 flex flex-col items-start gap-1">
            <span className="bg-primary/10 text-primary border border-primary/20 font-mono text-xs rounded-full px-3 py-1">
              Q4 product launch
            </span>
            <span className="bg-primary/10 text-primary border border-primary/20 font-mono text-xs rounded-full px-3 py-1 ml-2">
              Developer preview
            </span>
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
      "Won't hallucinate on off-topic questions",
    ],
    mockup: (
      <div className="p-4 space-y-3">
        <div className="flex justify-end">
          <div className="rounded-2xl rounded-br-md bg-primary text-primary-foreground px-4 py-2.5 text-sm max-w-[80%]">
            What were the main action items from this meeting?
          </div>
        </div>
        <div className="flex justify-start">
          <div className="rounded-2xl rounded-bl-md bg-muted px-4 py-2.5 text-sm text-foreground max-w-[80%] font-sans">
            Based on the transcript, there are 3 action items:
            <ol className="list-decimal ml-4 mt-1 space-y-0.5 text-foreground/80">
              <li>James to finalize API documentation by Friday</li>
              <li>Content team to deliver landing page copy</li>
              <li>Schedule load testing before public launch</li>
            </ol>
          </div>
        </div>
        <div className="flex justify-end">
          <div className="rounded-2xl rounded-br-md bg-primary text-primary-foreground px-4 py-2.5 text-sm max-w-[80%] flex items-center">
            Who is responsible for load testing?
            <span className="inline-block w-0.5 h-4 bg-primary-foreground animate-[blink_1s_step-end_infinite] ml-1" />
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
          <line x1="150" y1="40" x2="60" y2="100" stroke="currentColor" className="text-border" strokeWidth="1.5" />
          <line x1="150" y1="40" x2="240" y2="80" stroke="currentColor" className="text-border" strokeWidth="1.5" />
          <line x1="60" y1="100" x2="120" y2="160" stroke="currentColor" className="text-border" strokeWidth="1.5" />
          <line x1="240" y1="80" x2="120" y2="160" stroke="currentColor" className="text-border" strokeWidth="1.5" />
          <line x1="240" y1="80" x2="260" y2="150" stroke="currentColor" className="text-border" strokeWidth="1.5" />
          <line x1="60" y1="100" x2="40" y2="160" stroke="currentColor" className="text-border" strokeWidth="1.5" />
          {/* Nodes */}
          <circle cx="150" cy="40" r="12" fill="currentColor" className="text-primary/60 animate-[node-pulse_3s_ease-in-out_infinite]" strokeWidth="1.5" />
          <circle cx="60" cy="100" r="10" fill="currentColor" className="text-primary/60 animate-[node-pulse_3s_ease-in-out_infinite] [animation-delay:0.5s]" strokeWidth="1.5" />
          <circle cx="240" cy="80" r="10" fill="currentColor" className="text-accent/60 animate-[node-pulse_3s_ease-in-out_infinite] [animation-delay:1s]" strokeWidth="1.5" />
          <circle cx="120" cy="160" r="8" fill="currentColor" className="text-primary/40 animate-[node-pulse_3s_ease-in-out_infinite] [animation-delay:1.5s]" strokeWidth="1.5" />
          <circle cx="260" cy="150" r="7" fill="currentColor" className="text-primary/40 animate-[node-pulse_3s_ease-in-out_infinite] [animation-delay:2s]" strokeWidth="1.5" />
          <circle cx="40" cy="160" r="7" fill="currentColor" className="text-primary/40 animate-[node-pulse_3s_ease-in-out_infinite] [animation-delay:2.5s]" strokeWidth="1.5" />
          {/* Labels */}
          <text x="150" y="22" textAnchor="middle" fill="currentColor" className="text-muted-foreground font-mono text-[10px]">Sarah</text>
          <text x="60" y="84" textAnchor="middle" fill="currentColor" className="text-muted-foreground font-mono text-[10px]">Q4 Launch</text>
          <text x="240" y="64" textAnchor="middle" fill="currentColor" className="text-muted-foreground font-mono text-[10px]">Design review</text>
        </svg>
      </div>
    ),
  },
};

export function DemoSection() {
  const [activeTab, setActiveTab] = useState<Tab>('Transcript');
  const [pillStyle, setPillStyle] = useState({ left: 0, width: 0 });
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const currentTab = tabsRef.current[tabs.indexOf(activeTab)];
    if (currentTab) {
      setPillStyle({
        left: currentTab.offsetLeft,
        width: currentTab.offsetWidth,
      });
    }
  }, [activeTab]);

  const content = tabContent[activeTab];

  return (
    <section className="py-24 px-4 bg-background">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <p className="text-xs font-semibold tracking-widest text-primary uppercase mb-3">Demo</p>
        <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tight text-foreground">Everything in one place</h2>
        <p className="mt-4 text-muted-foreground text-lg">
          See how HarBaat turns your meeting recordings into structured, searchable knowledge.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mt-8 items-start max-w-5xl mx-auto flex-col-reverse lg:flex-row">
        {/* Left - copy */}
        <div className="lg:col-span-2 space-y-4 lg:sticky lg:top-32">
          <h3 className="text-xl font-display font-semibold text-foreground">{content.heading}</h3>
          <ul className="space-y-3">
            {content.bullets.map((bullet) => (
              <li key={bullet} className="flex items-start gap-2 text-sm">
                <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-muted-foreground">{bullet}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right - mockup */}
        <div className="lg:col-span-3 w-full">
          {/* Tab pills */}
          <div className="relative flex bg-muted/50 rounded-xl p-1 w-full overflow-x-auto scrollbar-hide mb-6">
            <div
              className="absolute top-1 bottom-1 bg-background shadow-sm rounded-lg transition-all duration-300 ease-out"
              style={{ left: pillStyle.left, width: pillStyle.width }}
            />
            {tabs.map((tab, i) => (
              <button
                key={tab}
                ref={(el) => { tabsRef.current[i] = el; }}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'relative z-10 rounded-lg px-4 py-2 text-sm font-display font-semibold transition-colors whitespace-nowrap',
                  activeTab === tab ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="rounded-2xl border border-border/70 bg-card overflow-hidden shadow-lg shadow-primary/10">
            <div
              key={activeTab}
              className="animate-[hero-fade-in_0.4s_ease-out_forwards]"
            >
              {content.mockup}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
