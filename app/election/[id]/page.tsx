"use client"


import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import DashboardHeader from "@/components/dashboard/header"
import { useState,useEffect, use } from "react"
import axios from "axios"
import { CenteredLoader } from "@/components/ui/loader"


export interface UserElectionDetailsResponse {
  election: {
    id: number
    title: string
    description: string
    academic_year: string
    status: string
    created_at: string
  }
  phases: {
    phase: string
    start_date: string
    end_date: string
  }[]
  positions: {
    id: number
    name: string
    allow_multiple: boolean
    max_selections: number | null
  }[]
}


export default function ElectionOverviewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const [electionDetails, setElectionDetails] = useState<UserElectionDetailsResponse | null>(null)
  const { id}=use(params)
  const [loading, setLoading] = useState(true)


  useEffect(()=>{
    async function fetchElectionDetails() {
      try {
        const response = await axios.get<UserElectionDetailsResponse>(`/api/users/elections/${id}`)
        const data = response.data
        setElectionDetails(data)
        console.log("Fetched election details:", data)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching election details:", error)
      }
    }

    fetchElectionDetails()
  }, [])

  // const election = {
  //   id: params.id,
  //   title: "General Secretary Election",
  //   year: 2025,
  //   description:
  //     "Election for the position of General Secretary for the academic year 2025–2026. This election will determine the leadership for student affairs and coordination with the administration.",
  //   currentPhase: "Nomination",
  //   phases: [
  //     { name: "Nomination", startDate: "2025-01-05", endDate: "2025-01-10", status: "current" },
  //     { name: "Candidate Screening", startDate: "2025-01-11", endDate: "2025-01-13", status: "upcoming" },
  //     { name: "Campaign Period", startDate: "2025-01-14", endDate: "2025-01-14", status: "upcoming" },
  //     { name: "Voting", startDate: "2025-01-15", endDate: "2025-01-15", status: "upcoming" },
  //     { name: "Results", startDate: "2025-01-16", endDate: null, status: "upcoming" },
  //   ],
  //   positions: [
  //     {
  //       id: 1,
  //       title: "General Secretary",
  //       description: "Oversee student affairs and coordination with administration.",
  //       nominationDeadline: "2025-01-10",
  //       totalNominations: 8,
  //     },
  //     {
  //       id: 2,
  //       title: "Vice President",
  //       description: "Support the General Secretary and handle special initiatives.",
  //       nominationDeadline: "2025-01-10",
  //       totalNominations: 5,
  //     },
  //     {
  //       id: 3,
  //       title: "Treasurer",
  //       description: "Manage finances and budgeting for student activities.",
  //       nominationDeadline: "2025-01-10",
  //       totalNominations: 3,
  //     },
  //   ],
  //   nominationDeadline: "2025-01-10",
  //   votingDate: "2025-01-15",
  // }

  if (loading) {
    return <CenteredLoader />
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 py-8">
        {/* Back link — quieter */}
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="mb-6">
            ← Back to dashboard
          </Button>
        </Link>

        {/* Election summary */}
        <Card className="card-elevated mb-8">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                {/* ↓ reduced size + calmer */}
                <h1 className="text-2xl font-semibold text-foreground">
                  {electionDetails?.election.title} {electionDetails?.election.academic_year}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  {electionDetails?.election.description}
                </p>
              </div>

              {/* ↓ badge treated as metadata */}
              <Badge className="badge badge-primary mt-1 text-xs">
                {electionDetails?.election.status}
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Key dates — calmer info panels */}
        <div className="grid gap-6 md:grid-cols-2 mb-8 items-start">
          <Card className="card-elevated">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Nomination deadline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold text-foreground">
                {electionDetails?.phases.find(phase => phase.phase === "NOMINATION")?.end_date || "TBA"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Last date to submit nominations
              </p>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Voting date
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold text-foreground">
                {electionDetails?.phases.find(phase => phase.phase === "VOTING")?.start_date || "TBA"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Voting will be open on this date
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Positions — document style */}
        <Card className="card-elevated mb-8">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">
              Positions available
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {electionDetails?.positions.map((position) => (
              <div
                key={position.id}
                className="pb-4 border-b border-border last:border-0"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-foreground">
                      {position.name}
                    </h3>
                    {/* <p className="text-sm text-muted-foreground mt-1">
                      {position.description}
                    </p> */}
                  </div>

                  {/* ↓ smaller, quieter */}
                  <Badge variant="outline" className="text-xs">
                    {position.allow_multiple?`Up to ${position.max_selections} Selections`:`Single Selection`}
                    
                  </Badge>
                </div>

                {/* <p className="mt-2 text-xs text-muted-foreground">
                  Nomination deadline: {position.}
                </p> */}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Timeline — reduced visual noise */}
        <Card className="card-elevated mb-8">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">
              Election timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {electionDetails?.phases.map((phase, index) => (
              <div
                key={index}
                className="flex gap-4 pb-4 border-b border-border last:border-0"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                    phase.phase === electionDetails.election.status
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {index + 1}
                </div>

                <div className="pt-0.5">
                  <p className="text-sm font-medium text-foreground">
                    {phase.phase}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {phase.start_date} – {phase.end_date || "TBA"}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Actions — one primary, others secondary */}
        <div className="flex flex-wrap gap-3 justify-end">
          <Link href={`/election/${electionDetails?.election.id}/candidates`}>
            <Button variant="outline" size="sm">
              View candidates
            </Button>
          </Link>

          {/* <Link href={`/election/${electionDetails?.election.id}/rules`}>
            <Button variant="outline" size="sm">
              Election rules
            </Button>
          </Link> */}

          <Link href={`/nomination/${electionDetails?.election.id}`}>
            <Button size="sm">
              Submit nomination
            </Button>
          </Link>
        </div>
      </main>
    </div>
  )
}
