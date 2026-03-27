import { Upload, Cpu, Sparkles } from 'lucide-react'

const steps = [
  {
    number: 1,
    icon: <Upload className="h-6 w-6" />,
    title: 'Upload your recording',
    description: 'Drag and drop or browse. Supports MP3, WAV, M4A, and OGG up to 100MB.',
  },
  {
    number: 2,
    icon: <Cpu className="h-6 w-6" />,
    title: 'AI processes everything',
    description: 'Our pipeline transcribes, cleans, identifies speakers, extracts entities, and indexes for search — automatically.',
  },
  {
    number: 3,
    icon: <Sparkles className="h-6 w-6" />,
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
    <section id="how-it-works" className="py-20 sm:py-24 bg-muted/30">
      <div className="text-center max-w-2xl mx-auto mb-16 px-4">
        <p className="text-xs font-semibold tracking-widest text-primary uppercase mb-3">How it works</p>
        <h2 className="text-4xl font-bold tracking-tight">Three steps to clarity</h2>
        <p className="mt-4 text-muted-foreground text-lg">
          From raw audio to structured knowledge in minutes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-0 max-w-4xl mx-auto relative px-4">
        {/* Connector lines — visible on md+ */}
        <div className="hidden md:block absolute top-8 left-1/3 right-1/3 h-px bg-gradient-to-r from-border via-primary/20 to-border" />

        {steps.map((step) => (
          <div key={step.number} className="relative flex flex-col items-center text-center px-8 py-6">
            {/* Step number */}
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary text-2xl font-bold">
              {step.number}
            </div>
            {/* Icon */}
            <div className="mb-3 text-primary">{step.icon}</div>
            <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
          </div>
        ))}
      </div>

      {/* Processing pipeline visualization */}
      <div className="mt-12 flex items-center justify-center gap-0 overflow-x-auto pb-2 px-4">
        {pipeline.map((stage, i) => (
          <div key={stage} className="flex items-center">
            <div className="flex-shrink-0 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium text-muted-foreground whitespace-nowrap">
              {stage}
            </div>
            {i < pipeline.length - 1 && <div className="w-6 h-px bg-border flex-shrink-0" />}
          </div>
        ))}
      </div>
    </section>
  )
}
