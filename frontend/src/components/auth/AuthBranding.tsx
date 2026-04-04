import { MessageSquare } from 'lucide-react';
import Link from 'next/link';

export function AuthBranding() {
  return (
    <div className="mb-8 text-center">
      {/* Logo */}
      <Link href="/">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[oklch(0.88_0.05_150)] to-[oklch(0.65_0.12_195)] shadow-lg transition-transform duration-200 hover:scale-105">
          <MessageSquare className="h-8 w-8 text-primary-foreground" strokeWidth={2.5} />
        </div>
      </Link>

      {/* Brand Name */}
      <h1 className="mb-2 text-3xl font-bold tracking-tight text-foreground">HarBaat AI</h1>

      {/* Motto */}
      <p className="text-sm text-muted-foreground">
        Transform Conversations into Actionable Insights
      </p>
    </div>
  );
}
