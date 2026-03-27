'use client'

import Link from 'next/link'
import { ChevronRight, Calendar, Clock } from 'lucide-react'
import { StatusBadge } from './StatusBadge'
import type { Meeting } from '@/types/domain.types'
import { formatDate, formatTime } from '@/lib/utils/date'
import { cn } from '@/lib/utils'

interface MeetingCardProps {
  meeting: Meeting
}

export function MeetingCard({ meeting }: MeetingCardProps) {
  const formattedDate = formatDate(meeting.createdAt)
  const formattedTime = formatTime(meeting.createdAt)

  return (
    <Link href={`/meetings/${meeting.id}`}>
      <div className="group flex items-center gap-4 px-4 py-3.5 hover:bg-accent/40 transition-colors duration-150 border-b border-border/50 last:border-0 cursor-pointer">
        {/* Status dot */}
        <div
          className={cn(
            'h-2 w-2 rounded-full flex-shrink-0',
            meeting.status === 'completed' && 'bg-green-400',
            meeting.status === 'processing' && 'bg-blue-400 animate-pulse',
            meeting.status === 'queued' && 'bg-amber-400',
            meeting.status === 'error' && 'bg-red-400'
          )}
        />

        {/* Title + metadata */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors duration-150">
            {meeting.title || `Meeting ${meeting.id.slice(0, 8)}`}
          </p>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {formattedDate}
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {formattedTime}
            </span>
          </div>
        </div>

        {/* Status badge */}
        <StatusBadge status={meeting.status} size="sm" />

        {/* Arrow — appears on hover */}
        <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex-shrink-0" />
      </div>
    </Link>
  )
}
