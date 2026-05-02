import { Upload, Cpu, Sparkles } from 'lucide-react';

const steps = [
  {
    number: 1,
    icon: <Upload className="h-6 w-6" />,
    title: 'Upload your recording',
    description: 'Drag and drop or browse. Supports MP3, WAV, M4A, and OGG up to 100 MB.',
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
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="relative py-24 sm:py-32 overflow-hidden bg-muted/40">
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <p className="text-xs font-semibold tracking-widest text-primary uppercase mb-4">How it works</p>
          <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tight text-foreground">Three steps to clarity</h2>
          <p className="mt-5 text-muted-foreground text-lg leading-relaxed">From raw audio to structured knowledge in minutes.</p>
        </div>

        <div className="flex flex-col lg:flex-row relative z-10">
          <div className="hidden lg:block absolute top-8 left-[15%] right-[15%] z-0 border-t-2 border-dashed border-border/50 transition-all duration-1000"></div>

          {steps.map((step, i) => (
            <div key={step.number} className="relative flex-1 flex lg:flex-col items-start lg:items-center text-left lg:text-center mb-12 lg:mb-0 group">
              <div className="hidden lg:block absolute top-8 left-0 right-0 h-px" />
              
              <div className="flex-shrink-0 flex flex-col items-center z-10 lg:ml-0 relative">
                {/* Mobile vertical line connecting steps */}
                {i < steps.length - 1 && (
                  <div className="lg:hidden absolute top-16 bottom-[-3rem] left-8 border-l-2 border-dashed border-border/50" />
                )}
                
                <div className="flex h-16 w-16 items-center justify-center rounded-full gradient-border bg-background shadow-sm text-foreground mb-4 font-display text-2xl font-800">
                  {step.number}
                </div>
              </div>

              <div className="ml-6 lg:ml-0 flex flex-col items-start lg:items-center w-full lg:px-4">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary/20">
                  {step.icon}
                </div>
                <h3 className="font-display font-bold text-xl mb-2 tracking-tight text-foreground">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
