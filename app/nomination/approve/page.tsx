// "use client"

// import { useEffect, useState } from "react"
// import axios from "axios"
// import { useSearchParams } from "next/navigation"

// export default function SupporterApprovalPage({
//   searchParams,
// }: {
//   searchParams: { token?: string }
// }) {
//     const params = useSearchParams()
//   const token = params.get("token")
//   const [data, setData] = useState<any>(null)
//   const [loading, setLoading] = useState(true)
//   const [status, setStatus] = useState<string | null>(null)

//   useEffect(() => {
//     if (!token) return

//     axios
//       .get(`/api/nomination/supporter/validate?token=${token}`)
//       .then((res) => setData(res.data))
//       .catch(() => setStatus("INVALID"))
//       .finally(() => setLoading(false))
//   }, [token])

//   const approve = async () => {
//     await axios.post("/api/nomination/supporter/approve", { token })
//     setStatus("APPROVED")
//   }

//   // const reject = async () => {
//   //   await axios.post("/api/nomination/supporter/reject", { token })
//   //   setStatus("REJECTED")
//   // }

//   if (loading) {
//     return <div className="min-h-screen flex items-center justify-center">Loading…</div>
//   }

//   if (status === "INVALID") {
//     return <CenteredMessage text="Invalid or expired link" />
//   }

//   if (status === "APPROVED") {
//     return <CenteredMessage text="Nomination approved successfully" />
//   }

//   if (status === "REJECTED") {
//     return <CenteredMessage text="Nomination rejected" />
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-white">
//       <div className="w-full max-w-md border rounded-lg p-6 shadow-sm">
//         <h1 className="text-xl font-semibold text-blue-700 mb-2">
//           Nomination Approval
//         </h1>

//         <p className="text-sm text-gray-600 mb-4">
//           You are listed as the <b>{data.role.toLowerCase()}</b> for the
//           following nomination:
//         </p>

//         <div className="bg-gray-50 rounded-md p-4 mb-4">
//           <p className="text-sm">
//             <b>Candidate:</b> {data.candidateName}
//           </p>
//           <p className="text-sm">
//             <b>Position:</b> {data.positionName}
//           </p>
//         </div>

//         <div className="flex gap-3">
//           <button
//             onClick={approve}
//             className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
//           >
//             Approve
//           </button>
//           {/* <button
//             onClick={reject}
//             className="flex-1 border border-gray-300 py-2 rounded-md"
//           >
//             Reject
//           </button> */}
//         </div>
//       </div>
//     </div>
//   )
// }

// function CenteredMessage({ text }: { text: string }) {
//   return (
//     <div className="min-h-screen flex items-center justify-center bg-white">
//       <p className="text-gray-700 text-lg">{text}</p>
//     </div>
//   )
// }





"use client"

import { useEffect, useState, Suspense } from "react"
import axios from "axios"
import { useSearchParams } from "next/navigation"

function SupporterApprovalContent() {
  const params = useSearchParams()
  const token = params.get("token")

  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState<string | null>(null)

  useEffect(() => {
    if (!token) return

    axios
      .get(`/api/nomination/supporter/validate?token=${token}`)
      .then((res) => setData(res.data))
      .catch(() => setStatus("INVALID"))
      .finally(() => setLoading(false))
  }, [token])

  const approve = async () => {
    await axios.post("/api/nomination/supporter/approve", { token })
    setStatus("APPROVED")
  }

  // const reject = async () => {
  //   await axios.post("/api/nomination/supporter/reject", { token })
  //   setStatus("REJECTED")
  // }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading…
      </div>
    )
  }

  if (status === "INVALID") {
    return <CenteredMessage text="Invalid or expired link" />
  }

  if (status === "APPROVED") {
    return <CenteredMessage text="Nomination approved successfully" />
  }

  if (status === "REJECTED") {
    return <CenteredMessage text="Nomination rejected" />
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-md border rounded-lg p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-blue-700 mb-2">
          Nomination Approval
        </h1>

        <p className="text-sm text-gray-600 mb-4">
          You are listed as the <b>{data.role.toLowerCase()}</b> for the
          following nomination:
        </p>

        <div className="bg-gray-50 rounded-md p-4 mb-4">
          <p className="text-sm">
            <b>Candidate:</b> {data.candidateName}
          </p>
          <p className="text-sm">
            <b>Position:</b> {data.positionName}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={approve}
            className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
          >
            Approve
          </button>
        </div>
      </div>
    </div>
  )
}

export default function SupporterApprovalPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading…
        </div>
      }
    >
      <SupporterApprovalContent />
    </Suspense>
  )
}

function CenteredMessage({ text }: { text: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <p className="text-gray-700 text-lg">{text}</p>
    </div>
  )
}

