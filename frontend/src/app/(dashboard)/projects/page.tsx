'use client'

import { useProjects } from '@/hooks/useProjects'
import { ProjectCard } from '@/components/projects/ProjectCard'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Folder, Plus } from 'lucide-react'
import Link from 'next/link'
import { useWorkspace } from '@/contexts/WorkspaceContext'

export default function ProjectsPage() {
  const { activeTeamId, isTeamWorkspace, workspace } = useWorkspace()
  const { data: projects, isLoading, error } = useProjects(activeTeamId)

  if (error) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-center">
          <div className="h-12 w-12 rounded-xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <span className="text-destructive text-lg">!</span>
          </div>
          <h2 className="font-semibold text-foreground mb-1">Failed to load projects</h2>
          <p className="text-sm text-muted-foreground">Please try refreshing the page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto w-full">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight">
            {isTeamWorkspace && typeof workspace !== 'string' ? `${workspace.name} — Projects` : 'Projects'}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Organize meetings into projects for cross-meeting insights
          </p>
        </div>
        <Link href="/dashboard">
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            New meeting
          </Button>
        </Link>
      </div>

      {/* Content */}
      {isLoading ? (
        /* Skeleton grid — matches card structure */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-start justify-between mb-4">
                <Skeleton className="h-9 w-9 rounded-lg" />
              </div>
              <Skeleton className="h-4 w-36 mb-2" />
              <Skeleton className="h-3 w-48 mb-1" />
              <Skeleton className="h-3 w-32" />
              <div className="mt-4 pt-4 border-t border-border/60 flex items-center justify-between">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ))}
        </div>
      ) : projects && projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        /* Empty state */
        <div className="rounded-xl border border-border bg-card">
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
              <Folder className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-base mb-2">No projects yet</h3>
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
              Projects are created automatically when you upload your first meeting. You can also
              rename and organise them afterward.
            </p>
            <Link href="/dashboard" className="mt-6">
              <Button className="gap-2" size="sm">
                <Plus className="h-4 w-4" />
                Upload first meeting
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
