"use client"

import { useState,useEffect } from "react"
import axios from "axios"

import Link from "next/link"
import type { Election } from "../page"

// interface Election {
//   id: string
//   title: string
//   academicYear: string
//   phase: "Creating" | "Nominations" | "Voting" | "Closed"
//   positions: number
//   candidates: number
//   voters: number
// }

export default function ElectionsListPage() {
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all")


  const [recentElections, setRecentElections] = useState<Election[]>([]);
  const [ongoingElections, setOngoingElections] = useState<Election[]>([]);
  const [pastElections, setPastElections] = useState<Election[]>  ([]);
  
  
  useEffect(() => {
  
    axios.get('/api/admin/elections')
      .then(response => {
        const data = response.data;
        console.log('Fetched elections data:', data);
        setRecentElections(data.created);
        setOngoingElections(data.ongoing);
        setPastElections(data.past);
      })
      .catch(error => {
        console.error('Error fetching elections:', error);
      });
  
  }, [filter]);







        // const elections: Election[] = [
        //   {
        //     id: "1",
        //     title: "Student Government Elections",
        //     academicYear: "2025-2026",
        //     phase: "Creating",
        //     positions: 8,
        //     candidates: 0,
        //     voters: 0,
        //   },
        //   {
        //     id: "2",
        //     title: "Class President Elections",
        //     academicYear: "2024-2025",
        //     phase: "Voting",
        //     positions: 1,
        //     candidates: 3,
        //     voters: 245,
        //   },
        //   {
        //     id: "3",
        //     title: "Faculty Council Elections",
        //     academicYear: "2024-2025",
        //     phase: "Nominations",
        //     positions: 5,
        //     candidates: 12,
        //     voters: 0,
        //   },
        //   {
        //     id: "4",
        //     title: "Graduation Committee Elections",
        //     academicYear: "2023-2024",
        //     phase: "Closed",
        //     positions: 4,
        //     candidates: 8,
        //     voters: 189,
        //   },
        //   {
        //     id: "5",
        //     title: "Events Committee Elections",
        //     academicYear: "2023-2024",
        //     phase: "Closed",
        //     positions: 3,
        //     candidates: 6,
        //     voters: 156,
        //   },
        // ]
  const elections: Election[] = [...recentElections, ...ongoingElections, ...pastElections];

  console.log('All elections:', elections);

  const filteredElections = elections.filter((e) => {
    if (filter === "active") return  e.status === "NOMINATION" || e.status === "VOTING"|| e.status === "CAMPAIGN"
  if (filter === "completed") return e.status === "RESULTS_PUBLISHED"
    return true
  })

  const phaseColors = {
    DRAFT: "bg-muted text-muted-foreground",
    NOMINATION: "bg-primary text-primary-foreground",
    VOTING: "bg-primary text-primary-foreground",
    RESULTS_PUBLISHED: "bg-secondary text-secondary-foreground",
    CLOSED: "bg-destructive text-destructive-foreground",
    CAMPAIGN: "bg-warning text-warning-foreground",
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Elections</h1>
          <p className="mt-2 text-muted-foreground">View and manage all elections</p>
        </div>

        {/* Filter Buttons */}
        <div className="mb-6 flex gap-2">
          {(["all", "active", "completed"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                filter === f ? "bg-primary text-primary-foreground" : "bg-card text-foreground hover:bg-secondary"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Elections Table */}
        <div className="overflow-x-auto md:overflow-hidden rounded-lg border border-border bg-card">
          <table className="w-full min-w-max">
            <thead>
              <tr className="border-b border-border bg-secondary">
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Title</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Academic Year</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Phase</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Positions</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Candidates</th>
                {/* <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Votes</th> */}
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredElections.map((election) => (
                <tr key={election.id} className="border-b border-border hover:bg-secondary">
                  <td className="px-6 py-4 text-sm text-foreground">{election.title}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{election.academic_year}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${phaseColors[election.status]}`}>
                      {election.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground">{election.positionCount}</td>
                  <td className="px-6 py-4 text-sm text-foreground">{election.candidateCount}</td>
                  {/* <td className="px-6 py-4 text-sm text-foreground">{election.voterCount  }</td> */}
                  <td className="px-6 py-4 text-sm">
                    <Link href={`/admin/elections/${election.id}`} className="text-primary hover:underline">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredElections.length === 0 && (
          <div className="rounded-lg border border-border bg-card p-8 text-center">
            <p className="text-muted-foreground">No elections found.</p>
          </div>
        )}
      </div>
    </div>
  )
}
