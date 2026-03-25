// "use client"

// import { useEffect, useState } from "react"
// import axios from "axios"
// import { OverviewTab } from "./tabs/overview-tab"
// import { ControlTab } from "./tabs/control-tab"
// import { NominationsTab } from "./tabs/nominations-tab"
// import { ResultsTab } from "./tabs/results-tab"
// import { AdminElectionDetailsResponse } from "@/app/admin/elections/[id]/page"
// import { supabase } from "@/lib/supabaseClient"

// const tabs = ["Overview", "Control", "Nominations", "Results"] as const

// interface ElectionTabsProps {
//   election: AdminElectionDetailsResponse | null
// }

// interface ApprovalState {
//   isPending: boolean
//   rejectionReason?: string
//   pendingPhaseChange?: string
//   pendingApprovalRequestId?: number
//   pendingNominationApprovals?: Record<string, "approve" | "reject">
//   pendingResultPublication?: boolean
//   pendingPresidentVote?: boolean
//   presidentVoteCompleted?: boolean
// }

// export function ElectionTabs({ election }: ElectionTabsProps) {
//   const [activeTab, setActiveTab] =
//     useState<(typeof tabs)[number]>("Overview")

//   const [approvalState, setApprovalState] = useState<ApprovalState>({
//     isPending: false,
//   })

//   const [userRole, setUserRole] =
//     useState<"admin" | "observer" | null>(null)

//   /* =========================
//      FETCH USER ROLE
//      ========================= */
//   useEffect(() => {
//     const loadUserRole = async () => {
//       const {
//         data: { user },
//       } = await supabase.auth.getUser()

//       if (!user) return

//       const { data: profile } = await supabase
//         .from("users")
//         .select("role")
//         .eq("id", user.id)
//         .single()

//       if (profile?.role) {
//         setUserRole(profile.role.toLowerCase())
//       }
//     }

//     loadUserRole()
//   }, [])

//   /* =========================
//      FETCH PENDING APPROVAL
//      ========================= */
//   useEffect(() => {
//   if (!election?.election?.id) return
//   if (!userRole) return

//   const loadPendingApproval = async () => {
//     try {
//       const res = await axios.get(
//         "/api/admin/approvals/pending",
//         {
//           params: {
//             electionId: election.election.id,
//           },
//         }
//       )

//       const approval = res.data.approval
//       if (!approval) return

//       switch (approval.action_type) {
//         case "CHANGE_PHASE": {
//           setApprovalState({
//             isPending: true,
//             pendingPhaseChange: approval.payload.newPhase,
//             pendingApprovalRequestId: approval.id,
//           })
//           break
//         }

//         case "EDIT_ELECTION": {
//           setApprovalState({
//             isPending: true,
//             pendingApprovalRequestId: approval.id,
//           })
//           break
//         }

//         case "NOMINATION_DECISION": {
//           setApprovalState({
//             isPending: true,
//             pendingNominationApprovals: {
//               [approval.entity_id]: approval.payload.decision,
//             },
//             pendingApprovalRequestId: approval.id,
//           })
//           break
//         }

//         case "PUBLISH_RESULTS": {
//           setApprovalState({
//             isPending: true,
//             pendingResultPublication: true,
//             pendingApprovalRequestId: approval.id,
//           })
//           break
//         }

//         case "INITIATE_PRESIDENT_VOTE": {
//           setApprovalState({
//             isPending: true,
//             pendingPresidentVote: true,
//             pendingApprovalRequestId: approval.id,
//           })
//           break
//         }

//         default:
//           console.warn(
//             "Unhandled approval type:",
//             approval.action_type
//           )
//       }
//     } catch (err) {
//       console.error("Failed to load approval request", err)
//     }
//   }

//   loadPendingApproval()
// }, [election?.election?.id, userRole,activeTab])


//   if (!userRole) return null

//   return (
//     <div className="min-h-screen bg-background p-8">
//       <div className="mx-auto max-w-6xl">
//         {/* Header */}
//         <div className="mb-8">
//           <h1 className="text-3xl font-bold text-foreground">
//             {election?.election.title}
//           </h1>
//           <p className="mt-2 text-muted-foreground">
//             {election?.election.academic_year}
//           </p>
//         </div>

//         {/* Tabs */}
//         <div className="mb-8 border-b border-border">
//           <div className="flex gap-8">
//             {tabs.map((tab) => (
//               <button
//                 key={tab}
//                 onClick={() => setActiveTab(tab)}
//                 className={`pb-4 text-sm font-medium transition-colors ${
//                   activeTab === tab
//                     ? "border-b-2 border-primary text-primary"
//                     : "text-muted-foreground hover:text-foreground"
//                 }`}
//               >
//                 {tab}
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* Content */}
//         {activeTab === "Overview" && (
//           <OverviewTab
//             election={election}
//             userRole={userRole}
//             approvalState={approvalState}
//             setApprovalState={setApprovalState}
//           />
//         )}

//         {activeTab === "Control" && election?.election && (
//           <ControlTab
//             election={election.election}
//             userRole={userRole}
//             approvalState={approvalState}
//             setApprovalState={setApprovalState}
//           />
//         )}

//         {activeTab === "Nominations" && (
//           <NominationsTab
//             election={election}
//             userRole={userRole}
//             approvalState={approvalState}
//             setApprovalState={setApprovalState}
//           />
//         )}

//         {activeTab === "Results" && (
//           <ResultsTab
//             election={election}
//             userRole={userRole}
//             approvalState={approvalState}
//             setApprovalState={setApprovalState}
//           />
//         )}
//       </div>
//     </div>
//   )
// }








"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { OverviewTab } from "./tabs/overview-tab"
import { ControlTab } from "./tabs/control-tab"
import { NominationsTab } from "./tabs/nominations-tab"
import { ResultsTab } from "./tabs/results-tab"
import { AdminElectionDetailsResponse } from "@/app/admin/elections/[id]/page"
import { supabase } from "@/lib/supabaseClient"
import CampaignTab from "./tabs/screening"

const tabs = ["Overview", "Control", "Nominations", "Results","Screening"] as const

interface ElectionTabsProps {
  election: AdminElectionDetailsResponse | null
}

export interface PendingApproval {
  id: string
  action_type: string
  payload: any
}


function TabBlockedMessage({ message }: { message: string }) {
  return (
    <div className="flex min-h-75 items-center justify-center">
      <p className="text-muted-foreground text-center text-sm">
        {message}
      </p>
    </div>
  )
}







export function ElectionTabs({ election }: ElectionTabsProps) {
  const [activeTab, setActiveTab] =
    useState<(typeof tabs)[number]>("Overview")

  const [userRole, setUserRole] =
    useState<"admin" | "observer" | null>(null)

  /* =========================
     APPROVAL STATE
     ========================= */
  const [pendingApproval, setPendingApproval] =
    useState<PendingApproval | null>(null)

  const [pendingNominations, setPendingNominations] =
    useState<PendingApproval[]>([])
    const electionStatus = election?.election?.status

  /* =========================
     FETCH USER ROLE
     ========================= */
  useEffect(() => {
    const loadUserRole = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { data: profile } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single()

      if (profile?.role) {
        setUserRole(profile.role.toLowerCase())
      }
    }

    loadUserRole()
  }, [])

  /* =========================
     FETCH GLOBAL PENDING APPROVAL
     ========================= */
  const fetchPendingApproval = async () => {
    if (!election?.election?.id) return

    try {
      const res = await axios.get(
        "/api/admin/approvals/pending",
        {
          params: {
            electionId: election.election.id,
          },
        }
      )

      setPendingApproval(res.data.approval ?? null)
    } catch (err) {
      console.error("Failed to fetch pending approval", err)
      setPendingApproval(null)
    }
  }

  /* =========================
     FETCH PENDING NOMINATIONS
     ========================= */
  const fetchPendingNominations = async () => {
    if (!election?.election?.id) return

    try {
      const res = await axios.get(
        "/api/admin/approvals/pending-nominations",
        {
          params: {
            electionId: election.election.id,
          },
        }
      )

      setPendingNominations(res.data.approvals ?? [])
    } catch (err) {
      console.error("Failed to fetch nomination approvals", err)
      setPendingNominations([])
    }
  }

  /* =========================
     INITIAL LOAD
     ========================= */
  useEffect(() => {
    if (!userRole) return
    if (!election?.election?.id) return

    fetchPendingApproval()
    fetchPendingNominations()
  }, [userRole, election?.election?.id])

  if (!userRole) return null

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            {election?.election.title}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {election?.election.academic_year}
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-8 border-b border-border">
          <div className="flex gap-8">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? "border-b-2 border-primary text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {activeTab === "Overview" && (
          <OverviewTab
            election={election}
            userRole={userRole}
            pendingApproval={pendingApproval}
            refetchPendingApproval={fetchPendingApproval}
          />
        )}

        {activeTab === "Control" && election?.election && (
          <ControlTab
            election={election.election}
            userRole={userRole}
            pendingApproval={pendingApproval}
            refetchPendingApproval={fetchPendingApproval}
          />
        )}

       {activeTab === "Screening" && (
  electionStatus === "CAMPAIGN" ? (
    <CampaignTab election={election?.election} />
  ) : (
    <TabBlockedMessage message="Screening tab will be available once the election enters the campaign phase." />
  )
)}

       {activeTab === "Nominations" && (
  electionStatus === "NOMINATION" ? (
    <NominationsTab
      election={election}
      userRole={userRole}
      pendingNominations={pendingNominations}
      refetchPendingNominations={fetchPendingNominations}
    />
  ) : (
    <TabBlockedMessage message="Nominations will be available once the election enters the nomination phase." />
  )
)}


        {activeTab === "Results" && (
  electionStatus === "CLOSED" || electionStatus === "RESULTS_PUBLISHED" ? (
    <ResultsTab
      election={election}
      userRole={userRole}
      pendingApproval={pendingApproval}
      refetchPendingApproval={fetchPendingApproval}
    />
  ) : (
    <TabBlockedMessage message="Results will be available after the election is closed." />
  )
)}

      </div>
    </div>
  )
}



