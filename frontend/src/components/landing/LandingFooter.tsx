import Link from 'next/link';
import { MessageSquare } from 'lucide-react';

const footerLinks = {
  Product: [
    { label: 'Features', href: '#features' },
    { label: 'How it works', href: '#how-it-works' },
    { label: 'FAQ', href: '#faq' },
  ],
};

export function LandingFooter() {
  return (
    <footer className="bg-background pt-16 pb-8 relative">
      <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/40 to-transparent absolute top-0 left-0" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Top grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 mb-12">
          {/* Brand col */}
          <div>
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] shadow-sm">
                <MessageSquare className="h-4 w-4 text-primary-foreground" strokeWidth={2.5} />
              </div>
              <span className="text-lg font-display font-semibold tracking-tight text-foreground">HarBaat AI</span>
            </Link>
            <p className="mt-3 text-sm text-muted-foreground font-sans leading-relaxed">
              AI-powered meeting transcription and analysis. Turn every conversation into actionable
              knowledge.
            </p>
          </div>

          {/* Link groups */}
          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group}>
              <h3 className="font-display text-sm tracking-widest uppercase text-muted-foreground mb-4">{group}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm font-sans text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border/50 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 font-sans text-sm text-muted-foreground">
          <p>© 2025 HarBaat AI. All rights reserved.</p>
          <p className="italic">Made for teams who listen.</p>
        </div>
      </div>
    </footer>
  );
}
