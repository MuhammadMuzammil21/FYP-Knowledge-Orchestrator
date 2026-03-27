import Link from 'next/link'
import { Folder, FileText, Calendar, ChevronRight } from 'lucide-react'
import type { Project } from '@/types'
import { formatDate } from '@/lib/utils/date'

interface ProjectCardProps {
  project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
  const formattedDate = formatDate(project.created_at)

  return (
    <Link href={`/projects/${project.id}`}>
      <div className="group rounded-xl border border-border bg-card p-5 hover:border-primary/30 hover:bg-card transition-all duration-200 cursor-pointer relative overflow-hidden">
        {/* Subtle hover background glow */}
        <div className="pointer-events-none absolute inset-0 rounded-xl bg-primary/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

        {/* Card header */}
        <div className="relative flex items-start justify-between mb-4">
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-200 flex-shrink-0">
            <Folder className="h-4.5 w-4.5 text-primary" />
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200 mt-0.5" />
        </div>

        {/* Project name */}
        <div className="relative">
          <h3 className="font-semibold text-sm leading-snug group-hover:text-primary transition-colors duration-150 truncate">
            {project.name}
          </h3>
          {project.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
              {project.description}
            </p>
          )}
        </div>

        {/* Metadata footer */}
        <div className="relative mt-4 pt-4 border-t border-border/60 flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <FileText className="h-3 w-3" />
            <span>
              {project.meeting_count} meeting{project.meeting_count !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>{formattedDate}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
