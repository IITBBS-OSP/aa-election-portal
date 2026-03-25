// "use client"

// import { useState } from "react"
// import type { ElectionData } from "../election-tabs"

// interface CandidateDocument {
//   name: string
//   url: string
// }

// interface Nomination {
//   id: string
//   candidateName: string
//   position: string
//   nominatorName: string
//   status: "Pending" | "Approved" | "Rejected"
//   dateSubmitted: string
//   email: string
//   department: string
//   academicYear: string
//   candidateStatement: string
//   documents: CandidateDocument[]
//   candidateImage?: string // Added candidate image field
// }

// interface NominationsTabProps {
//   election: ElectionData
//   userRole: "admin" | "observer"
//   approvalState: {
//     isPending: boolean
//     pendingNominationApprovals?: Record<string, "approve" | "reject">
//     rejectionReason?: string
//   }
//   setApprovalState: (state: any) => void
// }

// export function NominationsTab({ election, userRole, approvalState, setApprovalState }: NominationsTabProps) {
//   const [nominations, setNominations] = useState<Nomination[]>([
//     {
//       id: "1",
//       candidateName: "Alex Johnson",
//       position: "President",
//       nominatorName: "Sarah Chen",
//       status: "Approved",
//       dateSubmitted: "2024-11-15",
//       email: "alex.johnson@alumni.edu",
//       department: "Business",
//       academicYear: "Class of 2020",
//       candidateStatement:
//         "Committed to advancing alumni engagement and fostering stronger connections between generations.",
//       documents: [
//         { name: "Resume.pdf", url: "#" },
//         { name: "Candidate_Statement.pdf", url: "#" },
//       ],
//       candidateImage: "/professional-headshot.png",
//     },
//     {
//       id: "2",
//       candidateName: "Jordan Smith",
//       position: "President",
//       nominatorName: "Michael Rodriguez",
//       status: "Pending",
//       dateSubmitted: "2024-11-16",
//       email: "jordan.smith@alumni.edu",
//       department: "Engineering",
//       academicYear: "Class of 2019",
//       candidateStatement: "Dedicated to creating meaningful opportunities for all alumni members.",
//       documents: [{ name: "Resume.pdf", url: "#" }],
//     },
//     {
//       id: "3",
//       candidateName: "Taylor Brown",
//       position: "Vice President",
//       nominatorName: "Emma Wilson",
//       status: "Pending",
//       dateSubmitted: "2024-11-17",
//       email: "taylor.brown@alumni.edu",
//       department: "Communications",
//       academicYear: "Class of 2021",
//       candidateStatement: "Ready to support our community and drive positive change.",
//       documents: [
//         { name: "Resume.pdf", url: "#" },
//         { name: "Portfolio.pdf", url: "#" },
//       ],
//       candidateImage: "/professional-headshot.png",
//     },
//     {
//       id: "4",
//       candidateName: "Casey Lee",
//       position: "Secretary",
//       nominatorName: "David Kim",
//       status: "Rejected",
//       dateSubmitted: "2024-11-14",
//       email: "casey.lee@alumni.edu",
//       department: "Law",
//       academicYear: "Class of 2018",
//       candidateStatement: "Bringing experience and organizational excellence.",
//       documents: [{ name: "Resume.pdf", url: "#" }],
//     },
//   ])

//   const [expandedNomination, setExpandedNomination] = useState<string | null>(null)

//   const positions = ["President", "Vice President", "Secretary", "Treasurer"]

//   const handleApprove = (id: string) => {
//     if (userRole === "admin") {
//       setApprovalState((prev: any) => ({
//         ...prev,
//         isPending: true,
//         pendingNominationApprovals: {
//           ...prev.pendingNominationApprovals,
//           [id]: "approve",
//         },
//       }))
//     }
//   }

//   const handleReject = (id: string) => {
//     if (userRole === "admin") {
//       setApprovalState((prev: any) => ({
//         ...prev,
//         isPending: true,
//         pendingNominationApprovals: {
//           ...prev.pendingNominationApprovals,
//           [id]: "reject",
//         },
//       }))
//     }
//   }

//   const handleObserverApprove = (id: string) => {
//     setNominations(nominations.map((n) => (n.id === id ? { ...n, status: "Approved" } : n)))
//     setApprovalState((prev: any) => ({
//       ...prev,
//       isPending: false,
//       pendingNominationApprovals: {
//         ...prev.pendingNominationApprovals,
//         [id]: undefined,
//       },
//     }))
//   }

//   const handleObserverReject = (id: string) => {
//     setApprovalState((prev: any) => ({
//       ...prev,
//       isPending: false,
//       pendingNominationApprovals: {
//         ...prev.pendingNominationApprovals,
//         [id]: undefined,
//       },
//       rejectionReason: `Nomination action for ${id} rejected by observer`,
//     }))
//   }

//   const statusColors = {
//     Pending: "bg-muted text-muted-foreground",
//     Approved: "bg-green-100 text-green-800",
//     Rejected: "bg-red-100 text-red-800",
//   }

//   const isNominationPhase = election.phase === "Nominations"

//   return (
//     <div className="space-y-6">
//       {approvalState.rejectionReason && (
//         <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
//           <p className="text-sm text-destructive">{approvalState.rejectionReason}</p>
//         </div>
//       )}

//       {positions.map((position) => {
//         const positionNominations = nominations.filter((n) => n.position === position)

//         return (
//           <div key={position}>
//             <h3 className="mb-4 text-lg font-semibold text-foreground">{position}</h3>

//             <div className="space-y-3">
//               {positionNominations.length === 0 ? (
//                 <div className="rounded-lg border border-border bg-card p-4">
//                   <p className="text-sm text-muted-foreground">No nominations for this position.</p>
//                 </div>
//               ) : (
//                 positionNominations.map((nomination) => {
//                   const isPending = approvalState.pendingNominationApprovals?.[nomination.id]

//                   return (
//                     <div key={nomination.id}>
//                       {isPending && userRole === "observer" && (
//                         <div className="mb-3 rounded-lg border border-border bg-card p-4">
//                           <div className="flex items-center justify-between gap-4">
//                             <div>
//                               <p className="text-sm font-medium text-foreground">
//                                 Admin requested to <strong>{isPending}</strong> {nomination.candidateName}
//                               </p>
//                               <p className="text-xs text-muted-foreground">Position: {nomination.position}</p>
//                             </div>
//                             <div className="flex gap-2">
//                               <button
//                                 onClick={() => handleObserverApprove(nomination.id)}
//                                 className="rounded-md bg-primary px-3 py-1 text-sm font-medium text-primary-foreground hover:opacity-90"
//                               >
//                                 Approve
//                               </button>
//                               <button
//                                 onClick={() => handleObserverReject(nomination.id)}
//                                 className="rounded-md border border-destructive px-3 py-1 text-sm font-medium text-destructive hover:bg-destructive/10"
//                               >
//                                 Reject
//                               </button>
//                             </div>
//                           </div>
//                         </div>
//                       )}

//                       {isPending && userRole === "admin" && (
//                         <div className="mb-3 rounded-lg border border-border bg-secondary/30 p-4">
//                           <p className="text-sm text-muted-foreground">
//                             Nomination action initiated – pending observer approval
//                           </p>
//                         </div>
//                       )}

//                       <div className="rounded-lg border border-border bg-card p-4">
//                         <div className="flex items-start justify-between gap-4">
//                           <div
//                             className="flex-1 cursor-pointer"
//                             onClick={() =>
//                               setExpandedNomination(expandedNomination === nomination.id ? null : nomination.id)
//                             }
//                           >
//                             <div className="flex items-center gap-3">
//                               <h4 className="font-semibold text-foreground">{nomination.candidateName}</h4>
//                               <span
//                                 className={`rounded-full px-2 py-1 text-xs font-medium ${statusColors[nomination.status]}`}
//                               >
//                                 {nomination.status}
//                               </span>
//                             </div>
//                             <p className="mt-1 text-sm text-muted-foreground">
//                               Nominated by: {nomination.nominatorName}
//                             </p>
//                             <p className="text-xs text-muted-foreground">Submitted: {nomination.dateSubmitted}</p>
//                           </div>

//                           {isNominationPhase && nomination.status === "Pending" && !isPending && (
//                             <div className="flex gap-2">
//                               <button
//                                 onClick={() => handleApprove(nomination.id)}
//                                 disabled={userRole === "observer"}
//                                 className="rounded-md bg-primary px-3 py-1 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
//                               >
//                                 Approve
//                               </button>
//                               <button
//                                 onClick={() => handleReject(nomination.id)}
//                                 disabled={userRole === "observer"}
//                                 className="rounded-md border border-destructive px-3 py-1 text-sm font-medium text-destructive hover:bg-destructive/10 disabled:opacity-50 disabled:cursor-not-allowed"
//                               >
//                                 Reject
//                               </button>
//                             </div>
//                           )}

//                           {!isNominationPhase && (
//                             <p className="text-xs text-muted-foreground">Actions disabled - not in nomination phase</p>
//                           )}

//                           {userRole === "observer" &&
//                             isNominationPhase &&
//                             nomination.status === "Pending" &&
//                             !isPending && <p className="text-xs text-muted-foreground">Waiting for admin action...</p>}
//                         </div>

//                         {expandedNomination === nomination.id && (
//                           <div className="mt-4 border-t border-border pt-4 space-y-4">
//                             <div className="flex gap-6 mb-4">
//                               <div className="flex flex-col items-center">
//                                 <p className="text-xs font-medium text-muted-foreground uppercase mb-2">
//                                   Candidate Photo
//                                 </p>
//                                 <div className="w-24 h-24 rounded-lg border border-border bg-secondary flex items-center justify-center overflow-hidden">
//                                   {nomination.candidateImage ? (
//                                     <img
//                                       src={nomination.candidateImage || "/placeholder.svg"}
//                                       alt={nomination.candidateName}
//                                       className="w-full h-full object-cover"
//                                     />
//                                   ) : (
//                                     <div className="text-center">
//                                       <p className="text-2xl">👤</p>
//                                       <p className="text-xs text-muted-foreground mt-1">No photo uploaded</p>
//                                     </div>
//                                   )}
//                                 </div>
//                               </div>

//                               <div className="flex-1 grid grid-cols-2 gap-4">
//                                 <div>
//                                   <p className="text-xs font-medium text-muted-foreground uppercase">Email</p>
//                                   <p className="text-sm text-foreground">{nomination.email}</p>
//                                 </div>
//                                 <div>
//                                   <p className="text-xs font-medium text-muted-foreground uppercase">Department</p>
//                                   <p className="text-sm text-foreground">{nomination.department}</p>
//                                 </div>
//                                 <div>
//                                   <p className="text-xs font-medium text-muted-foreground uppercase">Academic Year</p>
//                                   <p className="text-sm text-foreground">{nomination.academicYear}</p>
//                                 </div>
//                               </div>
//                             </div>

//                             <div>
//                               <p className="text-xs font-medium text-muted-foreground uppercase mb-2">
//                                 Candidate Statement
//                               </p>
//                               <p className="text-sm text-foreground leading-relaxed">{nomination.candidateStatement}</p>
//                             </div>

//                             <div>
//                               <p className="text-xs font-medium text-muted-foreground uppercase mb-2">
//                                 Submitted Documents
//                               </p>
//                               <div className="space-y-2">
//                                 {nomination.documents.map((doc, idx) => (
//                                   <a
//                                     key={idx}
//                                     href={doc.url}
//                                     className="flex items-center gap-2 rounded-md border border-border bg-secondary p-2 text-sm text-primary hover:bg-secondary/80 transition-colors"
//                                   >
//                                     <span className="text-lg">📄</span>
//                                     <span>{doc.name}</span>
//                                   </a>
//                                 ))}
//                               </div>
//                             </div>
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   )
//                 })
//               )}
//             </div>
//           </div>
//         )
//       })}
//     </div>
//   )
// }









"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import type { AdminElectionDetailsResponse } from "@/app/admin/elections/[id]/page"
import type { PendingApproval } from "../election-tabs"
import { useRouter } from "next/navigation"

/* ================= BACKEND RESPONSE ================= */

interface BackendNomination {
  id: string
  status:
    | "PENDING_SUPPORTER_APPROVAL"
    | "PENDING_ADMIN_REVIEW"
    | "APPROVED"
    | "REJECTED"
  created_at: string
  department: string
  graduation_year: number
  candidate_image_url: string
  sop_file_url: string

  candidate: {
    id: string
    name: string
    email: string
  }

  position: {
    id: number
    name: string
  }
}

/* ================= UI MODEL (MATCHES OLD UI) ================= */

interface Nomination {
  id: string
  candidateName: string
  position: string
  nominatorName: string
  status: "Pending" | "Approved" | "Rejected"
  dateSubmitted: string
  email: string
  department: string
  academicYear: string
  candidateStatement: string
  documents: { name: string; url: string }[]
  candidateImage?: string
}

/* ================= PROPS ================= */

interface NominationsTabProps {
  election: AdminElectionDetailsResponse | null
  userRole: "admin" | "observer"
  pendingNominations: PendingApproval[]
  refetchPendingNominations: () => void
}

/* ================= COMPONENT ================= */

export function NominationsTab({
  election,
  userRole,
  pendingNominations,
  refetchPendingNominations,
}: NominationsTabProps) {
  const [nominations, setNominations] = useState<Nomination[]>([])
  const [expandedNomination, setExpandedNomination] =
    useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [remark, setRemark] = useState("")
  const router = useRouter()
  


  /* ================= FETCH ================= */

  const fetchNominations = async () => {
    if (!election?.election.id) return

    setLoading(true)
    try {
      const res = await axios.get(
        "/api/admin/nominations/pending",
        {
          params: { electionId: election.election.id },
        }
      )

      const backend: BackendNomination[] =
        res.data.nominations ?? []

      /* ===== MAP BACKEND → OLD UI STRUCTURE ===== */
      const mapped: Nomination[] = backend.map(n => ({
        id: n.id,
        candidateName: n.candidate.name,
        position: n.position.name,
        nominatorName: "—", // not in schema
        status:
          n.status === "APPROVED"
            ? "Approved"
            : n.status === "REJECTED"
            ? "Rejected"
            : "Pending",
        dateSubmitted: new Date(
          n.created_at
        ).toLocaleDateString(),
        email: n.candidate.email,
        department: n.department,
        academicYear: `Class of ${n.graduation_year}`,
        candidateStatement: "—", // not stored in schema
        documents: [
          {
            name: "Statement of Purpose",
            url: n.sop_file_url,
          },
        ],
        candidateImage: n.candidate_image_url,
      }))

      setNominations(mapped)
    } catch (err) {
      console.error("Fetch nominations error", err)
      setNominations([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNominations()
  }, [election?.election.id])

  /* ================= HELPERS ================= */

  const isNominationPhase =
    election?.election.status === "NOMINATION"

  const statusColors = {
    Pending: "bg-muted text-muted-foreground",
    Approved: "bg-green-100 text-green-800",
    Rejected: "bg-red-100 text-red-800",
  }

  const getPendingApproval = (nominationId: string) =>
  pendingNominations.find(
    p => p.payload?.nomination_id === nominationId
  )


  /* ================= ACTIONS ================= */

  const handleApprove = async (id: string) => {
  await axios.post(
    "/api/admin/nominations/decision",
    {
      nominationId: id,
      decision: "APPROVE",
      remarks: remark || null,
    },
    { withCredentials: true }
  )

  setRemark("")
  refetchPendingNominations()
}


  const handleReject = async (id: string) => {
  await axios.post(
    "/api/admin/nominations/decision",
    {
      nominationId: id,
      decision: "REJECT",
      remarks: remark || null,
    },
    { withCredentials: true }
  )

  setRemark("")
  refetchPendingNominations()
}


  const handleObserverApprove = async (approvalId: string) => {
    await axios.post("/api/admin/approvals/approve", {
      approvalRequestId: approvalId,
    })
    refetchPendingNominations()
    fetchNominations()
  }

  const handleObserverReject = async (approvalId: string) => {
    await axios.post("/api/admin/approvals/reject", {
      approvalRequestId: approvalId,
    })
    refetchPendingNominations()
    fetchNominations()
  }

  /* ================= UI (UNCHANGED) ================= */

  if (loading) {
    return (
      <p className="text-sm text-muted-foreground">
        Loading nominations…
      </p>
    )
  }

  

  const positions = Array.from(
    new Set(nominations.map(n => n.position))
  )

  return (
    <div className="space-y-6">

      {/* ================= VIEW APPROVED NOMINATIONS ================= */}
<div className="flex justify-end">
  <button
    onClick={() =>
      router.push(
        `/election/${election?.election.id}/candidates`
      )
    }
    className="flex items-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-primary hover:bg-muted"
  >
    View Approved Nominations →
  </button>
</div>




      {nominations.length === 0 && !loading && (
  <div className="flex min-h-50 items-center justify-center">
    <p className="text-sm text-muted-foreground">
      No pending nominations available.
    </p>
  </div>
)}

      {positions.map(position => {
        const positionNominations = nominations.filter(
          n => n.position === position
        )

        return (
          <div key={position}>
            <h3 className="mb-4 text-lg font-semibold text-foreground">
              {position}
            </h3>

            <div className="space-y-3">
              {positionNominations.map(nomination => {
                const pendingApproval =
                  getPendingApproval(nomination.id)
                

                return (
                  <div key={nomination.id}>
                    {pendingApproval &&
                      userRole === "observer" && (
                        <div className="mb-3 rounded-lg border border-border bg-card p-4">
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <p className="text-sm font-medium text-foreground">
                                Admin requested to{" "}
                                <strong>
                                  {pendingApproval.payload.decision}
                                </strong>{" "}
                                {nomination.candidateName}
                              </p>
                              {pendingApproval.payload.remarks && (
  <p className="text-xs text-muted-foreground mt-1">
    Remark: {pendingApproval.payload.remarks}
  </p>
)}

                              <p className="text-xs text-muted-foreground">
                                Position: {nomination.position}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() =>
                                  handleObserverApprove(
                                    pendingApproval.id
                                    
                                  )
                                }
                                className="rounded-md bg-primary px-3 py-1 text-sm font-medium text-primary-foreground"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() =>
                                  handleObserverReject(
                                    pendingApproval.id
                                  )
                                }
                                className="rounded-md border border-destructive px-3 py-1 text-sm font-medium text-destructive"
                              >
                                Reject
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                    <div className="rounded-lg border border-border bg-card p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div
                          className="flex-1 cursor-pointer"
                          onClick={() =>
                            setExpandedNomination(
                              expandedNomination === nomination.id
                                ? null
                                : nomination.id
                            )
                          }
                        >
                          <div className="flex items-center gap-3">
                            <h4 className="font-semibold text-foreground">
                              {nomination.candidateName}
                            </h4>
                            <span
  className={`rounded-full px-2 py-1 text-xs font-medium ${
    pendingApproval
      ? "bg-yellow-100 text-yellow-800"
      : statusColors[nomination.status]
  }`}
>
  {pendingApproval
    ? "Awaiting Observer Approval"
    : nomination.status}
</span>

                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">
                            Submitted: {nomination.dateSubmitted}
                          </p>
                        </div>

                       {isNominationPhase &&
 nomination.status === "Pending" &&
 !pendingApproval &&
 userRole === "admin" && (
  <div className="flex flex-col gap-2">
    <textarea
      placeholder="Optional remark"
      value={remark}
      onChange={e => setRemark(e.target.value)}
      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
      rows={2}
    />

    <div className="flex gap-2">
      <button
        onClick={() => handleApprove(nomination.id)}
        className="rounded-md bg-primary px-3 py-1 text-sm font-medium text-primary-foreground"
      >
        Approve
      </button>
      <button
        onClick={() => handleReject(nomination.id)}
        className="rounded-md border border-destructive px-3 py-1 text-sm font-medium text-destructive"
      >
        Reject
      </button>
    </div>
  </div>
)}

                      </div>

                     {expandedNomination === nomination.id && (
  <div className="mt-4 border-t border-border pt-4 space-y-4">
    {/* Candidate Image */}
    <img
      src={`/api/documents/${encodeURIComponent(
        nomination.candidateImage ?? ""
      )}`}
      className="w-24 h-24 rounded-lg object-cover"
      alt={nomination.candidateName}
    />

    {/* Candidate Meta */}
    <div className="grid grid-cols-2 gap-4 text-sm">
      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase">
          Email
        </p>
        <p className="text-foreground">{nomination.email}</p>
      </div>

      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase">
          Department
        </p>
        <p className="text-foreground">{nomination.department}</p>
      </div>

      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase">
          Batch
        </p>
        <p className="text-foreground">
          {nomination.academicYear}
        </p>
      </div>
    </div>

    {/* SOP */}
    <a
      href={`/api/documents/${encodeURIComponent(
        nomination.documents[0]?.url ?? ""
      )}`}
      target="_blank"
      className="inline-block text-primary underline"
    >
      View SOP
    </a>
  </div>)}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
