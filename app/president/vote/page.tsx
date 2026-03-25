// "use client"

// import { useEffect, useState } from "react"
// import { useSearchParams } from "next/navigation"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"

// interface Candidate {
//   candidateUserId: string
//   name: string
// }

// interface Position {
//   positionId: number
//   positionName: string
//   candidates: Candidate[]
// }

// interface PresidentVoteData {
//   positions: Position[]
// }

// export default function PresidentVotePage() {
//   const searchParams = useSearchParams()
//   const token = searchParams.get("token")

//   const [data, setData] = useState<PresidentVoteData | null>(null)

//   /* selection per position */
//   const [selected, setSelected] = useState<Record<number, string>>({})

//   const [loading, setLoading] = useState(true)
//   const [submitting, setSubmitting] = useState(false)
//   const [message, setMessage] = useState<string | null>(null)

//   /* ================= FETCH DATA ================= */
//   useEffect(() => {
//     if (!token) return

//     fetch(`/api/president/vote?token=${token}`)
//       .then(res => res.json())
//       .then(data => {
//         setData(data)
//         setLoading(false)
//       })
//       .catch(() => {
//         setMessage("Invalid or expired voting link")
//         setLoading(false)
//       })
//   }, [token])

//   /* ================= HANDLE SELECT ================= */
//   const handleSelect = (positionId: number, candidateId: string) => {
//     setSelected(prev => ({
//       ...prev,
//       [positionId]: candidateId
//     }))
//   }

//   /* ================= SUBMIT VOTES ================= */
//   const submitVote = async () => {
//     if (!token || !data) return

//     /* Ensure all positions selected */
//     const votes = data.positions.map(p => ({
//       positionId: p.positionId,
//       candidateUserId: selected[p.positionId]
//     }))

//     if (votes.some(v => !v.candidateUserId)) {
//       setMessage("Please select a candidate for each position.")
//       return
//     }

//     setSubmitting(true)

//     const res = await fetch("/api/president/vote", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         token,
//         votes
//       }),
//     })

//     const result = await res.json()

//     if (res.ok) {
//       setMessage("Your vote has been recorded successfully.")
//     } else {
//       setMessage(result.error || "Failed to submit vote")
//     }

//     setSubmitting(false)
//   }

//   /* ================= UI STATES ================= */
//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         Loading voting details…
//       </div>
//     )
//   }

//   if (message) {
//     return (
//       <div className="min-h-screen flex items-center justify-center px-4">
//         <Card className="max-w-md w-full">
//           <CardContent className="p-6 text-center">
//             {message}
//           </CardContent>
//         </Card>
//       </div>
//     )
//   }

//   if (!data) return null

//   /* ================= MAIN UI ================= */
//   return (
//     <div className="min-h-screen flex items-center justify-center px-4">
//       <Card className="max-w-xl w-full">
//         <CardHeader>
//           <CardTitle>Tie-Breaker Vote</CardTitle>
//           <p className="text-sm text-gray-600">
//             Please select one candidate for each tied position.
//           </p>
//         </CardHeader>

//         <CardContent className="space-y-6">

//           {data.positions.map(position => (
//             <div key={position.positionId} className="space-y-3">

//               <h3 className="font-semibold">
//                 {position.positionName}
//               </h3>

//               {position.candidates.map(c => (
//                 <label
//                   key={c.candidateUserId}
//                   className={`flex items-center gap-3 border rounded-md px-4 py-3 cursor-pointer ${
//                     selected[position.positionId] === c.candidateUserId
//                       ? "border-black bg-gray-50"
//                       : "border-gray-200"
//                   }`}
//                 >
//                   <input
//                     type="radio"
//                     name={`position-${position.positionId}`}
//                     checked={
//                       selected[position.positionId] === c.candidateUserId
//                     }
//                     onChange={() =>
//                       handleSelect(position.positionId, c.candidateUserId)
//                     }
//                   />
//                   {c.name}
//                 </label>
//               ))}

//             </div>
//           ))}

//           <Button
//             className="w-full"
//             disabled={
//               submitting ||
//               Object.keys(selected).length !== data.positions.length
//             }
//             onClick={submitVote}
//           >
//             {submitting ? "Submitting..." : "Submit Vote"}
//           </Button>

//         </CardContent>
//       </Card>
//     </div>
//   )

// }





"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface Candidate {
  candidateUserId: string
  name: string
}

interface Position {
  positionId: number
  positionName: string
  candidates: Candidate[]
}

interface PresidentVoteData {
  positions: Position[]
}

function PresidentVoteContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [data, setData] = useState<PresidentVoteData | null>(null)
  const [selected, setSelected] = useState<Record<number, string>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    if (!token) return

    fetch(`/api/president/vote?token=${token}`)
      .then(res => res.json())
      .then(data => {
        setData(data)
        setLoading(false)
      })
      .catch(() => {
        setMessage("Invalid or expired voting link")
        setLoading(false)
      })
  }, [token])

  /* ================= HANDLE SELECT ================= */
  const handleSelect = (positionId: number, candidateId: string) => {
    setSelected(prev => ({
      ...prev,
      [positionId]: candidateId
    }))
  }

  /* ================= SUBMIT VOTES ================= */
  const submitVote = async () => {
    if (!token || !data) return

    const votes = data.positions.map(p => ({
      positionId: p.positionId,
      candidateUserId: selected[p.positionId]
    }))

    if (votes.some(v => !v.candidateUserId)) {
      setMessage("Please select a candidate for each position.")
      return
    }

    setSubmitting(true)

    const res = await fetch("/api/president/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, votes }),
    })

    const result = await res.json()

    if (res.ok) {
      setMessage("Your vote has been recorded successfully.")
    } else {
      setMessage(result.error || "Failed to submit vote")
    }

    setSubmitting(false)
  }

  /* ================= UI STATES ================= */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading voting details…
      </div>
    )
  }

  if (message) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            {message}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!data) return null

  /* ================= MAIN UI ================= */
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="max-w-xl w-full">
        <CardHeader>
          <CardTitle>Tie-Breaker Vote</CardTitle>
          <p className="text-sm text-gray-600">
            Please select one candidate for each tied position.
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {data.positions.map(position => (
            <div key={position.positionId} className="space-y-3">
              <h3 className="font-semibold">{position.positionName}</h3>

              {position.candidates.map(c => (
                <label
                  key={c.candidateUserId}
                  className={`flex items-center gap-3 border rounded-md px-4 py-3 cursor-pointer ${
                    selected[position.positionId] === c.candidateUserId
                      ? "border-black bg-gray-50"
                      : "border-gray-200"
                  }`}
                >
                  <input
                    type="radio"
                    name={`position-${position.positionId}`}
                    checked={
                      selected[position.positionId] === c.candidateUserId
                    }
                    onChange={() =>
                      handleSelect(position.positionId, c.candidateUserId)
                    }
                  />
                  {c.name}
                </label>
              ))}
            </div>
          ))}

          <Button
            className="w-full"
            disabled={
              submitting ||
              Object.keys(selected).length !== data.positions.length
            }
            onClick={submitVote}
          >
            {submitting ? "Submitting..." : "Submit Vote"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default function PresidentVotePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading…
        </div>
      }
    >
      <PresidentVoteContent />
    </Suspense>
  )
}

