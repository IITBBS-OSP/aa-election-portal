"use client"

import Link from "next/link"

interface ElectionCardProps {
   academic_year: string
  candidateCount: number
  created_at: string
  id: number
  positionCount: number
  status: 'DRAFT' | 'NOMINATION' | 'VOTING' | 'RESULTS_PUBLISHED'| 'CLOSED'|'CAMPAIGN'
  title: string
}

export function ElectionCard({ id, title, academic_year, status   , positionCount, candidateCount }: ElectionCardProps) {
  const phaseColors = {
    DRAFT: "bg-muted text-muted-foreground",
    NOMINATION: "bg-primary text-primary-foreground",
    VOTING: "bg-primary text-primary-foreground",
    RESULTS_PUBLISHED: "bg-secondary text-secondary-foreground",
    CLOSED: "bg-destructive text-destructive-foreground",
    CAMPAIGN: "bg-warning text-warning-foreground",
    Default: "bg-accent text-accent-foreground",
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">{academic_year}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${phaseColors[status]}`}>{status}</span>
      </div>

      <div className="mb-4 flex gap-4 text-sm">
        <div>
          <p className="text-muted-foreground">Positions</p>
          <p className="font-semibold text-foreground">{positionCount}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Candidates</p>
          <p className="font-semibold text-foreground">{candidateCount}</p>
        </div>
      </div>

      <Link
        href={`/admin/elections/${id}`}
        className="block w-full text-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
      >
        Open Election
      </Link>
    </div>
  )
}
