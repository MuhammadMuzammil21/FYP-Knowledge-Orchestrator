'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useCreateTeam } from '@/hooks/useTeams';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function CreateTeamPage() {
  const router = useRouter();
  const createTeam = useCreateTeam();

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);

    if (!slugManuallyEdited) {
      setSlug(
        newName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '')
      );
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, ''));
    setSlugManuallyEdited(true);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !slug.trim()) return;

    createTeam.mutate(
      { name, slug, description },
      {
        onSuccess: (data) => {
          router.push(`/teams/${data.slug}`);
        },
      }
    );
  };

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto w-full">
      <Link
        href="/teams"
        className="inline-flex items-center text-sm font-medium text-primary hover:underline mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to teams
      </Link>

      <div className="rounded-xl border border-border bg-card shadow-sm">
        <div className="flex flex-col space-y-1.5 p-6 border-b border-border">
          <h3 className="text-2xl font-semibold leading-none tracking-tight">Create a team</h3>
          <p className="text-sm text-muted-foreground">
            Teams allow you to collaborate on projects and share meetings with others.
          </p>
        </div>

        <div className="p-6">
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Team name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="e.g. Acme Corp"
                  required
                  value={name}
                  onChange={handleNameChange}
                  disabled={createTeam.isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">
                  Team URL <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="slug"
                  placeholder="e.g. acme-corp"
                  required
                  value={slug}
                  onChange={handleSlugChange}
                  disabled={createTeam.isPending}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Your team will be accessed at harbaat.ai/teams/
                  <span className="font-semibold text-foreground">{slug || '...'}</span>
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Input
                  id="description"
                  placeholder="What is this team for?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={createTeam.isPending}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={createTeam.isPending || !name || !slug}
            >
              {createTeam.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating team...
                </>
              ) : (
                'Create team'
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
