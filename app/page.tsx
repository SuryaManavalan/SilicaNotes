"use client"

import { useState, useEffect } from "react"
import { NotesApp } from "@/components/notes-app"
import type { Note } from "@/lib/types"

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([])

  useEffect(() => {
    async function fetchNotes() {
      const response = await fetch('/api/notes')
      const data = await response.json()
      setNotes(data)
    }

    fetchNotes()
  }, [])

  return <NotesApp notes={notes} setNotes={setNotes} />
}

