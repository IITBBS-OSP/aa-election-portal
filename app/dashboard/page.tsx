"use client"

import DashboardHeader from "@/components/dashboard/header"
import ElectionCard from "@/components/dashboard/election-card"
import axios from "axios"
import { useEffect, useState } from "react"
import { CenteredLoader } from "@/components/ui/loader"



// const ongoingElections = [
//   {
//     id: 1,
//     title: "General Secretary Election 2025",
//     status: "ongoing" as const,
//     deadline: "2025-01-15",
//     type: "General Secretary",
//     action: "Vote",
//     href: "/vote/1",
//   },
//   {
//     id: 2,
//     title: "Treasurer Election 2025",
//     status: "upcoming" as const,
//     deadline: "2025-01-22",
//     type: "Treasurer",
//     action: "View",
//     href: "/election/2",
//   },
//   {
//     id: 3,
//     title: "Cultural Secretary Election 2025",
//     status: "ongoing" as const,
//     deadline: "2025-01-18",
//     type: "Cultural Secretary",
//     action: "Vote",
//     href: "/vote/3",
//   },
// ]

// const pastElections = [
//   {
//     id: 1,
//     title: "President Election 2024",
//     winner: "Rajesh Kumar",
//     votesReceived: 342,
//     totalVoters: 450,
//     year: 2024,
//   },
//   {
//     id: 2,
//     title: "Vice President Election 2024",
//     winner: "Priya Singh",
//     votesReceived: 318,
//     totalVoters: 450,
//     year: 2024,
//   },
//   {
//     id: 3,
//     title: "General Secretary Election 2023",
//     winner: "Amit Patel",
//     votesReceived: 287,
//     totalVoters: 420,
//     year: 2023,
//   },
// ]

export interface ElectionDetails {
  id: number
  title: string
  status: "DRAFT" | "ACTIVE" | "COMPLETED" | "NOMINATION" | "VOTING"| "RESULTS_PUBLISHED"|"CAMPAIGN"
  created_at: string
  description: string
  academic_year: string
  results_published: boolean
}




export default function DashboardPage() {
  const [ongoingElections, setOngoingElections] = useState<ElectionDetails[]>([])
  const [pastElections, setPastElections] = useState<ElectionDetails[]>([])
  const [loading, setLoading] = useState(true)


  useEffect(() => {const fetchElections = async () => {
      try {
      const response = await axios.get("/api/users/elections")
      const elections = response.data as ElectionDetails[]

      console.log("Fetched elections:", elections)

      const ongoing = elections.filter(e =>
        ["NOMINATION", "VOTING", "ACTIVE","DRAFT","CAMPAIGN"].includes(e.status)
      )

      const past = elections.filter(e => e.status === "RESULTS_PUBLISHED")

      setOngoingElections(ongoing)
      setPastElections(past)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching elections:", error)
    }
  }

  fetchElections()
  }, [])


  if (loading) {
    return <CenteredLoader />
  }


  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Ongoing Elections Section */}
        <div className="mb-12">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-foreground mb-2">Ongoing & Upcoming Elections</h2>
            <p className="text-muted-foreground">Participate in the current election rounds</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {ongoingElections.map((election) => (
              <ElectionCard key={election.id} election={election} />
            ))}
          </div>
        </div>

        {/* Past Elections Section */}
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-2">Past Elections</h2>
            <p className="text-muted-foreground">View results from previous elections</p>
            
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {pastElections.map((election) => (
              <ElectionCard key={election.id} election={election} />
            ))}
          </div>

        
        </div>
      </main>
    </div>
  )
}
