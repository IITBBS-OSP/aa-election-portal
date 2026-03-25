"use client"


import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import DashboardHeader from "@/components/dashboard/header"
import { useParams } from "next/navigation"
import { useEffect,useState } from "react"
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

export default function ViewCandidatesPage({ params }: { params: { id: string } }) {
  const param= useParams()
  const electionId = param.id
  const[electionDetails,setElectionDetails]=useState<ElectionCandidatesResponse[] |null>(null)
  const[loading,setLoading]=useState(true)

  useEffect(()=>{
    async function fetchCandidates() {
      try {
        const response = await fetch(`/api/users/elections/${electionId}/candidates`)
        const data = await response.json()
        setElectionDetails(data)
        console.log("CANDIDATES DATA:", data)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching candidates:", error)
      }
    }
    fetchCandidates()
  },[electionId])

  // Mock data - in production, fetch based on election ID

  // const election = {
  //   id: params.id,
  //   title: "General Secretary Election",
  //   year: 2025,
  // }

  // const positions = [
  //   {
  //     id: 1,
  //     title: "General Secretary",
  //     description: "Oversee student affairs and coordination with administration.",
  //     candidates: [
  //       {
  //         id: 1,
  //         name: "Arjun Kumar Singh",
  //         department: "Computer Science",
  //         graduationYear: 2025,
  //         image: "/male-student-alumni-candidate.jpg",
  //         statement:
  //           "I am committed to strengthening student-administration relations and implementing sustainable initiatives for campus development.",
  //         sopFile: "arjun_sop.pdf",
  //       },
  //       {
  //         id: 2,
  //         name: "Priya Sharma",
  //         department: "Electronics Engineering",
  //         graduationYear: 2024,
  //         image: "/female-student-alumni-candidate.jpg",
  //         statement:
  //           "My vision is to create a more inclusive environment and enhance student welfare programs across all departments.",
  //         sopFile: "priya_sop.pdf",
  //       },
  //       {
  //         id: 3,
  //         name: "Rahul Verma",
  //         department: "Mechanical Engineering",
  //         graduationYear: 2025,
  //         image: "/male-student-alumni-professional.jpg",
  //         statement:
  //           "I believe in collaborative governance and will work towards better resources and opportunities for all students.",
  //         sopFile: "rahul_sop.pdf",
  //       },
  //     ],
  //   },
  //   {
  //     id: 2,
  //     title: "Vice President",
  //     description: "Support the General Secretary and handle special initiatives.",
  //     candidates: [
  //       {
  //         id: 4,
  //         name: "Anjali Patel",
  //         department: "Civil Engineering",
  //         graduationYear: 2025,
  //         image: "/female-student-alumni-leader.jpg",
  //         statement:
  //           "I am passionate about fostering inter-departmental collaboration and organizing meaningful student activities.",
  //         sopFile: "anjali_sop.pdf",
  //       },
  //     ],
  //   },
  //   {
  //     id: 3,
  //     title: "Treasurer",
  //     description: "Manage finances and budgeting for student activities.",
  //     candidates: [],
  //   },
  // ]

  if(loading){
    return <CenteredLoader />
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link href={`/election/${electionId}`}>
          <Button variant="ghost" className="mb-6">
            ← Back to Election Details
          </Button>
        </Link>

        {/* Header Section */}
        {/* <Card className="card-elevated mb-8">
          <CardHeader>
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {election.title} {election.year}
              </h1>
              <p className="text-base text-muted-foreground">Approved Candidates</p>
            </div>
          </CardHeader>
        </Card> */}

        {/* Candidates by Position */}
        <div className="space-y-8">
          {electionDetails?.map((position) => (
            <div key={position.positionId}>
              {/* Position Header */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-primary mb-1">{position.positionName}</h2>
                {/* <p className="text-sm text-muted-foreground">{position.description}</p> */}
              </div>

              {/* Candidates Grid */}
              {position.candidates.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
                  {position.candidates.map((candidate) => (
                    <Card key={candidate.nominationId} className="card-elevated flex flex-col overflow-hidden">
                      <CardContent className="p-6 flex flex-col h-full">
                        {/* Candidate Image */}
                        <div className="mb-4 -m-6 ">
                          <img
                            src={`/api/documents/${encodeURIComponent(candidate.imageUrl ?? "")}`}
                            alt={candidate.name}
                            className="w-full aspect-square object-cover"
                          />
                        </div>

                        {/* Candidate Info */}
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-foreground mb-2">{candidate.name}</h3>

                          <div className="space-y-1 mb-4 text-sm text-muted-foreground">
                            <p>
                              <span className="font-medium text-foreground">Department:</span> {candidate.department}
                            </p>
                            <p>
                              <span className="font-medium text-foreground">Graduation:</span>{" "}
                              {candidate.graduationYear}
                            </p>
                          </div>

                          {/* Statement */}
                          {/* <p className="text-sm text-foreground mb-4 line-clamp-3">{candidate.}</p> */}
                        </div>

                        {/* View SOP Link */}
                        <Link
                         href={`/api/documents/${encodeURIComponent(candidate.sopUrl ?? "")}`}
  target="_blank"
  rel="noopener noreferrer"
  
                          className="text-primary text-sm font-medium hover:text-primary/80 transition-colors"
                        >
                          View Statement of Purpose →
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="card-elevated mb-8">
                  <CardContent className="py-8 text-center">
                    <p className="text-muted-foreground">No approved candidates yet.</p>
                  </CardContent>
                </Card>
              )}

              {/* Divider between positions */}
              {position.positionId !== electionDetails[electionDetails.length - 1].positionId && <div className="border-t border-border mb-8" />}
            </div>
          ))}
        </div>

        {/* Footer Action */}
        <div className="mt-8 pt-6 border-t border-border">
          <Link href={`/election/${electionId}`}>
            <Button variant="outline" className="bg-transparent">
              Back to Election Details
            </Button>
          </Link>
        </div>
      </main>
    </div>
  )
}
