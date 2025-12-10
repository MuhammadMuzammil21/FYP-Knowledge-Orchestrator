import { MessageSquare } from 'lucide-react';

export function AuthBranding() {
    return (
        <div className="mb-8 text-center">
            {/* Logo */}
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/60 shadow-lg">
                <MessageSquare className="h-8 w-8 text-primary-foreground" strokeWidth={2.5} />
            </div>

            {/* Brand Name */}
            <h1 className="mb-2 text-3xl font-bold tracking-tight text-foreground">
                HarBaat AI
            </h1>

            {/* Motto */}
            <p className="text-sm text-muted-foreground">
                Transform Conversations into Actionable Insights
            </p>
        </div>
    );
}
