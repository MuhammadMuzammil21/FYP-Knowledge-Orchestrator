'use client';
import Link from 'next/link';
import { 
  ArrowRight, Play, CheckCircle2, Plus, LayoutDashboard, 
  Folder, CheckSquare, Users, Settings, User, FileAudio, 
  Sparkles, ListChecks, MessageSquare, Network, UploadCloud, 
  ChevronDown, FileText, AlertTriangle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function HeroSection() {
  return (
    <div className="relative">
      {/* Decorative Background from hero-section-9 */}
      <div
        aria-hidden="true"
        className="z-[2] absolute inset-0 pointer-events-none isolate opacity-50 contain-strict hidden lg:block"
      >
        <div className="w-[35rem] h-[80rem] -translate-y-20 absolute left-0 top-0 -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,color-mix(in_oklch,var(--color-primary)_12%,transparent)_0,color-mix(in_oklch,var(--color-primary)_4%,transparent)_50%,transparent_80%)]" />
        <div className="h-[80rem] absolute left-0 top-0 w-56 -rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,color-mix(in_oklch,var(--color-primary)_8%,transparent)_0,color-mix(in_oklch,var(--color-primary)_2%,transparent)_80%,transparent_100%)] [translate:5%_-50%]" />
        <div className="h-[80rem] -translate-y-20 absolute left-0 top-0 w-56 -rotate-45 bg-[radial-gradient(50%_50%_at_50%_50%,color-mix(in_oklch,var(--color-primary)_6%,transparent)_0,color-mix(in_oklch,var(--color-primary)_2%,transparent)_80%,transparent_100%)]" />
      </div>

      <section className="overflow-hidden bg-background">
        <div className="relative mx-auto max-w-5xl px-6 py-28 lg:py-32">
          <div className="relative z-10 mx-auto max-w-3xl text-center">
            <h1 className="text-balance text-5xl font-display font-bold md:text-6xl lg:text-8xl tracking-tight text-foreground hero-headline animate-hero-headline">
              Your meetings, <span className="text-gradient">finally understood.</span>
            </h1>
            <p className="mx-auto my-8 max-w-2xl text-lg md:text-xl text-muted-foreground font-sans animate-hero-sub">
              Upload any recording. Get transcripts, decisions, action items, and AI-powered answers — automatically, in minutes.
            </p>

            <div className="animate-hero-cta mt-8 flex flex-col w-full xs:w-auto sm:flex-row sm:justify-center gap-4">
              <Link href="/signup" className="w-full sm:w-auto">
                <Button size="lg" className="w-full bg-primary text-primary-foreground btn-shimmer rounded-full px-8 py-6 font-sans font-medium gap-2 text-base shadow-lg shadow-primary/20">
                  Start for free <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="#how-it-works" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full border-border/80 bg-background/50 text-foreground hover:border-primary/40 rounded-full px-8 py-6 font-sans font-medium gap-2 text-base backdrop-blur-sm">
                  <Play className="h-5 w-5 text-primary" /> See how it works
                </Button>
              </Link>
            </div>

            {/* Trust micro-copy */}
            <div className="mt-8 text-sm text-muted-foreground hidden sm:flex flex-wrap items-center justify-center gap-3">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-primary" /> No credit card required</span>
              <span className="border-l border-border/50 h-4 px-1" />
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-primary" /> MP3 · WAV · M4A · OGG</span>
              <span className="border-l border-border/50 h-4 px-1" />
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-primary" /> 100MB max upload</span>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-4 max-w-6xl px-6 pb-32">
          {/* Dashboard Mockup - Straight Vertical */}
          <div className="w-full shadow-2xl shadow-primary/20 rounded-2xl border border-border/60 bg-background overflow-hidden flex flex-col md:flex-row h-auto md:h-[700px] text-left">
            
            {/* Sidebar */}
            <div className="w-full md:w-64 border-r border-border/20 bg-muted/20 p-4 flex flex-col hidden md:flex">
              <div className="flex items-center gap-2 mb-8 px-2 mt-2">
                <div className="h-7 w-7 rounded bg-emerald-100 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-emerald-900" />
                </div>
                <span className="font-semibold text-foreground text-base tracking-tight">HarBaat AI</span>
              </div>
              
              <Button className="w-full bg-[#dcfce7] hover:bg-[#bbf7d0] text-emerald-950 border-transparent justify-start mb-6 rounded-full font-medium h-10 shadow-sm">
                <Plus className="mr-2 w-4 h-4" /> New meeting
              </Button>
              
              <div className="space-y-6 flex-1 overflow-y-auto pr-2">
                <div>
                  <div className="text-[11px] font-semibold text-muted-foreground mb-2 px-2 flex justify-between items-center tracking-wider uppercase">
                    Personal Workspace
                    <ChevronDown className="w-3 h-3" />
                  </div>
                  <div className="space-y-1">
                    <div className="px-3 py-2 rounded-lg bg-muted text-foreground text-sm font-medium flex items-center gap-2.5">
                      <LayoutDashboard className="w-4 h-4 text-primary" /> Dashboard
                    </div>
                    <div className="px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted/50 text-sm font-medium cursor-pointer flex items-center gap-2.5 transition-colors">
                      <FileAudio className="w-4 h-4" /> All meetings
                    </div>
                    <div className="px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted/50 text-sm font-medium cursor-pointer flex items-center gap-2.5 transition-colors">
                      <Folder className="w-4 h-4" /> Projects
                    </div>
                    <div className="px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted/50 text-sm font-medium cursor-pointer flex items-center gap-2.5 transition-colors">
                      <CheckSquare className="w-4 h-4" /> Tasks
                    </div>
                    <div className="px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted/50 text-sm font-medium cursor-pointer flex items-center gap-2.5 transition-colors">
                      <Users className="w-4 h-4" /> Teams
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-semibold text-muted-foreground mb-2 px-2 tracking-wider uppercase">ACCOUNT</div>
                  <div className="space-y-1">
                    <div className="px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted/50 text-sm font-medium cursor-pointer flex items-center gap-2.5 transition-colors">
                      <Settings className="w-4 h-4" /> Settings
                    </div>
                    <div className="px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted/50 text-sm font-medium cursor-pointer flex items-center gap-2.5 transition-colors">
                      <User className="w-4 h-4" /> Known speakers
                    </div>
                  </div>
                </div>
              </div>
              
              {/* User Profile */}
              <div className="mt-auto pt-4 border-t border-border/20 flex items-center gap-3 px-2">
                <div className="h-8 w-8 rounded-full bg-red-900/80 text-red-200 flex items-center justify-center font-medium text-xs shadow-inner">M</div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-foreground">Muzammil</span>
                  <span className="text-xs text-muted-foreground truncate w-32">muzammil@example.com</span>
                </div>
              </div>
            </div>
            
            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto bg-background p-6 md:p-12">
              <div className="max-w-[850px] mx-auto">
                <div className="mb-10">
                  <h2 className="text-2xl font-semibold text-foreground tracking-tight">New meeting</h2>
                  <p className="text-sm text-muted-foreground mt-1.5">Upload a recording and get AI-powered insights in minutes</p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-8">
                  {/* Left Column (Info) */}
                  <div className="space-y-6">
                    {/* How it works */}
                    <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm">
                      <div className="text-[11px] font-semibold text-muted-foreground tracking-wider mb-6 uppercase">How it works</div>
                      
                      <div className="relative border-l-2 border-border/50 ml-3 space-y-8 pb-2">
                        <div className="relative flex items-start">
                          <div className="absolute -left-[1.05rem] bg-muted border border-border/50 rounded-full w-8 h-8 flex items-center justify-center text-xs font-mono text-muted-foreground">01</div>
                          <div className="ml-10">
                            <h4 className="text-sm font-semibold text-foreground">Upload your recording</h4>
                            <p className="text-[13px] text-muted-foreground mt-1.5 leading-relaxed">Any format: MP3, WAV, M4A, or OGG up to 100MB.</p>
                          </div>
                        </div>
                        
                        <div className="relative flex items-start">
                          <div className="absolute -left-[1.05rem] bg-muted border border-border/50 rounded-full w-8 h-8 flex items-center justify-center text-xs font-mono text-muted-foreground">02</div>
                          <div className="ml-10">
                            <h4 className="text-sm font-semibold text-foreground">AI processes everything</h4>
                            <p className="text-[13px] text-muted-foreground mt-1.5 leading-relaxed">Transcription, cleanup, speaker detection, and indexing run automatically.</p>
                          </div>
                        </div>
                        
                        <div className="relative flex items-start">
                          <div className="absolute -left-[1.05rem] bg-muted border border-border/50 rounded-full w-8 h-8 flex items-center justify-center text-xs font-mono text-muted-foreground">03</div>
                          <div className="ml-10">
                            <h4 className="text-sm font-semibold text-foreground">Explore your insights</h4>
                            <p className="text-[13px] text-muted-foreground mt-1.5 leading-relaxed">Transcript, entities, chat, graph — all ready in minutes.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* What you get */}
                    <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm">
                      <div className="text-[11px] font-semibold text-muted-foreground tracking-wider mb-5 uppercase">What you get</div>
                      
                      <div className="grid grid-cols-1 gap-y-3.5 gap-x-4">
                        <div className="flex items-center gap-3 text-[13px] text-muted-foreground"><FileText className="w-4 h-4 text-primary/60" /> Clean transcript</div>
                        <div className="flex items-center gap-3 text-[13px] text-muted-foreground"><Users className="w-4 h-4 text-primary/60" /> Speaker identification</div>
                        <div className="flex items-center gap-3 text-[13px] text-muted-foreground"><ListChecks className="w-4 h-4 text-primary/60" /> Tasks & decisions</div>
                        <div className="flex items-center gap-3 text-[13px] text-muted-foreground"><MessageSquare className="w-4 h-4 text-primary/60" /> AI chat interface</div>
                        <div className="flex items-center gap-3 text-[13px] text-muted-foreground"><Network className="w-4 h-4 text-primary/60" /> Knowledge graph</div>
                        <div className="flex items-center gap-3 text-[13px] text-muted-foreground"><AlertTriangle className="w-4 h-4 text-primary/60" /> Conflict detection</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Right Column (Form) */}
                  <div>
                    <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm flex flex-col h-full">
                      <div className="mb-6">
                        <h3 className="text-base font-semibold text-foreground tracking-tight">Meeting details</h3>
                        <p className="text-[13px] text-muted-foreground mt-1">Only the recording is required — all other fields are optional</p>
                      </div>
                      
                      <div className="space-y-5 flex-1">
                        <div>
                          <label className="text-[13px] font-medium text-foreground mb-2 block">Meeting title</label>
                          <div className="w-full rounded-xl border border-border/50 bg-muted/50 px-3.5 py-2.5 text-[13px] text-muted-foreground">
                            e.g. Q4 product review
                          </div>
                        </div>
                        
                        <div>
                          <label className="text-[13px] font-medium text-foreground mb-2 block">Project</label>
                          <div className="w-full rounded-xl border border-border/50 bg-muted/50 px-3.5 py-2.5 text-[13px] flex justify-between items-center cursor-pointer">
                            <div className="flex items-center gap-2">
                              <span className="text-foreground">Testing</span>
                              <span className="text-[10px] font-mono bg-background border border-border px-1.5 py-0.5 rounded text-muted-foreground uppercase">Personal Project</span>
                            </div>
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                          </div>
                        </div>
                        
                        <div>
                          <label className="text-[13px] font-medium text-foreground mb-2 block">Language</label>
                          <div className="w-full rounded-xl border border-border/50 bg-muted/50 px-3.5 py-2.5 text-[13px] text-foreground flex justify-between items-center cursor-pointer">
                            Auto-detect dominant language
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-2">Leave empty to auto-detect the dominant language</p>
                        </div>
                        
                        <div className="pt-1">
                          <div className="w-full rounded-xl border border-border/50 bg-muted/50 px-3.5 py-3 text-[13px] font-medium text-foreground flex justify-between items-center cursor-pointer">
                            <div className="flex items-center gap-2">
                              Speaker configuration <span className="text-[11px] bg-background border border-border px-1.5 py-0.5 rounded font-normal text-muted-foreground">Optional</span>
                            </div>
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                          </div>
                        </div>
                        
                        <div className="pt-3">
                          <label className="text-[13px] font-medium text-foreground mb-2 block">Recording</label>
                          <div className="bg-muted/50 p-1 rounded-lg flex mb-4 border border-border/50">
                            <div className="flex-1 bg-background text-foreground text-[13px] font-medium py-1.5 text-center rounded-md shadow-sm">Upload File</div>
                            <div className="flex-1 text-muted-foreground hover:text-foreground transition-colors text-[13px] font-medium py-1.5 text-center cursor-pointer">Record Live</div>
                          </div>
                          
                          <div className="border border-dashed border-border/50 rounded-xl bg-muted/30 flex flex-col items-center justify-center py-10 transition-colors hover:bg-muted/50 cursor-pointer">
                            <div className="h-10 w-10 bg-background rounded-full flex items-center justify-center mb-4 border border-border">
                              <UploadCloud className="w-5 h-5 text-muted-foreground" />
                            </div>
                            <div className="text-[13px] font-medium text-foreground">Drop your recording here</div>
                            <div className="text-[12px] text-muted-foreground mt-1.5">or click to browse — MP3, WAV, M4A, OGG</div>
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-3 text-center">Supported formats: MP3, WAV, M4A, OGG • Maximum 100MB</p>
                        </div>
                      </div>
                      
                      <div className="mt-8 flex items-center justify-between pt-5 border-t border-border/50">
                        <p className="text-[12px] text-muted-foreground">Processing usually takes under 5 minutes</p>
                        <Button disabled className="bg-muted text-muted-foreground/50 gap-2 font-medium rounded-full px-5 h-9 text-[13px]">
                          <Sparkles className="w-3.5 h-3.5" /> Start analysis
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </section>


      {/* Partners Section from hero-section-9 */}
      {/* <section className="bg-background relative z-10 pb-20 pt-10 border-b border-border/40">
          <div className="m-auto max-w-5xl px-6">
              <h2 className="text-center text-sm font-medium text-muted-foreground tracking-widest uppercase">Trusted by innovative teams</h2>
              <div className="mx-auto mt-10 flex flex-wrap items-center justify-center gap-x-12 gap-y-8 sm:gap-x-16 sm:gap-y-12 opacity-60 grayscale transition-all hover:grayscale-0 hover:opacity-100">
                  <img className="h-5 w-fit dark:invert" src="https://html.tailus.io/blocks/customers/nvidia.svg" alt="Nvidia Logo" height="20" width="auto" />
                  <img className="h-4 w-fit dark:invert" src="https://html.tailus.io/blocks/customers/github.svg" alt="GitHub Logo" height="16" width="auto" />
                  <img className="h-5 w-fit dark:invert" src="https://html.tailus.io/blocks/customers/vercel.svg" alt="Vercel Logo" height="20" width="auto" />
                  <img className="h-6 w-fit dark:invert" src="https://html.tailus.io/blocks/customers/openai.svg" alt="OpenAI Logo" height="24" width="auto" />
                  <img className="h-5 w-fit dark:invert" src="https://html.tailus.io/blocks/customers/zapier.svg" alt="Zapier Logo" height="20" width="auto" />
              </div>
          </div>
      </section> */}
    </div>
  );
}
