// "use client"

// import type React from "react"

// import { useState } from "react"
// import type { AdminElectionDetailsResponse } from "@/app/admin/elections/[id]/page"

// // interface Position {
// //   id: string
// //   name: string
// //   enableMultiChoice: boolean
// //   maxSelections: number
// // }

// // interface PhaseDates {
// //   nomination: { startDate: string; endDate: string }
// //   screening: { startDate: string; endDate: string }
// //   campaign: { startDate: string; endDate: string }
// //   voting: { startDate: string; endDate: string }
// //   results: { startDate: string; endDate: string }
// // }

// interface ApprovalState {
//   isPending: boolean
//   rejectionReason?: string
// }

// interface OverviewTabProps {
//   election: AdminElectionDetailsResponse | null
//   userRole?: "admin" | "observer"
//   approvalState: ApprovalState
//   setApprovalState: (state: ApprovalState) => void
// }

// export function OverviewTab({ election, userRole = "admin", approvalState, setApprovalState }: OverviewTabProps) {
//   const [isEditing, setIsEditing] = useState(false)
//   const [editData, setEditData] = useState({
//     title: election?.election.title || "",
//     academicYear: election?.election.academic_year || "",
//     description: election?.election.description || "",
//   })
//   // const [positions, setPositions] = useState<Position[]>([
//   //   { id: "1", name: "President", enableMultiChoice: false, maxSelections: 1 },
//   //   { id: "2", name: "Vice President", enableMultiChoice: false, maxSelections: 1 },
//   //   { id: "3", name: "Secretary", enableMultiChoice: false, maxSelections: 1 },
//   //   { id: "4", name: "Treasurer", enableMultiChoice: false, maxSelections: 1 },
//   // ])
//   const [editPositions, setEditPositions] = useState<AdminElectionDetailsResponse["positions"]>(election?.positions || [])
//   // const [phaseDates, setPhaseDates] = useState<PhaseDates>({
//   //   nomination: { startDate: "2025-01-15", endDate: "2025-01-20" },
//   //   screening: { startDate: "2025-01-21", endDate: "2025-01-25" },
//   //   campaign: { startDate: "2025-01-26", endDate: "2025-01-28" },
//   //   voting: { startDate: "2025-01-29", endDate: "2025-01-30" },
//   //   results: { startDate: "2025-01-31", endDate: "2025-02-01" },
//   // })
//   const [editPhaseDates, setEditPhaseDates] = useState<AdminElectionDetailsResponse["phases"]>(election?.phases || [])
//   const [voterListFile, setVoterListFile] = useState<{ name: string; uploadedAt: string } | null>(null)
//   const [editVoterListFile, setEditVoterListFile] = useState<File | null>(null)
//   const [errors, setErrors] = useState<{ [key: string]: string }>({})

//   const getPhase = (phase: string) =>
//   editPhaseDates.find(p => p.phase === phase)


//   const [proposedChanges, setProposedChanges] = useState<{
//     editData: typeof editData
//     editPositions: AdminElectionDetailsResponse["positions"]
//     editPhaseDates: AdminElectionDetailsResponse["phases"]
//     editVoterListFile: File | null
//   } | null>(null)

//   const stats = [
//     { label: "Positions", value: election?.stats.totalPositions || 0 },
//     { label: "Candidates", value: election?.stats.totalCandidates || 0 },
//     { label: "Voters", value: election?.stats.totalVoters || 0 },
//   ]

//   const validateEdit = (): boolean => {
//     const newErrors: { [key: string]: string } = {}

//     if (!editData.title.trim()) {
//       newErrors.title = "Election title is required"
//     }
//     if (!editData.academicYear.trim()) {
//       newErrors.academicYear = "Academic year is required"
//     }

//     editPositions.forEach((pos) => {
//       if (!pos.name.trim()) {
//         newErrors[`position-${pos.id}`] = "Position name is required"
//       }
//       if (pos.allow_multiple && ((pos?.max_selections ?? 0) < 1)) {
//         newErrors[`maxselections-${pos.id}`] = "Maximum selections must be at least 1"
//       }
//     })

//     Object.entries(editPhaseDates).forEach(([phase, dates]) => {
//       if (!dates.start_date || !dates.end_date) {
//         newErrors[`${phase}-dates`] = "Start and end dates are required"
//       } else if (dates.start_date > dates.end_date) {
//         newErrors[`${phase}-dates`] = "Start date must be before end date"
//       }
//     })

//     setErrors(newErrors)
//     return Object.keys(newErrors).length === 0
//   }

//   const handleSave = async () => {
//     console.log("Submitting edit with data")
//   if (!validateEdit()) return

//   try {
//     setErrors({})

//     const formData = new FormData()

//     formData.append("electionId", String(election?.election.id))
//     formData.append("title", editData.title)
//     formData.append("academicYear", editData.academicYear)
//     formData.append("description", editData.description)

//     // IMPORTANT: stringify arrays
//     formData.append("positions", JSON.stringify(editPositions))
//     formData.append("phases", JSON.stringify(editPhaseDates))

//     if (editVoterListFile) {
//       formData.append("voterFile", editVoterListFile)
//     }

//     const res = await fetch("/api/admin/elections/update-details", {
//       method: "POST",
//       body: formData,
//     })

//     const data = await res.json()

//     if (!res.ok) {
//       throw new Error(data.error || "Failed to submit edit request")
//     }

//     // Backend returns: { status: "PENDING_APPROVAL" }
//     setApprovalState({ isPending: true })
//     setIsEditing(false)

//   } catch (err: any) {
//     console.error(err)
//     setErrors({ submit: err.message })
//   }
// }


//   const handleCancel = () => {
//     setEditData({
//       title: election?.election.title || "",
//       academicYear: election?.election.academic_year || "",
//       description: election?.election.description || "",
//     })
//     setEditPositions(election?.positions || [])
//     setEditPhaseDates(election?.phases || [])
//     setEditVoterListFile(null)
//     setErrors({})
//     setIsEditing(false)
//   }

//   const handleApprove = () => {
//     if (proposedChanges) {
//       setEditPositions(proposedChanges.editPositions)
//       setEditPhaseDates(proposedChanges.editPhaseDates)
//       if (proposedChanges.editVoterListFile) {
//         setVoterListFile({
//           name: proposedChanges.editVoterListFile.name,
//           uploadedAt: new Date().toLocaleDateString(),
//         })
//       }
//       setProposedChanges(null)
//       setApprovalState({ isPending: false })
//     }
//   }

//   const handleReject = () => {
//     setProposedChanges(null)
//     setApprovalState({ isPending: false, rejectionReason: "Changes rejected by observer" })
//     setIsEditing(false)
//   }

//   const handlePositionChange = (id: number, value: string) => {
//     setEditPositions((prev) => prev.map((pos) => (pos.id === id ? { ...pos, name: value } : pos)))
//   }

//   const handleMultiChoiceToggle = (id: number) => {
//    setEditPositions(prev =>
//     prev.map(pos => {
//       if (pos.id !== id) return pos

//       const enabling = !pos.allow_multiple

//       return {
//         ...pos,
//         allow_multiple: enabling,
//         max_selections: enabling
//           ? pos.max_selections ?? 2
//           : 1,
//       }
//     })
//   )
//   }

//   const handleMaxSelectionsChange = (id: number, value: string) => {
//   setEditPositions(prev =>
//     prev.map(pos => {
//       if (pos.id !== id) return pos

//       // Allow empty while typing
//       if (value === "") {
//         // store null so the input shows "" — consistent with value={pos.max_selections ?? ""}
//         return { ...pos, max_selections: null }
//       }

//       // Parse base-10 integer
//       const parsed = Number.parseInt(value, 10)
//       if (Number.isNaN(parsed)) {
//         // ignore invalid input (or you can set an error)
//         return pos
//       }

//       // enforce minimum of 1
//       const numValue = Math.max(1, parsed)
//       return { ...pos, max_selections: numValue }
//     })
//   )
// }

//   const addPosition = () => {
//     setEditPositions((prev) => [
//       ...prev,
//       {
//         id: Date.now(),
//         name: "",
        
//         allow_multiple: false,
//         max_selections: 1,
//       },
//     ])
//   }

//   const removePosition = (id: number) => {
//     if (editPositions.length > 1) {
//       setEditPositions((prev) => prev.filter((pos) => pos.id !== id))
//     }
//   }

//   const handlePhaseChange = (
//   phase: string,
//   field: "start_date" | "end_date",
//   value: string
// ) => {
//   setEditPhaseDates(prev =>
//     prev.map(p =>
//       p.phase === phase
//         ? { ...p, [field]: value }
//         : p
//     )
//   )
// }


//   const handleVoterListUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0]
//     if (file) {
//       setEditVoterListFile(file)
//     }
//   }

//   if (approvalState.isPending && userRole === "observer") {
//     return (
//       <div className="grid gap-6">
//         <div className="rounded-lg border border-border bg-card p-6">
//           <h3 className="mb-4 text-lg font-semibold text-foreground">Proposed Election Changes</h3>

//           {/* Display proposed changes in read-only mode */}
//           <div className="space-y-8 mb-8">
//             <div>
//               <h4 className="mb-4 text-sm font-semibold text-foreground">Election Details</h4>
//               <div className="space-y-3 rounded-md bg-secondary/20 p-4">
//                 <div>
//                   <p className="text-xs font-medium text-muted-foreground uppercase">Title</p>
//                   <p className="mt-1 text-foreground">{proposedChanges?.editData.title}</p>
//                 </div>
//                 <div>
//                   <p className="text-xs font-medium text-muted-foreground uppercase">Academic Year</p>
//                   <p className="mt-1 text-foreground">{proposedChanges?.editData.academicYear}</p>
//                 </div>
//                 <div>
//                   <p className="text-xs font-medium text-muted-foreground uppercase">Description</p>
//                   <p className="mt-1 text-foreground">{proposedChanges?.editData.description}</p>
//                 </div>
//               </div>
//             </div>

//             {proposedChanges?.editVoterListFile && (
//               <div>
//                 <h4 className="mb-4 text-sm font-semibold text-foreground">Voter List Update</h4>
//                 <div className="rounded-md bg-secondary/20 p-4">
//                   <p className="text-xs font-medium text-muted-foreground uppercase mb-2">File to Upload</p>
//                   <p className="text-sm font-medium text-foreground">{proposedChanges.editVoterListFile.name}</p>
//                 </div>
//               </div>
//             )}

//             <div>
//               <h4 className="mb-4 text-sm font-semibold text-foreground">Positions</h4>
//               <div className="space-y-3">
//                 {proposedChanges?.editPositions.map((position) => (
//                   <div key={position.id} className="rounded-md bg-secondary/20 p-3">
//                     <p className="text-sm font-medium text-foreground">{position.name}</p>
//                     {position.allow_multiple && (
//                       <p className="text-xs text-muted-foreground mt-1">
//                         Multiple choice: up to {position.max_selections} selections
//                       </p>
//                     )}
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>

//           {/* Observer action buttons */}
//           <div className="flex gap-4 border-t border-border pt-6">
//             <button
//               onClick={handleApprove}
//               className="flex-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
//             >
//               Approve changes
//             </button>
//             <button
//               onClick={handleReject}
//               className="flex-1 rounded-md border border-destructive px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
//             >
//               Reject changes
//             </button>
//           </div>
//         </div>
//       </div>
//     )
//   }

//   if (approvalState.isPending && userRole === "admin") {
//     return (
//       <div className="grid gap-6">
//         <div className="rounded-lg border border-border bg-card p-6">
//           <div className="mb-6 flex items-center justify-between">
//             <h3 className="text-lg font-semibold text-foreground">Election Information</h3>
//             <span className="text-xs font-medium text-muted-foreground">Pending observer approval</span>
//           </div>
//           <div className="space-y-4 opacity-75">
//             <div>
//               <p className="text-sm text-muted-foreground">Title</p>
//               <p className="mt-1 text-foreground">{election?.election.title}</p>
//             </div>
//             <div>
//               <p className="text-sm text-muted-foreground">Academic Year</p>
//               <p className="mt-1 text-foreground">{election?.election.academic_year}</p>
//             </div>
//             <div>
//               <p className="text-sm text-muted-foreground">Current Phase</p>
//               <p className="mt-1">
//                 <span className="inline-block rounded-full bg-primary px-3 py-1 text-sm font-medium text-primary-foreground">
//                   {election?.election.status}
//                 </span>
//               </p>
//             </div>
//             <div>
//               <p className="text-sm text-muted-foreground">Description</p>
//               <p className="mt-1 text-foreground">{election?.election.description}</p>
//             </div>
//           </div>
//         </div>
//       </div>
//     )
//   }

//   if (approvalState.rejectionReason) {
//     return (
//       <div className="grid gap-6">
//         <div className="rounded-lg border border-border bg-card p-6">
//           <div className="mb-6">
//             <p className="text-xs font-medium text-muted-foreground">{approvalState.rejectionReason}</p>
//           </div>
//           <div className="rounded-lg border border-border bg-card p-6">
//             <div className="mb-6 flex items-center justify-between">
//               <h3 className="text-lg font-semibold text-foreground">Election Information</h3>
//               {userRole === "admin" && (
//                 <button
//                   onClick={() => {
//                     setEditPositions(election?.positions || [])
//                     setEditPhaseDates(election?.phases || [])
//                     setApprovalState({ isPending: false })
//                     setIsEditing(true)
//                   }}
//                   className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
//                 >
//                   Edit
//                 </button>
//               )}
//             </div>
//             <div className="space-y-4">
//               <div>
//                 <p className="text-sm text-muted-foreground">Title</p>
//                 <p className="mt-1 text-foreground">{election?.election.title}</p>
//               </div>
//               <div>
//                 <p className="text-sm text-muted-foreground">Academic Year</p>
//                 <p className="mt-1 text-foreground">{election?.election.academic_year}</p>
//               </div>
//               <div>
//                 <p className="text-sm text-muted-foreground">Current Phase</p>
//                 <p className="mt-1">
//                   <span className="inline-block rounded-full bg-primary px-3 py-1 text-sm font-medium text-primary-foreground">
//                     {election?.election.status}
//                   </span>
//                 </p>
//               </div>
//               <div>
//                 <p className="text-sm text-muted-foreground">Description</p>
//                 <p className="mt-1 text-foreground">{election?. election.description}</p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="grid gap-6">
//       {/* Stats Grid */}
//       <div className="grid gap-4 md:grid-cols-3">
//         {stats.map((stat) => (
//           <div key={stat.label} className="rounded-lg border border-border bg-card p-6">
//             <p className="text-sm text-muted-foreground">{stat.label}</p>
//             <p className="mt-2 text-3xl font-bold text-foreground">{stat.value}</p>
//           </div>
//         ))}
//       </div>

//       {/* Read Mode View */}
//       {!isEditing && (
//         <div className="space-y-6">
//           {/* Basic Election Information */}
//           <div className="rounded-lg border border-border bg-card p-6">
//             <div className="mb-6 flex items-center justify-between">
//               <h3 className="text-lg font-semibold text-foreground">Election Information</h3>
//               {userRole === "admin" && (
//                 <button
//                   onClick={() => {
//                     setEditPositions(election?.positions || [])
//                     setEditPhaseDates(election?.phases || [])
//                     setIsEditing(true)
//                   }}
//                   className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
//                 >
//                   Edit
//                 </button>
//               )}
//             </div>
//             <div className="space-y-4">
//               <div>
//                 <p className="text-sm text-muted-foreground">Title</p>
//                 <p className="mt-1 text-foreground">{election?.election.title}</p>
//               </div>
//               <div>
//                 <p className="text-sm text-muted-foreground">Academic Year</p>
//                 <p className="mt-1 text-foreground">{election?.election.academic_year}</p>
//               </div>
//               <div>
//                 <p className="text-sm text-muted-foreground">Current Phase</p>
//                 <p className="mt-1">
//                   <span className="inline-block rounded-full bg-primary px-3 py-1 text-sm font-medium text-primary-foreground">
//                     {election?.election.status}
//                   </span>
//                 </p>
//               </div>
//               <div>
//                 <p className="text-sm text-muted-foreground">Description</p>
//                 <p className="mt-1 text-foreground">{election?.election.description}</p>
//               </div>
//             </div>
//           </div>

//           {/* Positions Display */}
//           <div className="rounded-lg border border-border bg-card p-6">
//             <h3 className="mb-4 text-lg font-semibold text-foreground">Positions</h3>
//             <div className="space-y-3">
//               {election?.positions.map((position) => (
//                 <div key={position.id} className="rounded-md border border-border bg-secondary/30 p-4">
//                   <p className="text-sm font-medium text-foreground">{position.name}</p>
//                   {position.allow_multiple && (
//                     <p className="text-xs text-muted-foreground mt-2">
//                       Multiple choice voting enabled • Up to {position.max_selections} selections
//                     </p>
//                   )}
//                   {!position.allow_multiple && (
//                     <p className="text-xs text-muted-foreground mt-2">Single choice voting</p>
//                   )}
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Phase Dates Display */}
//           <div className="rounded-lg border border-border bg-card p-6">
//             <h3 className="mb-4 text-lg font-semibold text-foreground">Election Phases & Dates</h3>
//             <div className="space-y-4">
//               {election?.phases &&
//                 election.phases.map((phase) => (
//                   <div key={phase.phase} className="rounded-md border border-border bg-secondary/30 p-4">
//                     <p className="text-sm font-semibold text-foreground capitalize mb-3">{phase.phase}</p>
//                     <div className="grid grid-cols-2 gap-4 text-sm">
//                       <div>
//                         <p className="text-xs font-medium text-muted-foreground uppercase mb-1">Start Date</p>
//                         <p className="text-foreground">{phase.start_date?? ""}</p>
//                       </div>
//                       <div>
//                         <p className="text-xs font-medium text-muted-foreground uppercase mb-1">End Date</p>
//                         <p className="text-foreground">{phase.end_date?? ""}</p>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//             </div>
//           </div>

//           {/* Voter List Display */}
//           <div className="rounded-lg border border-border bg-card p-6">
//             <h3 className="mb-4 text-lg font-semibold text-foreground">Eligible Voters</h3>
//             {voterListFile ? (
//               <div className="rounded-md border border-border bg-secondary/30 p-4">
//                 <p className="text-xs font-medium text-muted-foreground uppercase mb-2">Uploaded File</p>
//                 <p className="text-sm font-medium text-foreground">{voterListFile.name}</p>
//                 <p className="text-xs text-muted-foreground mt-1">Uploaded: {voterListFile.uploadedAt}</p>
//               </div>
//             ) : (
//               <p className="text-sm text-muted-foreground">No voter list uploaded</p>
//             )}
//           </div>
//         </div>
//       )}

//       {isEditing && (
//         <div className="rounded-lg border border-border bg-card p-6 space-y-8">
//           <h3 className="text-lg font-semibold text-foreground">Edit Election</h3>

//           {/* Election Details Section */}
//           <div>
//             <h2 className="mb-6 text-lg font-semibold text-foreground">Election Details</h2>
//             <div className="space-y-4">
//               <div>
//                 <label htmlFor="edit-title" className="block text-sm font-medium text-foreground mb-2">
//                   Election Title *
//                 </label>
//                 <input
//                   type="text"
//                   id="edit-title"
//                   value={editData.title}
//                   onChange={(e) => setEditData((prev) => ({ ...prev, title: e.target.value }))}
//                   className="w-full rounded-md border border-input bg-background px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
//                 />
//                 {errors.title && <p className="mt-1 text-xs text-destructive">{errors.title}</p>}
//               </div>

//               <div>
//                 <label htmlFor="edit-year" className="block text-sm font-medium text-foreground mb-2">
//                   Academic Year *
//                 </label>
//                 <input
//                   type="text"
//                   id="edit-year"
//                   value={editData.academicYear}
//                   onChange={(e) => setEditData((prev) => ({ ...prev, academicYear: e.target.value }))}
//                   className="w-full rounded-md border border-input bg-background px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
//                 />
//                 {errors.academicYear && <p className="mt-1 text-xs text-destructive">{errors.academicYear}</p>}
//               </div>

//               <div>
//                 <label htmlFor="edit-description" className="block text-sm font-medium text-foreground mb-2">
//                   Description
//                 </label>
//                 <textarea
//                   id="edit-description"
//                   value={editData.description}
//                   onChange={(e) => setEditData((prev) => ({ ...prev, description: e.target.value }))}
//                   rows={4}
//                   className="w-full rounded-md border border-input bg-background px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
//                 />
//               </div>
//             </div>
//           </div>

//           {/* Voter List Upload Section */}
//           <div>
//             <h2 className="mb-6 text-lg font-semibold text-foreground">Eligible Voters</h2>
//             <div className="rounded-md border border-dashed border-border bg-secondary/30 p-6">
//               <label htmlFor="edit-voter-list" className="flex flex-col items-center cursor-pointer">
//                 <span className="text-sm font-medium text-foreground mb-2">Upload Voter List</span>
//                 <input
//                   type="file"
//                   id="edit-voter-list"
//                   accept=".csv,.xlsx,.xls"
//                   onChange={handleVoterListUpload}
//                   className="hidden"
//                 />
//                 <span className="text-xs text-muted-foreground">CSV or Excel file</span>
//               </label>
//               {editVoterListFile && (
//                 <p className="mt-3 text-xs font-medium text-primary">File selected: {editVoterListFile.name}</p>
//               )}
//               {voterListFile && !editVoterListFile && (
//                 <p className="mt-3 text-xs text-muted-foreground">Current: {voterListFile.name}</p>
//               )}
//               <p className="text-xs text-muted-foreground mt-3">
//                 Uploading a new file will update the existing voter list
//               </p>
//             </div>
//           </div>

//           {/* Positions Section */}
//           <div>
//             <h2 className="mb-6 text-lg font-semibold text-foreground">Positions</h2>
//             <p className="mb-4 text-sm text-muted-foreground">Define the positions available in this election</p>
//             <div className="space-y-6">
//               {editPositions.map((position, idx) => (
//                 <div key={position.id} className="rounded-md border border-border bg-secondary/30 p-4">
//                   <div className="space-y-4">
//                     <div className="flex gap-3">
//                       <input
//                         type="text"
//                         value={position.name}
//                         onChange={(e) => handlePositionChange(position.id, e.target.value)}
//                         placeholder={`Position ${idx + 1}`}
//                         className="flex-1 rounded-md border border-input bg-background px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
//                       />
//                       {editPositions.length > 1 && (
//                         <button
//                           type="button"
//                           onClick={() => removePosition(position.id)}
//                           className="rounded-md border border-destructive px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10"
//                         >
//                           Remove
//                         </button>
//                       )}
//                     </div>
//                     {errors[`position-${position.id}`] && (
//                       <p className="text-xs text-destructive">{errors[`position-${position.id}`]}</p>
//                     )}

//                     <div className="flex items-center gap-3">
//                       <input
//                         type="checkbox"
//                         id={`edit-multi-choice-${position.id}`}
//                         checked={position.allow_multiple}
//                         onChange={() => handleMultiChoiceToggle(position.id)}
//                         className="h-4 w-4 rounded border-input accent-primary"
//                       />
//                       <label
//                         htmlFor={`edit-multi-choice-${position.id}`}
//                         className="text-sm font-medium text-foreground"
//                       >
//                         Enable multiple choice voting for this position
//                       </label>
//                     </div>

//                     {position.allow_multiple && (
//                       <div>
//                         <label
//                           htmlFor={`edit-max-${position.id}`}
//                           className="block text-sm font-medium text-foreground mb-2"
//                         >
//                           Maximum number of selections allowed
//                         </label>
//                         <input
//                           type="number"
//                           id={`edit-max-${position.id}`}
//                           min="1"
//                           value={position.max_selections ?? ""}
//                           onChange={(e) => handleMaxSelectionsChange(position.id, e.target.value)}
//                           className="w-full rounded-md border border-input bg-background px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
//                         />
//                         {errors[`maxselections-${position.id}`] && (
//                           <p className="mt-1 text-xs text-destructive">{errors[`maxselections-${position.id}`]}</p>
//                         )}
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               ))}
//             </div>
//             <button
//               type="button"
//               onClick={addPosition}
//               className="mt-4 rounded-md border border-primary bg-background px-4 py-2 text-sm font-medium text-primary hover:bg-primary/5"
//             >
//               + Add Position
//             </button>
//           </div>

//           {/* Phase Dates Section */}
//           <div>
//             <h2 className="mb-6 text-lg font-semibold text-foreground">Election Phases & Dates</h2>
//             <div className="space-y-6">
//              {["NOMINATION", "SCREENING", "CAMPAIGN", "VOTING", "RESULTS"].map((phase) => {
//   const phaseData = getPhase(phase)

//   return (
//     <div key={phase} className="rounded-md border border-border bg-secondary/30 p-4">
//       <h3 className="mb-4 text-sm font-semibold text-foreground capitalize">{phase}</h3>

//       <div className="grid grid-cols-2 gap-4">
//         <div>
//           <label className="block text-xs font-medium text-muted-foreground uppercase mb-2">
//             Start Date
//           </label>
//           <input
//             type="date"
//             value={phaseData?.start_date ?? ""}
//             onChange={(e) => handlePhaseChange(phase, "start_date", e.target.value)}
//             className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
//           />
//         </div>

//         <div>
//           <label className="block text-xs font-medium text-muted-foreground uppercase mb-2">
//             End Date
//           </label>
//           <input
//             type="date"
//             value={phaseData?.end_date ?? ""}
//             onChange={(e) => handlePhaseChange(phase, "end_date", e.target.value)}
//             className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
//           />
//         </div>
//       </div>
//     </div>
//   )
// })}

//             </div>
//           </div>

//           {/* Action Buttons */}
//           <div className="flex gap-4 border-t border-border pt-8">
//             <button
//               type="button"
//               onClick={handleSave}
//               disabled={Object.keys(errors).length > 0}
//               className="flex-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity"
//             >
//               Save changes
//             </button>
//             <button
//               type="button"
//               onClick={handleCancel}
//               className="flex-1 rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary transition-colors"
//             >
//               Cancel
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }







"use client"

import type React from "react"
import { useEffect, useState } from "react"
import type { AdminElectionDetailsResponse } from "@/app/admin/elections/[id]/page"
import type { PendingApproval } from "../election-tabs"
import axios from "axios"

/* ================= PROPS ================= */

interface OverviewTabProps {
  election: AdminElectionDetailsResponse | null
  userRole: "admin" | "observer"
  pendingApproval: PendingApproval | null
  refetchPendingApproval: () => Promise<void>
}

// Remove the duplicate export and UI code outside the function (already moved above)

/* ================= COMPONENT ================= */

export function OverviewTab({
  election,
  userRole,
  pendingApproval,
  refetchPendingApproval,
}: OverviewTabProps) {
  const [isEditing, setIsEditing] = useState(false)

  // Add stats array for use in the UI
  const stats = [
    { label: "Positions", value: election?.stats?.totalPositions || 0 },
    { label: "Candidates", value: election?.stats?.totalCandidates || 0 },
    { label: "Voters", value: election?.stats?.totalVoters || 0 },
  ]

  const [editData, setEditData] = useState({
  title: "",
  academicYear: "",
  description: "",
})

  const [editPositions, setEditPositions] =
    useState<AdminElectionDetailsResponse["positions"]>(
       []
    )

  const [editPhaseDates, setEditPhaseDates] =
    useState<AdminElectionDetailsResponse["phases"]>(
       []
    )

  const [voterListFile, setVoterListFile] = useState<{
    name: string
    uploadedAt: string
  } | null>(null)

  const [editVoterListFile, setEditVoterListFile] =
    useState<File | null>(null)

  const [errors, setErrors] = useState<Record<string, string>>({})

  /* ================= DERIVED APPROVAL ================= */

  const isEditPending =
    pendingApproval?.action_type === "EDIT_ELECTION"

  const proposedChanges =
    pendingApproval?.action_type === "EDIT_ELECTION"
      ? pendingApproval.payload
      : null

  console.log({ proposedChanges })

  /* ================= HELPERS ================= */

  const getPhase = (phase: string) =>
    editPhaseDates.find(p => p.phase === phase)

  /* ================= VALIDATION ================= */

useEffect(() => {
  if (!election) return

  setEditData({
    title: election.election.title ?? "",
    academicYear: election.election.academic_year ?? "",
    description: election.election.description ?? "",
  })

  setEditPositions(
  (election.positions ?? []).map(p => ({
    ...p,
    allow_multiple: !!p.allow_multiple,
    max_selections: p.allow_multiple
      ? p.max_selections ?? 1
      : 1,
  }))
)

  setEditPhaseDates(election.phases ?? [])

}, [election])







  const validateEdit = (): boolean => {
  const newErrors: Record<string, string> = {}

  /* ---------- Election-level validation ---------- */

  if (!editData.title.trim()) {
    newErrors.title = "Election title is required"
  }

  if (!editData.academicYear.trim()) {
    newErrors.academicYear = "Academic year is required"
  }

  /* ---------- Positions validation ---------- */

  editPositions.forEach(pos => {
    if (!pos.name.trim()) {
      newErrors[`position-${pos.id}`] =
        "Position name is required"
    }

    if (!pos.allow_multiple) {
      // Single-choice → max_selections MUST be null
      if (pos.max_selections != null) {
        newErrors[`maxselections-${pos.id}`] =
          "Single-choice position cannot have max selections"
      }
    } else {
      // Multi-choice → max_selections >= 2
      if (pos.max_selections == null || pos.max_selections < 2) {
        newErrors[`maxselections-${pos.id}`] =
          "Maximum selections must be at least 2"
      }
    }
  })

  /* ---------- Phases validation ---------- */

  editPhaseDates.forEach(phase => {
    if (!phase.start_date || !phase.end_date) {
      newErrors[`${phase.phase}-dates`] =
        "Start and end dates are required"
    } else if (phase.start_date > phase.end_date) {
      newErrors[`${phase.phase}-dates`] =
        "Start date must be before end date"
    }
  })

  /* ---------- Commit errors ---------- */

  setErrors(newErrors)
  return Object.keys(newErrors).length === 0
}

  /* ================= ACTIONS ================= */

  const handleSave = async () => {
    if (!editPhaseDates || editPhaseDates.length === 0) {
  alert("Election phases are required")
  return
}
// for (const p of editPositions) {
//   if (!p.allow_multiple && p.max_selections != null) {
//     throw new Error(
//       `Invalid position "${p.name}": single-choice cannot have max_selections`
//     )
//   }
//   if(p.allow_multiple && (p.max_selections == null || p.max_selections < 2)) {
//     throw new Error(
//       `Invalid position "${p.name}": max_selections must be at least 2`
//     )
// }}


    if (!validateEdit() || !election) return

    const formData = new FormData()
    formData.append("electionId", String(election.election.id))
    formData.append("title", editData.title)
    formData.append("academicYear", editData.academicYear)
    formData.append("description", editData.description)
    formData.append("positions", JSON.stringify(editPositions))
   const sanitizedPhases = editPhaseDates.map(p => ({
  phase: p.phase,
  start_date: p.start_date || null,
  end_date: p.end_date || null,
}))

formData.append("phases", JSON.stringify(sanitizedPhases))

    if (editVoterListFile) {
      formData.append("voterFile", editVoterListFile)
    }

    await axios.post(
      "/api/admin/elections/update-details",
      formData
    )

    setIsEditing(false)
    await refetchPendingApproval()
  }

  const handleApprove = async () => {
    if (!pendingApproval) return

    await axios.post(
      `/api/admin/approvals/approve`
      ,{ approvalRequestId: pendingApproval.id }
    )

    await refetchPendingApproval()
  }

  const handleReject = async () => {
    if (!pendingApproval) return

    await axios.post(
      `/api/admin/approvals/reject`, {approvalRequestId: pendingApproval.id})

    await refetchPendingApproval()
  }

  /* ================= FIELD HANDLERS ================= */

  const handlePositionChange = (id: number, value: string) => {
    setEditPositions(prev =>
      prev.map(p => (p.id === id ? { ...p, name: value } : p))
    )
  }

  const handleMultiChoiceToggle = (id: number) => {
    setEditPositions(prev =>
      prev.map(p =>
        p.id !== id
          ? p
          : {
              ...p,
              allow_multiple: !p.allow_multiple,
              max_selections: !p.allow_multiple
                ? p.max_selections ?? 2
                : 1,
            }
      )
    )
  }

  const handleMaxSelectionsChange = (id: number, value: string) => {
    setEditPositions(prev =>
      prev.map(p =>
        p.id !== id
          ? p
          : {
              ...p,
              max_selections: value
                ? Math.max(1, Number(value))
                : null,
            }
      )
    )
  }

  const addPosition = () => {
    setEditPositions(prev => [
      ...prev,
      {
        id: Date.now(),
        name: "",
        allow_multiple: false,
        max_selections: 1,
      },
    ])
  }

  const removePosition = (id: number) => {
    if (editPositions.length > 1)
      setEditPositions(prev => prev.filter(p => p.id !== id))
  }

  const handlePhaseChange = (
    phase: string,
    field: "start_date" | "end_date",
    value: string
  ) => {
    setEditPhaseDates(prev =>
      prev.map(p =>
        p.phase === phase ? { ...p, [field]: value } : p
      )
    )
  }

  const handleVoterListUpload = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]
    if (file) setEditVoterListFile(file)
  }

  const handleCancel = () => {
    setEditData({
      title: election?.election.title ?? "",
      academicYear: election?.election.academic_year ?? "",
      description: election?.election.description ?? "",
    })
    setEditPositions(election?.positions ?? [])
    setEditPhaseDates(election?.phases ?? [])
    setEditVoterListFile(null)
    setErrors({})
    setIsEditing(false)
  }

/* ================= UI BELOW (UNCHANGED) ================= */

// ⬇️ EVERYTHING BELOW IS YOUR UI — UNTOUCHED ⬇️
// (exactly as you provided)

// … UI CODE CONTINUES EXACTLY AS IS …

// Place all UI code inside the OverviewTab function:
// (Move the following code inside the OverviewTab function, after the last handler)

// UI rendering starts here
// (Paste the entire UI code block here, replacing the duplicate export and UI code below)

if (isEditPending && userRole === "observer") {
  return (
    <div className="grid gap-6">
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="mb-4 text-lg font-semibold text-foreground">Proposed Election Changes</h3>

          {/* Display proposed changes in read-only mode */}
          <div className="space-y-8 mb-8">
            <div>
              <h4 className="mb-4 text-sm font-semibold text-foreground">Election Details</h4>
              <div className="space-y-3 rounded-md bg-secondary/20 p-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase">Title</p>
                  <p className="mt-1 text-foreground">{proposedChanges?.title}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase">Academic Year</p>
                  <p className="mt-1 text-foreground">{proposedChanges?.academicYear}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase">Description</p>
                  <p className="mt-1 text-foreground">{proposedChanges?.description}</p>
                </div>
              </div>
            </div>

            {proposedChanges?.editVoterListFile && (
              <div>
                <h4 className="mb-4 text-sm font-semibold text-foreground">Voter List Update</h4>
                <div className="rounded-md bg-secondary/20 p-4">
                  <p className="text-xs font-medium text-muted-foreground uppercase mb-2">File to Upload</p>
                  <p className="text-sm font-medium text-foreground">{proposedChanges.editVoterListFile.name}</p>
                </div>
              </div>
            )}

            <div>
              <h4 className="mb-4 text-sm font-semibold text-foreground">Positions</h4>
              <div className="space-y-3">
                {proposedChanges?.positions.map((position: {
                  id: number
                  name: string
                  allow_multiple: boolean
                  max_selections: number | null
                }) => (
                  <div key={position.id} className="rounded-md bg-secondary/20 p-3">
                    <p className="text-sm font-medium text-foreground">{position.name}</p>
                    {position.allow_multiple && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Multiple choice: up to {position.max_selections} selections
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>


             <div>
              <h4 className="mb-4 text-sm font-semibold text-foreground">Phases</h4>
              <div className="space-y-3">
                {proposedChanges?.phases.map((phase: {
                  phase: string
                  start_date: string
                  end_date: string
                }) => (
                  <div key={phase.phase} className="rounded-md bg-secondary/20 p-3">
                    <p className="text-sm font-semibold text-foreground capitalize mb-2">{phase.phase}</p>
                    <p className="text-sm font-medium text-foreground">Start Date:- {phase.start_date}</p>
                  
                      
                    <p className="text-sm font-medium text-foreground">End Date:- {phase.end_date}</p>
                    
                  </div>
                ))}
              </div>
            </div>







          </div>

          {/* Observer action buttons */}
          <div className="flex gap-4 border-t border-border pt-6">
            <button
              onClick={handleApprove}
              className="flex-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Approve changes
            </button>
            <button
              onClick={handleReject}
              className="flex-1 rounded-md border border-destructive px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
            >
              Reject changes
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (isEditPending && userRole === "admin") {
    return (
      <div className="grid gap-6">
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">Election Information</h3>
            <span className="text-xs font-medium text-muted-foreground">Pending observer approval</span>
          </div>
          <div className="space-y-4 opacity-75">
            <div>
              <p className="text-sm text-muted-foreground">Title</p>
              <p className="mt-1 text-foreground">{election?.election.title}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Academic Year</p>
              <p className="mt-1 text-foreground">{election?.election.academic_year}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Current Phase</p>
              <p className="mt-1">
                <span className="inline-block rounded-full bg-primary px-3 py-1 text-sm font-medium text-primary-foreground">
                  {election?.election.status}
                </span>
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Description</p>
              <p className="mt-1 text-foreground">{election?.election.description}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // If you want to handle rejection reason, you need to add a new prop or state for it.
  // For now, you can comment this block out or implement a new logic for rejection reason.

  return (
    <div className="grid gap-6">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-lg border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="mt-2 text-3xl font-bold text-foreground">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Read Mode View */}
      {!isEditing && (
        <div className="space-y-6">
          {/* Basic Election Information */}
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Election Information</h3>
              {userRole === "admin" && (
                <button
                  onClick={() => {
                    setEditPositions(election?.positions || [])
                    setEditPhaseDates(election?.phases || [])
                    setIsEditing(true)
                  }}
                  className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
                >
                  Edit
                </button>
              )}
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Title</p>
                <p className="mt-1 text-foreground">{election?.election.title}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Academic Year</p>
                <p className="mt-1 text-foreground">{election?.election.academic_year}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Phase</p>
                <p className="mt-1">
                  <span className="inline-block rounded-full bg-primary px-3 py-1 text-sm font-medium text-primary-foreground">
                    {election?.election.status}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="mt-1 text-foreground">{election?.election.description}</p>
              </div>
            </div>
          </div>

          {/* Positions Display */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="mb-4 text-lg font-semibold text-foreground">Positions</h3>
            <div className="space-y-3">
              {election?.positions.map((position) => (
                <div key={position.id} className="rounded-md border border-border bg-secondary/30 p-4">
                  <p className="text-sm font-medium text-foreground">{position.name}</p>
                  {position.allow_multiple && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Multiple choice voting enabled • Up to {position.max_selections} selections
                    </p>
                  )}
                  {!position.allow_multiple && (
                    <p className="text-xs text-muted-foreground mt-2">Single choice voting</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Phase Dates Display */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="mb-4 text-lg font-semibold text-foreground">Election Phases & Dates</h3>
            <div className="space-y-4">
              {election?.phases &&
                election.phases.map((phase) => (
                  <div key={phase.phase} className="rounded-md border border-border bg-secondary/30 p-4">
                    <p className="text-sm font-semibold text-foreground capitalize mb-3">{phase.phase}</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase mb-1">Start Date</p>
                        <p className="text-foreground">{phase.start_date?? ""}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase mb-1">End Date</p>
                        <p className="text-foreground">{phase.end_date?? ""}</p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Voter List Display */}
          {/* <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="mb-4 text-lg font-semibold text-foreground">Eligible Voters</h3>
            {voterListFile ? (
              <div className="rounded-md border border-border bg-secondary/30 p-4">
                <p className="text-xs font-medium text-muted-foreground uppercase mb-2">Uploaded File</p>
                <p className="text-sm font-medium text-foreground">{voterListFile.name}</p>
                <p className="text-xs text-muted-foreground mt-1">Uploaded: {voterListFile.uploadedAt}</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No voter list uploaded</p>
            )}
          </div> */}
        </div>
      )}

      {isEditing && (
        <div className="rounded-lg border border-border bg-card p-6 space-y-8">
          <h3 className="text-lg font-semibold text-foreground">Edit Election</h3>

          {/* Election Details Section */}
          <div>
            <h2 className="mb-6 text-lg font-semibold text-foreground">Election Details</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="edit-title" className="block text-sm font-medium text-foreground mb-2">
                  Election Title *
                </label>
                <input
                  type="text"
                  id="edit-title"
                  value={editData.title}
                  onChange={(e) => setEditData((prev) => ({ ...prev, title: e.target.value }))}
                  className="w-full rounded-md border border-input bg-background px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {errors.title && <p className="mt-1 text-xs text-destructive">{errors.title}</p>}
              </div>

              <div>
                <label htmlFor="edit-year" className="block text-sm font-medium text-foreground mb-2">
                  Academic Year *
                </label>
                <input
                  type="text"
                  id="edit-year"
                  value={editData.academicYear}
                  onChange={(e) => setEditData((prev) => ({ ...prev, academicYear: e.target.value }))}
                  className="w-full rounded-md border border-input bg-background px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {errors.academicYear && <p className="mt-1 text-xs text-destructive">{errors.academicYear}</p>}
              </div>

              <div>
                <label htmlFor="edit-description" className="block text-sm font-medium text-foreground mb-2">
                  Description
                </label>
                <textarea
                  id="edit-description"
                  value={editData.description}
                  onChange={(e) => setEditData((prev) => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full rounded-md border border-input bg-background px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>
            </div>
          </div>

          {/* Voter List Upload Section */}
          <div>
            <h2 className="mb-6 text-lg font-semibold text-foreground">Eligible Voters</h2>
            <div className="rounded-md border border-dashed border-border bg-secondary/30 p-6">
              <label htmlFor="edit-voter-list" className="flex flex-col items-center cursor-pointer">
                <span className="text-sm font-medium text-foreground mb-2">Upload Voter List</span>
                <input
                  type="file"
                  id="edit-voter-list"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleVoterListUpload}
                  className="hidden"
                />
                <span className="text-xs text-muted-foreground">CSV file</span>
              </label>
              {editVoterListFile && (
                <p className="mt-3 text-xs font-medium text-primary">File selected: {editVoterListFile.name}</p>
              )}
              {voterListFile && !editVoterListFile && (
                <p className="mt-3 text-xs text-muted-foreground">Current: {voterListFile.name}</p>
              )}
              <p className="text-xs text-muted-foreground mt-3">
                Uploading a new file will update the existing voter list
              </p>
            </div>
          </div>

          {/* Positions Section */}
          <div>
            <h2 className="mb-6 text-lg font-semibold text-foreground">Positions</h2>
            <p className="mb-4 text-sm text-muted-foreground">Define the positions available in this election</p>
            <div className="space-y-6">
              {editPositions.map((position, idx) => (
                <div key={position.id} className="rounded-md border border-border bg-secondary/30 p-4">
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={position.name}
                        onChange={(e) => handlePositionChange(position.id, e.target.value)}
                        placeholder={`Position ${idx + 1}`}
                        className="flex-1 rounded-md border border-input bg-background px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      {editPositions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePosition(position.id)}
                          className="rounded-md border border-destructive px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    {errors[`position-${position.id}`] && (
                      <p className="text-xs text-destructive">{errors[`position-${position.id}`]}</p>
                    )}

                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id={`edit-multi-choice-${position.id}`}
                        checked={!!position.allow_multiple}
                        onChange={() => handleMultiChoiceToggle(position.id)}
                        className="h-4 w-4 rounded border-input accent-primary"
                      />
                      <label
                        htmlFor={`edit-multi-choice-${position.id}`}
                        className="text-sm font-medium text-foreground"
                      >
                        Enable multiple choice voting for this position
                      </label>
                    </div>

                    {position.allow_multiple && (
                      <div>
                        <label
                          htmlFor={`edit-max-${position.id}`}
                          className="block text-sm font-medium text-foreground mb-2"
                        >
                          Maximum number of selections allowed
                        </label>
                        <input
                          type="number"
                          id={`edit-max-${position.id}`}
                          min="2"
                          value={position.max_selections ?? ""}
                          onChange={(e) => handleMaxSelectionsChange(position.id, e.target.value)}
                          className="w-full rounded-md border border-input bg-background px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        {errors[`maxselections-${position.id}`] && (
                          <p className="mt-1 text-xs text-destructive">{errors[`maxselections-${position.id}`]}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addPosition}
              className="mt-4 rounded-md border border-primary bg-background px-4 py-2 text-sm font-medium text-primary hover:bg-primary/5"
            >
              + Add Position
            </button>
          </div>

          {/* Phase Dates Section */}
          <div>
            <h2 className="mb-6 text-lg font-semibold text-foreground">Election Phases & Dates</h2>
            <div className="space-y-6">
             {["NOMINATION", "SCREENING", "CAMPAIGN", "VOTING", "RESULTS"].map((phase) => {
  const phaseData = getPhase(phase)

  return (
    <div key={phase} className="rounded-md border border-border bg-secondary/30 p-4">
      <h3 className="mb-4 text-sm font-semibold text-foreground capitalize">{phase}</h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-muted-foreground uppercase mb-2">
            Start Date
          </label>
          <input
            type="date"
            value={phaseData?.start_date ?? ""}
            onChange={(e) => handlePhaseChange(phase, "start_date", e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-muted-foreground uppercase mb-2">
            End Date
          </label>
          <input
            type="date"
            value={phaseData?.end_date ?? ""}
            onChange={(e) => handlePhaseChange(phase, "end_date", e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
      </div>
    </div>
  )
})}

            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 border-t border-border pt-8">
            <button
              type="button"
              onClick={handleSave}
              // disabled={Object.keys(errors).length > 0}
              className="flex-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              Save changes
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}














