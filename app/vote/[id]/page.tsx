// "use client"

// import type React from "react"
// import Link from "next/link"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent } from "@/components/ui/card"
// import DashboardHeader from "@/components/dashboard/header"
// import { useEffect, useState } from "react"
// import axios from "axios"
// import { useParams } from "next/navigation"
// import { CenteredLoader } from "@/components/ui/loader"

// interface VotingApiResponse {
//   electionId: number
//   positions: {
//     positionId: number
//     positionName: string
//     allowMultiple: boolean
//     maxSelections: number | null
//     candidates: {
//       nominationId: string
//       candidateName: string
//       year: number
//       department: string
//     }[]
//   }[]
// }

// interface Candidate {
//   id: string
//   name: string
//   year: string
//   department: string
//   positionId: number
// }

// export default function VotingPage() {
//   const param = useParams()
//   const electionId = param.id as string

//   const [positions, setPositions] = useState<
//     {
//       id: number
//       title: string
//       allowMultiple: boolean
//       maxSelections: number
//     }[]
//   >([])

//   const [candidates, setCandidates] = useState<Candidate[]>([])
//   const [selectedVotes, setSelectedVotes] = useState<Record<number, string[]>>({})
//   const [showConfirmation, setShowConfirmation] = useState(false)
//   const [loading, setLoading] = useState(true)

//   /* =========================
//      FETCH DATA
//      ========================= */
//   useEffect(() => {
//     axios
//       .get<VotingApiResponse>(`/api/users/elections/${electionId}/voting`)
//       .then((res) => {
//         const apiData = res.data

//         setPositions(
//           apiData.positions.map((p) => ({
//             id: p.positionId,
//             title: p.positionName,
//             allowMultiple: p.allowMultiple,
//             maxSelections: p.maxSelections ?? 1,
//           }))
//         )

//         const mapped: Candidate[] = []
//         apiData.positions.forEach((p) => {
//           p.candidates.forEach((c) => {
//             mapped.push({
//               id: c.nominationId,
//               name: c.candidateName,
//               year: String(c.year),
//               department: c.department,
//               positionId: p.positionId,
//             })
//           })
//         })

//         setCandidates(mapped)
//       })
//       .finally(() => setLoading(false))
//   }, [electionId])

//   /* =========================
//      SELECTION HANDLER
//      ========================= */
//   const handleCandidateSelect = (
//     positionId: number,
//     candidateId: string,
//     allowMultiple: boolean,
//     maxSelections: number
//   ) => {
//     setSelectedVotes((prev) => {
//       const current = prev[positionId] ?? []

//       if (!allowMultiple) {
//         return { ...prev, [positionId]: [candidateId] }
//       }

//       if (current.includes(candidateId)) {
//         return {
//           ...prev,
//           [positionId]: current.filter((id) => id !== candidateId),
//         }
//       }

//       if (current.length >= maxSelections) return prev

//       return {
//         ...prev,
//         [positionId]: [...current, candidateId],
//       }
//     })
//   }

//   const allPositionsSelected = positions.every((p) => {
//     const selected = selectedVotes[p.id] ?? []
//     return selected.length === p.maxSelections
//   })

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault()
//     if (allPositionsSelected) setShowConfirmation(true)
//   }

//   const handleConfirmVote = async () => {
//     const payload: Record<number, string[]> = {}
//     Object.entries(selectedVotes).forEach(([pid, ids]) => {
//       payload[Number(pid)] = ids
//     })
// try{
//   const response = await axios.post(`/api/users/elections/${electionId}/vote`, { votes: payload })}
//   catch (error) {
//     console.error("Error submitting votes:", error)
//     if(error instanceof axios.AxiosError){
//       alert(`Error submitting votes: ${error.response?.data.error || error.message}`)
//     }
//     return
//   }
//   finally{
  
//     window.location.href = "/vote-confirmation"}
//   }

//   if (loading) return <CenteredLoader />

//   /* =========================
//      RENDER
//      ========================= */
//   return (
//     <div className="min-h-screen bg-background">
//       <DashboardHeader />

//       <main className="max-w-4xl mx-auto px-4 py-8">
//         <Link href="/dashboard">
//           <Button variant="ghost" className="mb-6">
//             ← Back to Dashboard
//           </Button>
//         </Link>

//         <form onSubmit={handleSubmit} className="space-y-10">
//           {positions.map((position) => {
//             const positionCandidates = candidates.filter(
//               (c) => c.positionId === position.id
//             )

//             return (
//               <div key={position.id}>
//                 <h2 className="text-2xl font-bold mb-1">{position.title}</h2>
//                 <p className="text-sm text-muted-foreground mb-4">
//                   Select {position.maxSelections} candidate
//                   {position.maxSelections > 1 ? "s" : ""}
//                 </p>

//                 <div className="space-y-4">
//                   {positionCandidates.map((candidate) => {
//                     const selected =
//                       selectedVotes[position.id]?.includes(candidate.id) ?? false

//                     return (
//                       <Card
//                         key={candidate.id}
//                         className={`cursor-pointer ${
//                           selected ? "ring-2 ring-primary bg-primary/5" : ""
//                         }`}
//                         onClick={() =>
//                           handleCandidateSelect(
//                             position.id,
//                             candidate.id,
//                             position.allowMultiple,
//                             position.maxSelections
//                           )
//                         }
//                       >
//                         <CardContent className="p-6 flex gap-4">
//                           <input
//                             type={position.allowMultiple ? "checkbox" : "radio"}
//                             checked={selected}
//                             readOnly
//                             className="mt-1"
//                           />
//                           <div>
//                             <h3 className="font-semibold">{candidate.name}</h3>
//                             <p className="text-sm text-muted-foreground">
//                               Batch {candidate.year} • {candidate.department}
//                             </p>
//                           </div>
//                         </CardContent>
//                       </Card>
//                     )
//                   })}
//                 </div>
//               </div>
//             )
//           })}

//           <div className="flex justify-end gap-3 pt-6 border-t">
//             <Link href="/dashboard">
//               <Button variant="outline">Cancel</Button>
//             </Link>
//             <Button type="submit" disabled={!allPositionsSelected}>
//               Review & Submit Votes
//             </Button>
//           </div>
//         </form>
//       </main>

//       {showConfirmation && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
//           <Card className="max-w-md w-full">
//             <CardContent className="p-6 space-y-4">
//               <h2 className="font-semibold text-primary">Confirm Your Votes</h2>

//               {positions.map((p) => (
//                 <div key={p.id}>
//                   <p className="text-xs uppercase text-muted-foreground">
//                     {p.title}
//                   </p>
//                   {(selectedVotes[p.id] ?? []).map((cid) => {
//                     const c = candidates.find((x) => x.id === cid)
//                     return <p key={cid}>{c?.name}</p>
//                   })}
//                 </div>
//               ))}

//               <div className="flex gap-3 pt-4">
//                 <Button onClick={handleConfirmVote} className="flex-1">
//                   Confirm & Submit
//                 </Button>
//                 <Button
//                   variant="outline"
//                   onClick={() => setShowConfirmation(false)}
//                   className="flex-1"
//                 >
//                   Back
//                 </Button>
//               </div>
//             </CardContent>
//           </Card>
//         </div>
//       )}
//     </div>
//   )
// }









"use client"

import type React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import DashboardHeader from "@/components/dashboard/header"
import { useEffect, useState, useMemo } from "react"
import axios from "axios"
import { useParams } from "next/navigation"
import { CenteredLoader } from "@/components/ui/loader"

interface VotingApiResponse {
  electionId: number
  positions: {
    positionId: number
    positionName: string
    allowMultiple: boolean
    maxSelections: number | null
    candidates: {
      nominationId: string
      candidateName: string
      year: number
      department: string
    }[]
  }[]
}

interface Candidate {
  id: string
  name: string
  year: string
  department: string
  positionId: number
}

export default function VotingPage() {
  const param = useParams()
  const electionId = param.id as string

  const [positions, setPositions] = useState<
    {
      id: number
      title: string
      allowMultiple: boolean
      maxSelections: number
    }[]
  >([])

  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [selectedVotes, setSelectedVotes] = useState<Record<number, string[]>>({})
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [loading, setLoading] = useState(true)

  /* =========================
     FETCH DATA
     ========================= */
  useEffect(() => {
    axios
      .get<VotingApiResponse>(`/api/users/elections/${electionId}/voting`)
      .then((res) => {
        const apiData = res.data

        setPositions(
          apiData.positions.map((p) => ({
            id: p.positionId,
            title: p.positionName,
            allowMultiple: p.allowMultiple,
            maxSelections: p.maxSelections ?? 1,
          }))
        )

        const mapped: Candidate[] = []
        apiData.positions.forEach((p) => {
          p.candidates.forEach((c) => {
            mapped.push({
              id: c.nominationId,
              name: c.candidateName,
              year: String(c.year),
              department: c.department,
              positionId: p.positionId,
            })
          })
        })

        setCandidates(mapped)
      })
      .finally(() => setLoading(false))
  }, [electionId])

  /* =========================
     DETERMINE UNCONTESTED
     ========================= */
  const positionMeta = useMemo(() => {
    return positions.map((p) => {
      const positionCandidates = candidates.filter((c) => c.positionId === p.id)

      const uncontested =
        positionCandidates.length === 0 ||
        positionCandidates.length <= p.maxSelections

      return {
        ...p,
        candidates: positionCandidates,
        uncontested,
      }
    })
  }, [positions, candidates])

  /* =========================
     SELECTION HANDLER
     ========================= */
  const handleCandidateSelect = (
    positionId: number,
    candidateId: string,
    allowMultiple: boolean,
    maxSelections: number
  ) => {
    setSelectedVotes((prev) => {
      const current = prev[positionId] ?? []

      if (!allowMultiple) {
        return { ...prev, [positionId]: [candidateId] }
      }

      if (current.includes(candidateId)) {
        return {
          ...prev,
          [positionId]: current.filter((id) => id !== candidateId),
        }
      }

      if (current.length >= maxSelections) return prev

      return {
        ...prev,
        [positionId]: [...current, candidateId],
      }
    })
  }

  /* =========================
     CHECK IF ALL REQUIRED VOTES DONE
     ========================= */
  const allPositionsSelected = positionMeta
    .filter((p) => !p.uncontested)
    .every((p) => {
      const selected = selectedVotes[p.id] ?? []
      return selected.length === p.maxSelections
    })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (allPositionsSelected) setShowConfirmation(true)
  }

  /* =========================
     SUBMIT VOTES
     ========================= */
  const handleConfirmVote = async () => {
    const payload: Record<number, string[]> = {}

    Object.entries(selectedVotes).forEach(([pid, ids]) => {
      const position = positionMeta.find((p) => p.id === Number(pid))
      if (position && !position.uncontested) {
        payload[Number(pid)] = ids
      }
    })

    try {
      await axios.post(`/api/users/elections/${electionId}/vote`, {
        votes: payload,
      })
    } catch (error) {
      console.error("Error submitting votes:", error)
      if (error instanceof axios.AxiosError) {
        alert(`Error submitting votes: ${error.response?.data.error || error.message}`)
      }
      return
    } finally {
      window.location.href = "/vote-confirmation"
    }
  }

  if (loading) return <CenteredLoader />

  /* =========================
     RENDER
     ========================= */
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/dashboard">
          <Button variant="ghost" className="mb-6">
            ← Back to Dashboard
          </Button>
        </Link>

        <form onSubmit={handleSubmit} className="space-y-10">
          {positionMeta.map((position) => {
            const positionCandidates = position.candidates

            return (
              <div key={position.id}>
                <h2 className="text-2xl font-bold mb-1">{position.title}</h2>

                {position.uncontested ? (
                  <Card>
                    <CardContent className="p-6">
                      {positionCandidates.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          No nominations received for this position.
                        </p>
                      ) : (
                        <>
                          <p className="text-sm text-muted-foreground mb-3">
                            Number of candidates is less than or equal to required seats.
                            These candidates will win uncontested.
                          </p>

                          {positionCandidates.map((candidate) => (
                            <p key={candidate.id} className="font-medium">
                              {candidate.name} — Batch {candidate.year} • {candidate.department}
                            </p>
                          ))}
                        </>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground mb-4">
                      Select {position.maxSelections} candidate
                      {position.maxSelections > 1 ? "s" : ""}
                    </p>

                    <div className="space-y-4">
                      {positionCandidates.map((candidate) => {
                        const selected =
                          selectedVotes[position.id]?.includes(candidate.id) ?? false

                        return (
                          <Card
                            key={candidate.id}
                            className={`cursor-pointer ${
                              selected ? "ring-2 ring-primary bg-primary/5" : ""
                            }`}
                            onClick={() =>
                              handleCandidateSelect(
                                position.id,
                                candidate.id,
                                position.allowMultiple,
                                position.maxSelections
                              )
                            }
                          >
                            <CardContent className="p-6 flex gap-4">
                              <input
                                type={position.allowMultiple ? "checkbox" : "radio"}
                                checked={selected}
                                readOnly
                                className="mt-1"
                              />
                              <div>
                                <h3 className="font-semibold">{candidate.name}</h3>
                                <p className="text-sm text-muted-foreground">
                                  Batch {candidate.year} • {candidate.department}
                                </p>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  </>
                )}
              </div>
            )
          })}

          <div className="flex justify-end gap-3 pt-6 border-t">
            <Link href="/dashboard">
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button type="submit" disabled={!allPositionsSelected}>
              Review & Submit Votes
            </Button>
          </div>
        </form>
      </main>

      {showConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <Card className="max-w-md w-full">
            <CardContent className="p-6 space-y-4">
              <h2 className="font-semibold text-primary">Confirm Your Votes</h2>

              {positionMeta.map((p) => (
                <div key={p.id}>
                  <p className="text-xs uppercase text-muted-foreground">
                    {p.title}
                  </p>

                  {p.uncontested ? (
                    p.candidates.map((c) => (
                      <p key={c.id}>{c.name} (Uncontested)</p>
                    ))
                  ) : (
                    (selectedVotes[p.id] ?? []).map((cid) => {
                      const c = candidates.find((x) => x.id === cid)
                      return <p key={cid}>{c?.name}</p>
                    })
                  )}
                </div>
              ))}

              <div className="flex gap-3 pt-4">
                <Button onClick={handleConfirmVote} className="flex-1">
                  Confirm & Submit
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowConfirmation(false)}
                  className="flex-1"
                >
                  Back
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
