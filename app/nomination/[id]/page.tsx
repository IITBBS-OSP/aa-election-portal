"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import DashboardHeader from "@/components/dashboard/header"
import { useEffect, useState } from "react"
import axios from "axios"
import { useParams, useRouter } from "next/navigation"

interface Position {
  id: number
  name: string
}

export default function NominationApplicationPage() {
  const params = useParams()
  const router = useRouter()
  const electionId = params.id as string

  /* =========================
     STATE
     ========================= */
  const [name, setName] = useState("")
  const [userEmail, setUserEmail] = useState("")

  const [positions, setPositions] = useState<Position[]>([])
  const [selectedPosition, setSelectedPosition] = useState("")

  const [graduationYear, setGraduationYear] = useState("")
  const [department, setDepartment] = useState("")

  const [proposerEmail, setProposerEmail] = useState("")
  const [seconderEmail, setSeconderEmail] = useState("")

  const [proposerValid, setProposerValid] = useState<boolean | null>(null)
  const [seconderValid, setSeconderValid] = useState<boolean | null>(null)

  const [supporterError, setSupporterError] = useState<string | null>(null)

  const [candidateImage, setCandidateImage] = useState<File | null>(null)
  const [sopFile, setSopFile] = useState<File | null>(null)

  const [imageFileName, setImageFileName] = useState<string | null>(null)
  const [sopFileName, setSopFileName] = useState<string | null>(null)

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /* =========================
     LOAD CONTEXT + POSITIONS
     ========================= */
  useEffect(() => {
    const load = async () => {
      try {
        const ctx = await axios.get(
          `/api/users/elections/${electionId}/nomination-context`
        )
        setName(ctx.data.name)
        setUserEmail(ctx.data.email)

        const election = await axios.get(
          `/api/users/elections/${electionId}`
        )
        setPositions(election.data.positions)
      } catch (err: any) {
        if (err.response?.status === 401) router.push("/login")
        else if (err.response?.status === 403) router.push("/unauthorized")
        else console.error(err)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [electionId, router])

  /* =========================
     VALIDATE SUPPORTER
     ========================= */
  const validateVoter = async (
    email: string,
    setter: (v: boolean) => void
  ) => {
    if (!email) return

    if (email === userEmail) {
      setter(false)
      setSupporterError("You cannot propose or second yourself")
      return
    }

    if (proposerEmail && seconderEmail && proposerEmail === seconderEmail) {
      setter(false)
      setSupporterError("Proposer and seconder cannot be the same")
      return
    }

    try {
      const res = await axios.get(
        `/api/users/elections/${electionId}/validate-voter`,
        { params: { email } }
      )

      setter(res.data.valid)

      if (!res.data.valid) {
        setSupporterError("Not an eligible voter for this election")
      } else {
        setSupporterError(null)
      }
    } catch {
      setter(false)
      setSupporterError("Validation failed")
    }
  }

  /* =========================
     SUBMIT
     ========================= */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (
      !candidateImage ||
      !sopFile ||
      !selectedPosition ||
      !proposerValid ||
      !seconderValid
    ) {
      setError("Please complete all required fields.")
      return
    }

    try {
      setSubmitting(true)

      const fd = new FormData()
      fd.append("electionId", electionId)
      fd.append("positionId", selectedPosition)
      fd.append("graduationYear", graduationYear)
      fd.append("department", department)
      fd.append("proposerEmail", proposerEmail)
      fd.append("seconderEmail", seconderEmail)
      fd.append("candidateImage", candidateImage)
      fd.append("sopFile", sopFile)

      await axios.post("/api/users/nominations/create", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      router.push("/nomination-status")
    } catch (err: any) {
      setError(err.response?.data?.error || "Submission failed")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="p-6 text-sm text-muted-foreground">Loading…</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="max-w-2xl mx-auto px-4 py-8">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="mb-6">
            ← Back to dashboard
          </Button>
        </Link>

        <Card className="card-elevated">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold text-foreground">
              Nomination application
            </CardTitle>
            <CardDescription className="text-sm">
              Submit your nomination for the 2025 election.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-4">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Name */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  disabled
                  className="w-full px-3 py-2 bg-muted border border-border rounded-md text-sm text-foreground opacity-70 cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground">
                  Verified from alumni database
                </p>
              </div>

              {/* Graduation Year */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">
                  Graduation year
                </label>
                <input
                  type="number"
                  value={graduationYear}
                  onChange={(e) => setGraduationYear(e.target.value)}
                  className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              {/* Department */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">
                  Department / faculty
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              {/* Position */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">
                  Position applying for
                </label>
                <select
                  value={selectedPosition}
                  onChange={(e) => setSelectedPosition(e.target.value)}
                  className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  <option value="">Select position</option>
                  {positions.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Candidate Image */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">
                  Upload candidate photograph <span className="text-red-500">*</span>
                </label>
                <label className="block cursor-pointer">
                  <input
                    type="file"
                    accept="image/png,image/jpeg"
                    required
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null
                      setCandidateImage(file)
                      setImageFileName(file ? file.name : null)
                    }}
                  />
                  <div className="px-4 py-3 bg-muted/50 border border-dashed border-border rounded-md text-center text-sm hover:bg-muted transition-colors">
                    Click to upload or drag and drop
                  </div>
                </label>
                {imageFileName && (
                  <p className="text-xs text-muted-foreground">
                    Selected file: {imageFileName}
                  </p>
                )}
              </div>

              {/* SOP */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">
                  Upload statement of purpose (PDF)
                </label>
                <label className="block cursor-pointer">
                  <input
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null
                      setSopFile(file)
                      setSopFileName(file ? file.name : null)
                    }}
                  />
                  <div className="px-4 py-3 bg-muted/50 border border-dashed border-border rounded-md text-center text-sm hover:bg-muted transition-colors">
                    Click to upload or drag and drop
                  </div>
                </label>
                {sopFileName && (
                  <p className="text-xs text-muted-foreground">
                    Selected file: {sopFileName}
                  </p>
                )}
              </div>

              {/* Proposer */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">
                  Proposer email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={proposerEmail}
                  onChange={(e) => setProposerEmail(e.target.value)}
                  onBlur={() =>
                    validateVoter(proposerEmail, setProposerValid)
                  }
                  className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              {/* Seconder */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">
                  Seconder email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={seconderEmail}
                  onChange={(e) => setSeconderEmail(e.target.value)}
                  onBlur={() =>
                    validateVoter(seconderEmail, setSeconderValid)
                  }
                  className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              {supporterError && (
                <p className="text-xs text-red-500">{supporterError}</p>
              )}

              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4">
                <Link href="/dashboard">
                  <Button variant="outline" size="sm">
                    Cancel
                  </Button>
                </Link>

                <Button
                  type="submit"
                  size="sm"
                  disabled={
                    submitting ||
                    !proposerValid ||
                    !seconderValid ||
                    !selectedPosition
                  }
                >
                  Submit nomination
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
