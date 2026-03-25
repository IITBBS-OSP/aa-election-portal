// "use client"

// import { useState } from "react"
// import axios from "axios"
// import type { AdminElectionDetailsResponse } from "@/app/admin/elections/[id]/page"
// // import type { ElectionData } from "../election-tabs"

// interface ControlTabProps {
//   election: AdminElectionDetailsResponse["election"]
//   userRole: "admin" | "observer"
//   approvalState: {
//     isPending: boolean
//     pendingPhaseChange?: string
//     rejectionReason?: string
//   }
//   setApprovalState: (state: any) => void
// }

// const phaseSequence = ["DRAFT", "NOMINATION", "VOTING", "CLOSED"] as const

// export function ControlTab({ election, userRole, approvalState, setApprovalState }: ControlTabProps) {
//   const [selectedPhase, setSelectedPhase] = useState(election.status)
//   const currentPhaseIndex = phaseSequence.indexOf(
//     phaseSequence.includes(election.status as typeof phaseSequence[number])
//       ? (election.status as typeof phaseSequence[number])
//       : "DRAFT"
//   )

//   const handleUpdatePhase = async () => {
//     if (userRole !== "admin") return
//     if (selectedPhase === election.status) return

//     try {
//       console.log(election.id, selectedPhase)
//       await axios.post("/api/admin/elections/change-phase", {
//         electionId: election.id,
//         newPhase: selectedPhase,
//       })

//       // Backend accepted → pending observer approval
//       setApprovalState((prev: any) => ({
//         ...prev,
//         isPending: true,
//         pendingPhaseChange: selectedPhase,
//       }))
//     } catch (err: any) {
//       console.error("Phase update failed:", err)

//       const message =
//         err?.response?.data?.error ||
//         err.message ||
//         "Failed to request phase change"

//       alert(message) // replace with toast if needed
//     }
//   }

//   const handleApprovePhase = async () => {
//   if (userRole !== "observer") return

//   try {
//     await axios.post("/api/admin/approvals/approve", {
//       electionId: election.id,
//     })

//     setApprovalState((prev: any) => ({
//       ...prev,
//       isPending: false,
//       pendingPhaseChange: undefined,
//     }))
//   } catch (err: any) {
//     console.error("Phase approval failed:", err)

//     alert(
//       err?.response?.data?.error ||
//         err.message ||
//         "Failed to approve phase change"
//     )
//   }
// }


//   const handleRejectPhase = async () => {
//   if (userRole !== "observer") return

//   try {
//     await axios.post("/api/admin/approvals/reject", {
//       electionId: election.id,
//     })

//     setApprovalState((prev: any) => ({
//       ...prev,
//       isPending: false,
//       pendingPhaseChange: undefined,
//     }))

//     setSelectedPhase(election.status)
//   } catch (err: any) {
//     console.error("Phase rejection failed:", err)

//     alert(
//       err?.response?.data?.error ||
//         err.message ||
//         "Failed to reject phase change"
//     )
//   }
// }


//   if (approvalState.pendingPhaseChange && approvalState.isPending) {
//     return (
//       <div className="grid gap-6">
//         <div className="rounded-lg border border-border bg-card p-6">
//           <h3 className="mb-4 text-lg font-semibold text-foreground">Phase Change Pending Observer Approval</h3>
//           <p className="mb-4 text-sm text-muted-foreground">
//             Requested phase change: <strong>{approvalState.pendingPhaseChange}</strong>
//           </p>
//           {userRole === "observer" && (
//             <div className="flex gap-3">
//               <button
//                 onClick={handleApprovePhase}
//                 className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
//               >
//                 Approve Phase Change
//               </button>
//               <button
//                 onClick={handleRejectPhase}
//                 className="rounded-md border border-destructive px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10"
//               >
//                 Reject Phase Change
//               </button>
//             </div>
//           )}
//           {userRole === "admin" && <p className="text-xs text-muted-foreground">Waiting for observer approval...</p>}
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="grid gap-6">
//       {/* Phase Timeline */}
//       <div className="rounded-lg border border-border bg-card p-6">
//         <h3 className="mb-6 text-lg font-semibold text-foreground">Election Phases</h3>

//         <div className="space-y-4">
//           {phaseSequence.map((phase, index) => {
//             const isActive = phase === election.status
//             const isCompleted = index < currentPhaseIndex
//             const isFuture = index > currentPhaseIndex

//             return (
//               <div key={phase} className="flex items-center gap-4">
//                 <div
//                   className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold ${
//                     isActive
//                       ? "bg-primary text-primary-foreground"
//                       : isCompleted
//                         ? "bg-secondary text-secondary-foreground"
//                         : "bg-muted text-muted-foreground"
//                   }`}
//                 >
//                   {index + 1}
//                 </div>
//                 <div className="flex-1">
//                   <p className={`font-medium ${isActive ? "text-primary" : "text-foreground"}`}>{phase}</p>
//                   {isActive && <p className="text-xs text-muted-foreground">Current phase</p>}
//                   {isCompleted && <p className="text-xs text-muted-foreground">Completed</p>}
//                 </div>
//                 {isFuture && <p className="text-xs text-muted-foreground">Upcoming</p>}
//               </div>
//             )
//           })}
//         </div>
//       </div>

//       {/* Phase Controls */}
//       <div className="rounded-lg border border-border bg-card p-6">
//         <h3 className="mb-4 text-lg font-semibold text-foreground">Phase Control</h3>

//         <div className="space-y-4">
//           <div>
//             <label className="text-sm font-medium text-foreground">Change Election Phase</label>
//             <select
//               value={selectedPhase}
//               onChange={(e) => setSelectedPhase(e.target.value as typeof selectedPhase)}
//               disabled={userRole === "observer"}
//               className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               {phaseSequence.map((phase) => (
//                 <option key={phase} value={phase}>
//                   {phase}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div className="flex gap-3 pt-4">
//             <button
//               onClick={handleUpdatePhase}
//               disabled={userRole === "observer"}
//               className="flex-1 rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               Update Phase
//             </button>
//           </div>

//           {userRole === "observer" && (
//             <p className="text-xs text-muted-foreground">Observers cannot initiate phase changes.</p>
//           )}

//           {selectedPhase !== election.status && (
//             <div className="rounded-md border border-border bg-secondary/30 p-3">
//               <p className="text-sm text-muted-foreground">
//                 Warning: Changing the phase will affect candidate nominations and voter eligibility.
//               </p>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Close Election */}
//       <div className="rounded-lg border border-border bg-card p-6">
//         <h3 className="mb-4 text-lg font-semibold text-foreground">Close Election</h3>
//         <p className="mb-4 text-sm text-muted-foreground">
//           This action will close the election and prevent further voting. This cannot be undone.
//         </p>

//         <button
//           disabled={userRole === "observer"}
//           className="rounded-md border-2 border-destructive px-4 py-2 font-medium text-destructive hover:bg-destructive/10 disabled:opacity-50 disabled:cursor-not-allowed"
//         >
//           Close Election
//         </button>
//       </div>
//     </div>
//   )
// }





"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import type { AdminElectionDetailsResponse } from "@/app/admin/elections/[id]/page"
import type { PendingApproval } from "../election-tabs"

interface ControlTabProps {
  election: AdminElectionDetailsResponse["election"]
  userRole: "admin" | "observer"
  pendingApproval: PendingApproval | null
  refetchPendingApproval: () => void
}

const phaseSequence = ["DRAFT", "NOMINATION","CAMPAIGN", "VOTING","CLOSED"] as const

export function ControlTab({
  election,
  userRole,
  pendingApproval,
  refetchPendingApproval,
}: ControlTabProps) {
  const [selectedPhase, setSelectedPhase] = useState(election.status)

  useEffect(() => {
    setSelectedPhase(election.status)
  }, [election.status])

  const currentPhaseIndex = phaseSequence.indexOf(
    phaseSequence.includes(election.status as any)
      ? (election.status as any)
      : "DRAFT"
  )

  const HandleElectionDeletion = async () => {
    if (userRole !== "admin") return
    if (!confirm("Are you sure you want to close this election? This action cannot be undone.")) return

    try {
      await axios.delete("/api/admin/elections/delete", {
        data: { electionId: election.id },
      })

      alert("Election closed successfully.")
      window.location.href = "/admin"
    } catch (err: any) {
      console.error("Election deletion failed:", err)
      alert(
        err?.response?.data?.error ||
          err.message ||
          "Failed to close election"
      )
    }
  }

  const isPhaseApprovalPending =
    pendingApproval?.action_type === "CHANGE_PHASE"

  const requestedPhase = isPhaseApprovalPending
    ? pendingApproval.payload?.newPhase
    : null

  /* =========================
     ADMIN → REQUEST PHASE CHANGE
     ========================= */
  const handleUpdatePhase = async () => {
    if (userRole !== "admin") return
    if (selectedPhase === election.status) return
    if (pendingApproval) return // lock if anything pending

    try {
      await axios.post("/api/admin/elections/change-phase", {
        electionId: election.id,
        newPhase: selectedPhase,
      })

      refetchPendingApproval()
    } catch (err: any) {
      console.error("Phase update failed:", err)
      alert(
        err?.response?.data?.error ||
          err.message ||
          "Failed to request phase change"
      )
    }
  }

  /* =========================
     OBSERVER → APPROVE
     ========================= */
  const handleApprovePhase = async () => {
    if (userRole !== "observer") return
    if (!isPhaseApprovalPending) return

    try {
      await axios.post("/api/admin/approvals/approve", {
        approvalRequestId: pendingApproval.id,
      })

      refetchPendingApproval()
    } catch (err: any) {
      console.error("Phase approval failed:", err)
      alert(
        err?.response?.data?.error ||
          err.message ||
          "Failed to approve phase change"
      )
    }
  }

  /* =========================
     OBSERVER → REJECT
     ========================= */
  const handleRejectPhase = async () => {
    if (userRole !== "observer") return
    if (!isPhaseApprovalPending) return

    try {
      await axios.post("/api/admin/approvals/reject", {
         approvalRequestId: pendingApproval.id,
      })

      refetchPendingApproval()
      setSelectedPhase(election.status)
    } catch (err: any) {
      console.error("Phase rejection failed:", err)
      alert(
        err?.response?.data?.error ||
          err.message ||
          "Failed to reject phase change"
      )
    }
  }

  /* =========================
     PENDING APPROVAL VIEW
     ========================= */
  if (isPhaseApprovalPending) {
    return (
      <div className="grid gap-6">
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="mb-4 text-lg font-semibold text-foreground">
            Phase Change Pending Observer Approval
          </h3>

          <p className="mb-4 text-sm text-muted-foreground">
            Requested phase change:{" "}
            <strong>{requestedPhase}</strong>
          </p>

          {userRole === "observer" && (
            <div className="flex gap-3">
              <button
                onClick={handleApprovePhase}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
              >
                Approve Phase Change
              </button>
              <button
                onClick={handleRejectPhase}
                className="rounded-md border border-destructive px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10"
              >
                Reject Phase Change
              </button>
            </div>
          )}

          {userRole === "admin" && (
            <p className="text-xs text-muted-foreground">
              Waiting for observer approval...
            </p>
          )}
        </div>
      </div>
    )
  }

  /* =========================
     NORMAL VIEW (NO PENDING)
     ========================= */
  return (
    <div className="grid gap-6">
      {/* Phase Timeline */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="mb-6 text-lg font-semibold text-foreground">
          Election Phases
        </h3>

        <div className="space-y-4">
          {phaseSequence.map((phase, index) => {
            const isActive = phase === election.status
            const isCompleted = index < currentPhaseIndex
            const isFuture = index > currentPhaseIndex

            return (
              <div key={phase} className="flex items-center gap-4">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : isCompleted
                      ? "bg-secondary text-secondary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p
                    className={`font-medium ${
                      isActive ? "text-primary" : "text-foreground"
                    }`}
                  >
                    {phase}
                  </p>
                  {isActive && (
                    <p className="text-xs text-muted-foreground">
                      Current phase
                    </p>
                  )}
                  {isCompleted && (
                    <p className="text-xs text-muted-foreground">
                      Completed
                    </p>
                  )}
                </div>
                {isFuture && (
                  <p className="text-xs text-muted-foreground">
                    Upcoming
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Phase Controls */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="mb-4 text-lg font-semibold text-foreground">
          Phase Control
        </h3>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground">
              Change Election Phase
            </label>
            <select
              value={selectedPhase}
              onChange={(e) =>
                setSelectedPhase(
                  e.target.value as typeof selectedPhase
                )
              }
              disabled={userRole === "observer" || !!pendingApproval}
              className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {phaseSequence.map((phase) => (
                <option key={phase} value={phase}>
                  {phase}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleUpdatePhase}
              disabled={
                userRole === "observer" || !!pendingApproval
              }
              className="flex-1 rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Update Phase
            </button>
          </div>

          {userRole === "observer" && (
            <p className="text-xs text-muted-foreground">
              Observers cannot initiate phase changes.
            </p>
          )}

          {selectedPhase !== election.status && (
            <div className="rounded-md border border-border bg-secondary/30 p-3">
              <p className="text-sm text-muted-foreground">
                Warning: Changing the phase will affect candidate
                nominations and voter eligibility.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Close Election */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="mb-4 text-lg font-semibold text-foreground">
          Close Election
        </h3>
        <p className="mb-4 text-sm text-muted-foreground">
          This action will close the election and prevent further
          voting. This cannot be undone.
        </p>

        <button
        onClick={HandleElectionDeletion}
          disabled={userRole === "observer"}
          className="rounded-md border-2 border-destructive px-4 py-2 font-medium text-destructive hover:bg-destructive/10 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Close Election
        </button>
      </div>
    </div>
  )
}







