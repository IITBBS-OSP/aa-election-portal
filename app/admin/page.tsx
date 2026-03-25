"use client"

import { ElectionCard } from "@/components/admin/election-card"
import Link from "next/link"
import { useState,useEffect } from "react"
import axios from "axios";
import { CenteredLoader } from "@/components/ui/loader";
import { supabase } from "@/lib/supabaseClient"


export interface Election {
  academic_year: string
  candidateCount: number
  created_at: string
  id: number
  positionCount: number
   status: 'DRAFT' | 'NOMINATION' | 'VOTING' | 'RESULTS_PUBLISHED'| 'CLOSED'|'CAMPAIGN'
  title: string
}






export default  function  AdminDashboard() {

const [recentElections, setRecentElections] = useState<Election[]>([]);
const [ongoingElections, setOngoingElections] = useState<Election[]>([]);
const [pastElections, setPastElections] = useState<Election[]>  ([]);
const [loading, setLoading] = useState(true);
const [role, setRole] = useState<string>('ADMIN');



useEffect(() => {
  const fetchUserRole = async () => {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return

    const { data } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single()

    setRole(data?.role)

    console.log("User role:", role)
  }

  fetchUserRole()
}, [])




useEffect(() => {

  axios.get('/api/admin/elections')
    .then(response => {
      const data = response.data;
      console.log('Fetched elections data:', data);
      setRecentElections(data.created);
      setOngoingElections(data.ongoing);
      setPastElections(data.past);
      setLoading(false);
    })
    .catch(error => {
      console.error('Error fetching elections:', error);
    });

}, []);


if(loading) {
  return <CenteredLoader />
}

const HandleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = "/"
  }







  
  // const recentElections = [
  //   {
  //     id: 1,
  //     title: "Student Government Elections",
  //     academicYear: "2025-2026",
  //     phase: "Creating" as const,
  //     positions: 8,
  //     candidates: 0,
  //   },
  // ]

  // const ongoingElections = [
  //   {
  //     id: 2,
  //     title: "Class President Elections",
  //     academicYear: "2024-2025",
  //     phase: "Voting" as const,
  //     positions: 1,
  //     candidates: 3,
  //   },
  //   {
  //     id: 3,
  //     title: "Faculty Council Elections",
  //     academicYear: "2024-2025",
  //     phase: "Nominations" as const,
  //     positions: 5,
  //     candidates: 12,
  //   },
  // ]

  // const pastElections = [
  //   {
  //     id: 4,
  //     title: "Graduation Committee Elections",
  //     academicYear: "2023-2024",
  //     phase: "Closed" as const,
  //     positions: 4,
  //     candidates: 8,
  //   },
  //   {
  //     id: 5,
  //     title: "Events Committee Elections",
  //     academicYear: "2023-2024",
  //     phase: "Closed" as const,
  //     positions: 3,
  //     candidates: 6,
  //   },
  // ]

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="md:text-3xl text-xl font-semibold md:font-bold text-foreground">{role === 'ADMIN' ? 'Admin' : 'Observer'} Dashboard</h1>
            <p className="mt-2 text-muted-foreground">Manage elections and voting processes</p>
          </div>
          <div className="flex gap-2">
          {role=== 'ADMIN' && (
            <Link
              href="/admin/elections/create"
              className=" flex justify-center items-center rounded-md bg-primary p-2 md:px-6 md:py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
            >
              + Create Election
            </Link>
          )}
          <div className="  flex justify-center rounded-md items-center p-2 bg-primary md:px-6 md:py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity">
            <button onClick={HandleLogout}>Logout</button>
          </div>

           <Link
              href="/admin/elections"
              className=" flex justify-center items-center rounded-md bg-primary p-2 md:px-6 md:py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
            >
               Elections
            </Link>
          


          </div>
          
        </div>

        {/* Recently Created Elections */}
        <section className="mb-12">
          <h2 className="mb-4 text-xl font-semibold text-foreground">Recently Created Elections</h2>
          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
            {recentElections.map((election) => (
              <ElectionCard key={election.id} {...election} />
            ))}
          </div>
        </section>

        {/* Ongoing Elections */}
        <section className="mb-12">
          <h2 className="mb-4 text-xl font-semibold text-foreground">Ongoing Elections</h2>
          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
            {ongoingElections.map((election) => (
              <ElectionCard key={election.id} {...election} />
            ))}
          </div>
        </section>

        {/* Past Elections */}
        <section>
          <h2 className="mb-4 text-xl font-semibold text-foreground">Past Elections</h2>
          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
            {pastElections.map((election) => (
              <ElectionCard key={election.id} {...election} />
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
