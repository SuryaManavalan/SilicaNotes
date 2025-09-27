"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { NotesApp } from "@/components/notes-app"
import type { Note } from "@/lib/types"

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([])
  const { data: session, status } = useSession()

  useEffect(() => {
    async function fetchNotes() {
      try {
        const response = await fetch('/api/notes')
        if (response.ok) {
          const data = await response.json()
          setNotes(data)
        } else {
          console.error('Failed to fetch notes')
          setNotes([])
        }
      } catch (error) {
        console.error('Error fetching notes:', error)
        setNotes([])
      }
    }

    // Only fetch when authentication status is determined (not loading)
    if (status !== "loading") {
      fetchNotes()
    }
  }, [status]) // Re-fetch when auth status changes

  return <NotesApp notes={notes} setNotes={setNotes} />
}

