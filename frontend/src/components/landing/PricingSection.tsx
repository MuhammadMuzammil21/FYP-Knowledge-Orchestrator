import Link from 'next/link';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface PricingTier {
  name: string;
  price: string;
  subtitle: string;
  features: string[];
  featured: boolean;
}

const tiers: PricingTier[] = [
  {
    name: 'Free',
    price: '$0',
    subtitle: '5 meetings per month · 30 min max duration',
    featured: false,
    features: ['Basic transcription', 'Speaker labels', 'Entity extraction', '7-day history'],
  },
  {
    name: 'Pro',
    price: '$12',
    subtitle: 'Unlimited meetings · 2hr max duration',
    featured: true,
    features: [
      'Everything in Free',
      'AI chat (RAG)',
      'Conflict detection',
      'Knowledge graph',
      '90-day history',
      'Priority processing',
    ],
  },
  {
    name: 'Team',
    price: '$49',
    subtitle: 'Up to 10 seats · No duration limit',
    featured: false,
    features: [
      'Everything in Pro',
      'Team workspace',
      'Admin dashboard',
      'SSO (coming soon)',
      'Unlimited history',
      'Dedicated support',
    ],
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-20 sm:py-24 bg-muted/30">
      <div className="text-center max-w-2xl mx-auto mb-16 px-4">
        <p className="text-xs font-semibold tracking-widest text-primary uppercase mb-3">Pricing</p>
        <h2 className="text-4xl font-bold tracking-tight">Simple, transparent pricing</h2>
        <p className="mt-4 text-muted-foreground text-lg">
          Start free. Upgrade when you need more.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto px-4 items-start">
        {tiers.map((tier) => (
          <div
            key={tier.name}
            className={
              tier.featured
                ? 'rounded-2xl border-2 border-primary bg-card p-8 shadow-xl shadow-primary/10 md:scale-[1.02] relative'
                : 'rounded-2xl border border-border bg-card p-8'
            }
          >
            {tier.featured && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground">Most popular</Badge>
              </div>
            )}
            <div className="mb-6">
              <h3 className="font-semibold text-lg">{tier.name}</h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-4xl font-bold">{tier.price}</span>
                {tier.price !== '$0' && (
                  <span className="text-muted-foreground text-sm">/ month</span>
                )}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{tier.subtitle}</p>
            </div>
            <Link href="/signup">
              <Button className="w-full" variant={tier.featured ? 'default' : 'outline'}>
                {tier.price === '$0' ? 'Get started free' : 'Start free trial'}
              </Button>
            </Link>
            <ul className="mt-6 space-y-3">
              {tier.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{f}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
