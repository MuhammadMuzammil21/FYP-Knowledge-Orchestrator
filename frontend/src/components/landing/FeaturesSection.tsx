'use client';
import { Mic, Users, Tag, AlertTriangle, MessageSquare, Network } from 'lucide-react';
import { ScrollReveal } from '@/components/landing/ScrollReveal';

const features = [
  {
    icon: <Mic className="w-6 h-6" />,
    title: 'Accurate AI transcription',
    description: 'Industry-leading speech recognition turns your audio into clean, readable transcripts in minutes. Supports 9 languages with near-perfect accuracy.',
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: 'Speaker identification',
    description: 'Automatically detects and labels each speaker. Rename them to real names with one click, and HarBaat remembers them for future meetings.',
  },
  {
    icon: <Tag className="w-6 h-6" />,
    title: 'Extract what matters',
    description: 'Tasks, decisions, topics, and action items are pulled out automatically and categorized so you never miss a deadline or deliverable.',
  },
  {
    icon: <AlertTriangle className="w-6 h-6" />,
    title: 'Cross-meeting conflict detection',
    description: 'HarBaat flags when a decision made in one meeting contradicts something said in a previous one, preventing costly misalignments.',
  },
  {
    icon: <MessageSquare className="w-6 h-6" />,
    title: 'Ask anything',
    description: 'An AI assistant trained exclusively on your transcript answers questions, summarizes sections, and surfaces context you forgot was discussed.',
  },
  {
    icon: <Network className="w-6 h-6" />,
    title: 'Visual knowledge graph',
    description: 'Every entity, relationship, and decision is mapped into an interactive graph spanning your entire project.',
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 lg:py-32 px-4 relative bg-background">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12 lg:gap-24 relative">
        
        {/* Left: Sticky Header */}
        <div className="lg:w-1/3">
          <div className="sticky top-32">
            <p className="font-mono text-sm tracking-widest text-primary uppercase mb-4">Features</p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold tracking-tight text-foreground leading-[1.1]">
              One upload.<br/> Infinite clarity.
            </h2>
            <p className="mt-6 text-muted-foreground text-lg md:text-xl font-sans leading-relaxed">
              HarBaat processes your recording end-to-end so your team can focus on decisions, not taking notes.
            </p>
          </div>
        </div>

        {/* Right: Feature List */}
        <div className="lg:w-2/3">
          <div className="flex flex-col">
            {features.map((feature, i) => (
              <ScrollReveal key={feature.title} variant="fade-up">
                <div className="group relative border-b border-border/40 py-8 lg:py-16 first:pt-0 last:border-b-0">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-10">
                    <div className="flex-shrink-0 flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-muted/30 border border-border/50 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-primary/20">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-2xl md:text-3xl text-foreground mb-3 tracking-tight transition-colors group-hover:text-primary">
                        {feature.title}
                      </h3>
                      <p className="text-lg text-muted-foreground leading-relaxed font-sans max-w-xl">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
