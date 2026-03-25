"use client"

import React, { use } from "react"
import { useEffect, useState } from "react"
import axios from "axios"

/* ================= TYPES ================= */

interface SnapshotRow {
  position_id: number
  position_name: string
  candidate_user_id: string
  candidate_name: string
  vote_count: number
  is_tie: boolean
  result_type?: "VOTED" | "UNCONTESTED"
  max_selections: number
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default function ElectionResultsPage({ params }: PageProps) {
  const { id: electionId } = use(params)

  const [snapshot, setSnapshot] = useState<SnapshotRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  /* ================= FETCH ================= */

  useEffect(() => {
    const fetchSnapshot = async () => {
      try {
        const res = await axios.get<SnapshotRow[]>(
          `/api/admin/results/snapshot?electionId=${electionId}`,
          { headers: { "Cache-Control": "no-store" } }
        )
        setSnapshot(res.data)
      } catch (err) {
        console.error(err)
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchSnapshot()
  }, [electionId])

  if (loading) return <p>Loading…</p>
  if (error) return <p>Results not available</p>

  /* ================= GROUP + FIX LOGIC ================= */

  const grouped: Record<number, any> = {}

  snapshot.forEach(row => {
    if (!grouped[row.position_id]) {
      grouped[row.position_id] = {
        positionId: row.position_id,
        position: row.position_name,
        maxSelections: row.max_selections,
        candidates: [],
      }
    }

    grouped[row.position_id].candidates.push({
      id: row.candidate_user_id,
      name: row.candidate_name,
      voteCount: row.vote_count,
      isTie: row.is_tie,
      resultType: row.result_type,
    })
  })

  const results = Object.values(grouped).map((position: any) => {
    const candidates = [...position.candidates]

    const isUncontested = candidates.every(
      (c: any) => c.resultType === "UNCONTESTED"
    )

    if (isUncontested) {
      return {
        ...position,
        candidates: candidates.map((c: any) => ({
          ...c,
          isWinner: true,
        })),
        tieResolvedByPresident: false,
      }
    }

    // sort by votes
    candidates.sort((a: any, b: any) => b.voteCount - a.voteCount)

    const cutoff =
      candidates[position.maxSelections - 1]?.voteCount ?? 0

    const winners = candidates.filter(
      (c: any) => c.voteCount >= cutoff
    )

    // detect tie at boundary
    const tiedAtBoundary = candidates.filter(
      (c: any) => c.voteCount === cutoff
    )

    const tieResolvedByPresident =
      tiedAtBoundary.length > 1 &&
      winners.some((c: any) => !c.isTie)

    return {
      ...position,
      tieResolvedByPresident,
      candidates: candidates.map((c: any) => ({
        ...c,
        isWinner: c.voteCount >= cutoff,
      })),
    }
  })

  /* ================= RENDER ================= */

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-6 text-3xl font-bold">
          Election Results
        </h1>

        <div className="space-y-8">
          {results.map((position: any) => (
            <div key={position.positionId}>
              <h2 className="mb-4 text-xl font-semibold">
                {position.position}
              </h2>

              <div className="space-y-3">
                {position.candidates.map((c: any) => (
                  <div
                    key={c.id}
                    className={`rounded-lg border p-6 ${
                      c.isWinner
                        ? "border-primary bg-primary/5"
                        : "border-border bg-card"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold">{c.name}</h3>

                      {c.isWinner && (
                        <span className="rounded-full bg-primary px-3 py-1 text-xs text-primary-foreground">
                          {c.resultType === "UNCONTESTED"
                            ? "Winner (Uncontested)"
                            : position.tieResolvedByPresident
                            ? "Winner (President Vote)"
                            : "Winner"}
                        </span>
                      )}
                    </div>

                    <p className="mt-2 text-sm text-muted-foreground">
                      {c.voteCount} votes
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}