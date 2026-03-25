"use client"

import type React from "react"
import axios from "axios"


import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import toast from "react-hot-toast"

interface Position {
  id: string
  name: string
  enableMultiChoice: boolean
  maxSelections: number
}

interface PhaseDates {
  nomination: { startDate: string; endDate: string }
  screening: { startDate: string; endDate: string }
  campaign: { startDate: string; endDate: string }
  voting: { startDate: string; endDate: string }
  results: { startDate: string; endDate: string }
}

interface FormState {
  title: string
  academicYear: string
  description: string
  voterListFile: File | null
}

interface ValidationErrors {
  [key: string]: string
}

export default function CreateElectionPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<FormState>({
    title: "",
    academicYear: "",
    description: "",
    voterListFile: null,
  })

  const [positions, setPositions] = useState<Position[]>([
    { id: "1", name: "", enableMultiChoice: false, maxSelections: 1 },
  ])

  const [phaseDates, setPhaseDates] = useState<PhaseDates>({
    nomination: { startDate: "", endDate: "" },
    screening: { startDate: "", endDate: "" },
    campaign: { startDate: "", endDate: "" },
    voting: { startDate: "", endDate: "" },
    results: { startDate: "", endDate: "" },
  })

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<ValidationErrors>({})

  const handleFormChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handlePositionChange = (id: string, value: string) => {
    setPositions((prev) => prev.map((pos) => (pos.id === id ? { ...pos, name: value } : pos)))
  }

  const handleMultiChoiceToggle = (id: string) => {
    setPositions((prev) =>
      prev.map((pos) =>
        pos.id === id
          ? {
              ...pos,
              enableMultiChoice: !pos.enableMultiChoice,
              maxSelections: !pos.enableMultiChoice ? 2 : 1,
            }
          : pos,
      ),
    )
  }

  const handleMaxSelectionsChange = (id: string, value: string) => {
    const numValue = Math.max(1, Number.parseInt(value) || 1)
    setPositions((prev) => prev.map((pos) => (pos.id === id ? { ...pos, maxSelections: numValue } : pos)))
  }

  const addPosition = () => {
    setPositions((prev) => [
      ...prev,
      { id: Date.now().toString(), name: "", enableMultiChoice: false, maxSelections: 1 },
    ])
  }

  const removePosition = (id: string) => {
    if (positions.length > 1) {
      setPositions((prev) => prev.filter((pos) => pos.id !== id))
    }
  }

  const handlePhaseChange = (phase: keyof PhaseDates, field: string, value: string) => {
    setPhaseDates((prev) => ({
      ...prev,
      [phase]: {
        ...prev[phase],
        [field]: value,
      },
    }))
  }

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {}

    if (!formData.title.trim()) {
      newErrors.title = "Election title is required"
    }
    if (!formData.academicYear.trim()) {
      newErrors.academicYear = "Academic year is required"
    }
    if (!formData.voterListFile) {
      newErrors.voterListFile = "Voter list file is required"
    }

    positions.forEach((pos) => {
      if (!pos.name.trim()) {
        newErrors[`position-${pos.id}`] = "Position name is required"
      }
      if (pos.enableMultiChoice && pos.maxSelections < 1) {
        newErrors[`maxselections-${pos.id}`] = "Maximum selections must be at least 1"
      }
    })

    Object.entries(phaseDates).forEach(([phase, dates]) => {
      if (!dates.startDate || !dates.endDate) {
        newErrors[`${phase}-dates`] = "Start and end dates are required"
      } else if (dates.startDate > dates.endDate) {
        newErrors[`${phase}-dates`] = "Start date must be before end date"
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  if (!validateForm()) return

  setLoading(true)

  try {
    // 1️⃣ Create REAL browser FormData
    const fd = new FormData()

    // 2️⃣ Append primitive fields
    fd.append("title", formData.title)
    fd.append("academicYear", formData.academicYear)
    fd.append("description", formData.description)

    // 3️⃣ Append file (VERY IMPORTANT)
    if (formData.voterListFile) {
      fd.append("voterFile", formData.voterListFile)
    }

    // 4️⃣ Transform positions to backend format

    for (const p of positions) {
  if (!p.enableMultiChoice && p.maxSelections>1) {
    throw new Error(
      `Invalid position "${p.name}": single-choice cannot have max_selections`
    )
  }
  if(p.enableMultiChoice && p.maxSelections < 2) {
    throw new Error(
      `Invalid position "${p.name}": max_selections must be at least 2`
    )
}}

    const formattedPositions = positions.map((p) => ({
      name: p.name,
      allowMultiple: p.enableMultiChoice,
      maxSelections: p.enableMultiChoice ? p.maxSelections : null,
    }))

    fd.append("positions", JSON.stringify(formattedPositions))

    // 5️⃣ Transform phases to backend format
    const formattedPhases = Object.entries(phaseDates).map(
      ([phase, dates]) => ({
        phase: phase.toUpperCase(),
        start: dates.startDate,
        end: dates.endDate,
      })
    )

    fd.append("phases", JSON.stringify(formattedPhases))

    // 6️⃣ Send FormData directly
    await axios.post("/api/admin/elections/create", fd)

    router.push("/admin/elections")
  } catch (error) {
    console.error("Error creating election:", error)
  } finally {

    setLoading(false)
    toast.success("Election created successfully!")
  }
}


  const handleVoterListUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData((prev) => ({ ...prev, voterListFile: file }))
    }
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Create New Election</h1>
          <p className="mt-2 text-muted-foreground">Set up a new election with positions and phase timelines</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 rounded-lg border border-border bg-card p-8">
          {/* Election Details Section */}
          <div>
            <h2 className="mb-6 text-lg font-semibold text-foreground">Election Details</h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-foreground mb-2">
                  Election Title *
                </label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleFormChange("title", e.target.value)}
                  placeholder="e.g., Student Government Elections"
                  required
                  className="w-full rounded-md border border-input bg-background px-4 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {errors.title && <p className="mt-1 text-xs text-destructive">{errors.title}</p>}
              </div>

              <div>
                <label htmlFor="academicYear" className="block text-sm font-medium text-foreground mb-2">
                  Academic Year *
                </label>
                <input
                  type="text"
                  id="academicYear"
                  value={formData.academicYear}
                  onChange={(e) => handleFormChange("academicYear", e.target.value)}
                  placeholder="e.g., 2025-2026"
                  required
                  className="w-full rounded-md border border-input bg-background px-4 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {errors.academicYear && <p className="mt-1 text-xs text-destructive">{errors.academicYear}</p>}
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleFormChange("description", e.target.value)}
                  placeholder="Provide details about this election..."
                  rows={4}
                  className="w-full rounded-md border border-input bg-background px-4 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>
            </div>
          </div>

          {/* Eligible Voters Section */}
          <div>
            <h2 className="mb-6 text-lg font-semibold text-foreground">Eligible Voters</h2>
            <div className="rounded-md border border-dashed border-border bg-secondary/30 p-6">
              <label htmlFor="voterList" className="flex flex-col items-center cursor-pointer">
                <span className="text-sm font-medium text-foreground mb-2">Upload Voter List *</span>
                <input
                  type="file"
                  id="voterList"
                  accept=".csv"
                  onChange={handleVoterListUpload}
                  className="hidden"
                  required
                />
                <span className="text-xs text-muted-foreground">CSV file</span>
              </label>
              {formData.voterListFile && (
                <p className="mt-3 text-xs font-medium text-primary">File selected: {formData.voterListFile.name}</p>
              )}
              {errors.voterListFile && <p className="mt-2 text-xs text-destructive">{errors.voterListFile}</p>}
            </div>
          </div>

          {/* Positions Section */}
          <div>
            <h2 className="mb-6 text-lg font-semibold text-foreground">Positions</h2>
            <p className="mb-4 text-sm text-muted-foreground">Define the positions available in this election</p>

            <div className="space-y-6">
              {positions.map((position, idx) => (
                <div key={position.id} className="rounded-md border border-border bg-secondary/30 p-4">
                  <div className="space-y-4">
                    {/* Position Name */}
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={position.name}
                        onChange={(e) => handlePositionChange(position.id, e.target.value)}
                        placeholder={`Position ${idx + 1} (e.g., President)`}
                        className="flex-1 rounded-md border border-input bg-background px-4 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      {positions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePosition(position.id)}
                          className="rounded-md border border-destructive px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
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
                        id={`multi-choice-${position.id}`}
                        checked={position.enableMultiChoice}
                        onChange={() => handleMultiChoiceToggle(position.id)}
                        className="h-4 w-4 rounded border-input accent-primary"
                      />
                      <label htmlFor={`multi-choice-${position.id}`} className="text-sm font-medium text-foreground">
                        Enable multiple choice voting for this position
                      </label>
                    </div>

                    {position.enableMultiChoice && (
                      <div>
                        <label
                          htmlFor={`max-selections-${position.id}`}
                          className="block text-sm font-medium text-foreground mb-2"
                        >
                          Maximum number of selections allowed
                        </label>
                        <input
                          type="number"
                          id={`max-selections-${position.id}`}
                          min="2"
                          value={position.maxSelections}
                          onChange={(e) => handleMaxSelectionsChange(position.id, e.target.value)}
                          className="w-full rounded-md border border-input bg-background px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
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
              className="mt-4 rounded-md border border-primary bg-background px-4 py-2 text-sm font-medium text-primary hover:bg-primary/5 transition-colors"
            >
              + Add Position
            </button>
          </div>

          {/* Phase Dates Section */}
          <div>
            <h2 className="mb-6 text-lg font-semibold text-foreground">Election Phases & Dates</h2>

            <div className="space-y-6">
              {(["nomination", "screening", "campaign", "voting", "results"] as const).map((phase) => (
                <div key={phase} className="rounded-md border border-border bg-secondary/30 p-4">
                  <h3 className="mb-4 text-sm font-semibold text-foreground capitalize">{phase}</h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground uppercase mb-2">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={phaseDates[phase].startDate}
                        onChange={(e) => handlePhaseChange(phase, "startDate", e.target.value)}
                        required
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-muted-foreground uppercase mb-2">End Date</label>
                      <input
                        type="date"
                        value={phaseDates[phase].endDate}
                        onChange={(e) => handlePhaseChange(phase, "endDate", e.target.value)}
                        required
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                  {errors[`${phase}-dates`] && (
                    <p className="mt-2 text-xs text-destructive">{errors[`${phase}-dates`]}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 border-t border-border pt-8">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {loading ? "Creating..." : "Create Election"}
            </button>
            <Link
              href="/admin/elections"
              className="flex-1 rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary transition-colors text-center"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
