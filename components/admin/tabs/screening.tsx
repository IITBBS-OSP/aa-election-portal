"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { CenteredLoader } from "@/components/ui/loader"

export interface ElectionCandidatesResponse {
  positionId: number
  positionName: string
  candidates: CandidateUI[]
}

export interface CandidateUI {
  nominationId: number
  name: string
  graduationYear: number
  department: string
  imageUrl: string | null
  sopUrl: string | null
}

export default function CampaignTab({ election }: { election: any }) {
  const [positions, setPositions] = useState<ElectionCandidatesResponse[] | null>(null)
  const [loading, setLoading] = useState(true)

  async function fetchCandidates() {
    try {
      const res = await fetch(`/api/users/elections/${election.id}/candidates`)
      const data = await res.json()
      setPositions(data)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching candidates:", error)
    }
  }

  useEffect(() => {
    fetchCandidates()
  }, [election.id])

  /* =========================
     CANCEL NOMINATION
     ========================= */

  async function handleCancelNomination(nominationId: number) {
    const confirmCancel = confirm("Are you sure you want to cancel this nomination?")
    if (!confirmCancel) return

    try {
      await fetch(`/api/admin/nominations/${nominationId}/cancel`, {
        method: "PATCH",
      })

      // refresh candidates
      fetchCandidates()
    } catch (error) {
      console.error("Failed to cancel nomination", error)
    }
  }

  if (loading) return <CenteredLoader />

  return (
    <div className="space-y-8">
      {positions?.map((position) => (
        <div key={position.positionId}>
          {/* Position Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-primary mb-1">
              {position.positionName}
            </h2>
          </div>

          {/* Candidates */}
          {position.candidates.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
              {position.candidates.map((candidate) => (
                <Card
                  key={candidate.nominationId}
                  className="card-elevated flex flex-col overflow-hidden"
                >
                  <CardContent className="p-6 flex flex-col h-full">
                    {/* Image */}
                    <div className="mb-4 -m-6">
                      <img
                        src={`/api/documents/${encodeURIComponent(
                          candidate.imageUrl ?? ""
                        )}`}
                        alt={candidate.name}
                        className="w-full aspect-square object-cover"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-foreground mb-2">
                        {candidate.name}
                      </h3>

                      <div className="space-y-1 mb-4 text-sm text-muted-foreground">
                        <p>
                          <span className="font-medium text-foreground">
                            Department:
                          </span>{" "}
                          {candidate.department}
                        </p>

                        <p>
                          <span className="font-medium text-foreground">
                            Graduation:
                          </span>{" "}
                          {candidate.graduationYear}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <a
                        href={`/api/documents/${encodeURIComponent(
                          candidate.sopUrl ?? ""
                        )}`}
                        target="_blank"
                        className="text-primary text-sm font-medium hover:text-primary/80"
                      >
                        View Statement of Purpose →
                      </a>

                      <Button
                        variant="destructive"
                        
                        onClick={() =>
                          handleCancelNomination(candidate.nominationId)
                        }
                      >
                        Cancel Nomination
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="card-elevated mb-8">
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">
                  No approved candidates yet.
                </p>
              </CardContent>
            </Card>
          )}

          {position.positionId !==
            positions[positions.length - 1].positionId && (
            <div className="border-t border-border mb-8" />
          )}
        </div>
      ))}
    </div>
  )
}