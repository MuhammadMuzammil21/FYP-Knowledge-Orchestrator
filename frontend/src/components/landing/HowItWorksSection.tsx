import { Upload, Cpu, Sparkles, ArrowRight } from 'lucide-react'

const steps = [
  {
    number: 1,
    icon: <Upload className="h-5 w-5" />,
    title: 'Upload your recording',
    description: 'Drag and drop or browse. Supports MP3, WAV, M4A, and OGG up to 100 MB.',
  },
  {
    number: 2,
    icon: <Cpu className="h-5 w-5" />,
    title: 'AI processes everything',
    description: 'Our pipeline transcribes, cleans, identifies speakers, extracts entities, and indexes for search — automatically.',
  },
  {
    number: 3,
    icon: <Sparkles className="h-5 w-5" />,
    title: 'Explore your insights',
    description: 'Browse the transcript, chat with your meeting, view the knowledge graph, and catch cross-meeting conflicts.',
  },
]

const pipeline = [
  'Audio upload',
  'Transcription',
  'LLM cleanup',
  'Entity extraction',
  'RAG indexing',
  'Knowledge graph',
]

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="relative py-24 sm:py-32 overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-muted/50 dark:bg-muted/20" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/[0.04] via-transparent to-transparent dark:from-primary/[0.06]" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-20">
          <p className="text-xs font-semibold tracking-[0.2em] text-primary dark:text-primary uppercase mb-4">
            How it works
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
            Three steps to clarity
          </h2>
          <p className="mt-5 text-muted-foreground text-lg leading-relaxed">
            From raw audio to structured knowledge in minutes.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-0 relative">
          {/* Connector line — desktop only */}
          <div className="hidden md:block absolute top-[3.25rem] left-[25%] right-[25%] z-0">
            <div className="h-px w-full bg-gradient-to-r from-transparent via-border/80 dark:via-primary/20 to-transparent" />
          </div>

          {steps.map((step, i) => (
            <div key={step.number} className="relative z-10 flex flex-col items-center text-center group">
              {/* Card container */}
              <div className="flex flex-col items-center px-6 py-8 rounded-2xl transition-all duration-300 hover:bg-card/60 dark:hover:bg-card/40">
                {/* Step number badge */}
                <div className="relative mb-6">
                  <div className="flex h-[4.25rem] w-[4.25rem] items-center justify-center rounded-full border-2 border-primary/30 dark:border-primary/40 bg-card dark:bg-card text-primary text-xl font-bold transition-all duration-300 group-hover:border-primary/50 group-hover:shadow-[0_0_24px_hsl(var(--primary)/0.15)]">
                    {step.number}
                  </div>
                  {/* Glow ring on hover */}
                  <div className="absolute -inset-1 rounded-full bg-primary/5 dark:bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
                </div>

                {/* Icon */}
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 dark:bg-primary/15 text-primary transition-colors duration-300 group-hover:bg-primary/20">
                  {step.icon}
                </div>

                {/* Text */}
                <h3 className="font-semibold text-lg mb-2 tracking-tight text-foreground">{step.title}</h3>
                <p className="text-sm text-muted-foreground dark:text-muted-foreground leading-relaxed max-w-[260px]">
                  {step.description}
                </p>
              </div>

              {/* Arrow between steps — mobile only */}
              {i < steps.length - 1 && (
                <div className="md:hidden flex justify-center py-2 text-muted-foreground/50">
                  <ArrowRight className="h-4 w-4 rotate-90" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Processing pipeline */}
        <div className="mt-20">
          <p className="text-center text-xs font-medium tracking-widest text-muted-foreground uppercase mb-6">
            Processing Pipeline
          </p>
          <div className="flex items-center justify-center gap-0 overflow-x-auto pb-2 px-4 scrollbar-hide">
            {pipeline.map((stage, i) => (
              <div key={stage} className="flex items-center flex-shrink-0">
                <div className="rounded-full border border-border dark:border-border/80 bg-card backdrop-blur-sm px-4 py-1.5 text-xs font-medium text-muted-foreground whitespace-nowrap transition-colors duration-200 hover:border-primary/40 hover:text-foreground">
                  {stage}
                </div>
                {i < pipeline.length - 1 && (
                  <div className="w-5 flex-shrink-0 flex items-center justify-center text-muted-foreground/50">
                    <ArrowRight className="h-3 w-3" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
