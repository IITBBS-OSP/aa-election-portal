"use client"

import { ElectionTabs } from "@/components/admin/election-tabs"
import { useEffect, useState } from "react"
import axios from "axios"
import { useParams, useRouter } from "next/navigation"
import { CenteredLoader } from "@/components/ui/loader"

/* =========================
   TYPES
   ========================= */

export interface AdminElectionDetailsResponse {
  election: ElectionCore
  positions: Position[]
  phases: ElectionPhase[]
  stats: ElectionStats
}

export interface ElectionCore {
  id: number
  title: string
  description: string
  academic_year: string
  status:
    | "CREATED"
    | "DRAFT"
    | "NOMINATION"
    | "CAMPAIGN"
    | "VOTING"
    | "CLOSED"
    | "RESULTS_PUBLISHED"
  created_at: string
  president_vote_required: boolean
}

export interface Position {
  id: number
  name: string
  allow_multiple: boolean
  max_selections: number | null
}

export interface ElectionPhase {
  phase:
    | "NOMINATION"
    | "SCREENING"
    | "CAMPAIGN"
    | "VOTING"
    | "RESULTS"
  start_date: string
  end_date: string
}

export interface ElectionStats {
  totalVoters: number
  totalPositions: number
  totalCandidates: number
}

/* =========================
   COMPONENT
   ========================= */

export default function ElectionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  console.log("Election ID from params:", id)

  const [election, setElection] =
    useState<AdminElectionDetailsResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadElection = async () => {
      try {
        const res = await axios.get(`/api/admin/elections/${id}`)
        setElection(res.data)
      } catch (error: any) {
        if (error.response?.status === 401) {
          router.push("/admin/login")
        } else if (error.response?.status === 403) {
          router.push("/unauthorized")
        } else {
          console.error("Error fetching election details:", error)
        }
      } finally {
        setLoading(false)
      }
    }

    loadElection()
  }, [id, router])

  if (loading) {
    return <CenteredLoader />
  }

  if (!election) {
    return <div className="p-6 text-sm text-muted-foreground">No data found</div>
  }

  return <ElectionTabs election={election} />
}
