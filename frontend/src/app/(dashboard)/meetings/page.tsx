'use client'

import { useState } from 'react'
import { MeetingCard } from '@/components/meetings/MeetingCard'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useMeetings } from '@/hooks/useMeetings'
import { ChevronLeft, ChevronRight, Mic, Plus, SlidersHorizontal } from 'lucide-react'
import { PAGINATION_DEFAULTS } from '@/lib/constants'
import Link from 'next/link'

export default function MeetingsPage() {
  const [offset, setOffset] = useState(0)
  const limit = PAGINATION_DEFAULTS.LIMIT

  const { data, isLoading, error } = useMeetings({ limit, offset })

  const handlePrevious = () => setOffset(Math.max(0, offset - limit))
  const handleNext = () => setOffset(offset + limit)

  const hasPrevious = offset > 0
  const hasNext = data && data.length === limit

  if (error) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-center">
          <div className="h-12 w-12 rounded-xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <span className="text-destructive text-lg">!</span>
          </div>
          <h2 className="font-semibold text-foreground mb-1">Failed to load meetings</h2>
          <p className="text-sm text-muted-foreground">Please try refreshing the page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto w-full">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight">All meetings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {!isLoading && data
              ? `${data.length + offset} recording${data.length !== 1 ? 's' : ''}`
              : 'Your recorded meetings'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 text-muted-foreground hidden md:flex"
            disabled
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filter
          </Button>
          <Link href="/dashboard">
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              New meeting
            </Button>
          </Link>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        /* Skeleton — matches row structure exactly */
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 px-4 py-3.5 border-b border-border/50 last:border-0"
            >
              <Skeleton className="h-2 w-2 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-52" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-4 w-4 rounded" />
            </div>
          ))}
        </div>
      ) : data && data.length > 0 ? (
        <>
          {/* Meetings list container */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            {data.map((meeting) => (
              <MeetingCard key={meeting.id} meeting={meeting} />
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Showing {offset + 1}–{offset + data.length}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevious}
                disabled={!hasPrevious}
                className="gap-1.5 h-8"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNext}
                disabled={!hasNext}
                className="gap-1.5 h-8"
              >
                Next
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </>
      ) : (
        /* Empty state */
        <div className="rounded-xl border border-border bg-card">
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
              <Mic className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-base mb-2">No meetings yet</h3>
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
              Upload your first recording to get AI-powered transcripts, speaker identification, and
              actionable insights.
            </p>
            <Link href="/dashboard" className="mt-6">
              <Button className="gap-2" size="sm">
                <Plus className="h-4 w-4" />
                Upload your first meeting
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
