import { Star } from 'lucide-react'

const testimonials = [
  {
    quote: 'This saved our team 3 hours every week. We used to spend Monday mornings writing up meeting notes — now it\'s instant.',
    name: 'Sarah K.',
    role: 'Product Lead',
    initials: 'SK',
  },
  {
    quote: 'The conflict detection feature caught a deadline that changed between two meetings that nobody noticed. Saved us from a client disaster.',
    name: 'Marcus T.',
    role: 'Project Manager',
    initials: 'MT',
  },
  {
    quote: 'Being able to ask questions about a meeting I missed is genuinely magical. I feel like I was there.',
    name: 'Priya S.',
    role: 'Engineering Manager',
    initials: 'PS',
  },
  {
    quote: 'We run 20+ client calls a week. HarBaat replaced our entire note-taking workflow in a single day.',
    name: 'James W.',
    role: 'Agency Director',
    initials: 'JW',
  },
  {
    quote: 'The speaker identification is surprisingly accurate. Even our CEO\'s voice was correctly labeled from the first meeting.',
    name: 'Amina R.',
    role: 'Operations Lead',
    initials: 'AR',
  },
  {
    quote: 'Setup was instant. Upload audio, done. No training, no complex configuration. It just works.',
    name: 'David L.',
    role: 'Startup Founder',
    initials: 'DL',
  },
]

export function TestimonialsSection() {
  return (
    <section className="py-20 sm:py-24 px-4">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <p className="text-xs font-semibold tracking-widest text-primary uppercase mb-3">Testimonials</p>
        <h2 className="text-4xl font-bold tracking-tight">What teams are saying</h2>
        <p className="mt-4 text-muted-foreground text-lg">
          Hear from teams who are saving hours every week with HarBaat AI.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
        {testimonials.map((testimonial) => (
          <div
            key={testimonial.name}
            className="rounded-2xl border border-border bg-card p-6 flex flex-col gap-4"
          >
            {/* Stars */}
            <div className="flex gap-0.5 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-current" />
              ))}
            </div>
            {/* Quote */}
            <p className="text-sm text-foreground leading-relaxed flex-1">
              &ldquo;{testimonial.quote}&rdquo;
            </p>
            {/* Attribution */}
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-semibold">
                {testimonial.initials}
              </div>
              <div>
                <p className="text-sm font-medium">{testimonial.name}</p>
                <p className="text-xs text-muted-foreground">{testimonial.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
