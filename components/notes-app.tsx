"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import type { Note } from "@/lib/types"
import { Sidebar } from "./sidebar"
import { NoteEditor } from "./note-editor"
import { GraphView } from "./graph-view"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ProfileModal } from "./profile-modal"
import { Loader2 } from 'lucide-react'

interface NotesAppProps {
  notes: Note[]
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>
}

export function NotesApp({ notes, setNotes }: NotesAppProps) {
  const [selectedNoteId, setSelectedNoteId] = useState<string>(notes[0]?.id || "")
  const [activeView, setActiveView] = useState<string>("editor")
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Check if we're on mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    // Initial check
    checkIfMobile()

    // Add event listener
    window.addEventListener("resize", checkIfMobile)

    // Cleanup
    return () => window.removeEventListener("resize", checkIfMobile)
  }, [])

  useEffect(() => {
    const checkNotesLoaded = () => {
      if (notes && notes.length > 0) {
        setIsLoading(false)
      }
    }

    // Check initially
    checkNotesLoaded()

    // Set a maximum timeout of 10 seconds
    const timeoutId = setTimeout(() => {
      setIsLoading(false)
    }, 10000)

    // Cleanup timeout
    return () => clearTimeout(timeoutId)
  }, [notes])

  const selectedNote = notes.find((note) => note.id === selectedNoteId) || notes[0]

  const updateNoteTimers = useRef(new Map<string, NodeJS.Timeout>())

  const updateNote = (updatedNote: Note) => {
    setNotes(notes.map((note) => (note.id === updatedNote.id ? updatedNote : note)))

    // Clear any existing timer for this note
    if (updateNoteTimers.current.has(updatedNote.id)) {
      clearTimeout(updateNoteTimers.current.get(updatedNote.id)!)
    }

    // Set a new five-second timer before updating the note in the database
    const timerId = setTimeout(async () => {
      console.log('Updating note:', updatedNote)
      try {
        const response = await fetch('/api/notes', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedNote),
        })

        if (!response.ok) {
          throw new Error('Failed to update note')
        }

        const result = await response.json()
        console.log('Note updated successfully:', result)
      } catch (error) {
        console.error('Error updating note:', error)
      } finally {
        updateNoteTimers.current.delete(updatedNote.id)
        if (updateNoteTimers.current.size === 0) {
          setSaving(false)
        }
      }
    }, 5000)

    // Store the new timer
    updateNoteTimers.current.set(updatedNote.id, timerId)
    setSaving(true)
  }


  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <Sidebar
        notes={notes}
        selectedNoteId={selectedNoteId}
        onSelectNote={setSelectedNoteId}
        activeView={activeView}
        onChangeView={setActiveView}
        isLoading={isLoading}
      />

      {/* Main content area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="flex justify-end items-center p-1 md:p-2">
          <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setIsProfileModalOpen(true)}>
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </Button>
        </header>
        <div className="flex-1 overflow-auto pb-16 md:pb-0">
          {isLoading ? (
            // Show skeleton placeholders when loading
            <div className="p-4 space-y-8">
              <Skeleton className="h-8 w-1/2 rounded-md mb-4" />
              <div className="p-4 space-y-4">
                <Skeleton className="h-4 w-3/4 rounded-md" />
                <Skeleton className="h-4 w-3/4 rounded-md" />
                <Skeleton className="h-4 w-1/4 rounded-md" />
                <Skeleton className="h-4 w-1/2 rounded-md" />
                <Skeleton className="h-4 w-3/4 rounded-md" />
                <Skeleton className="h-4 w-3/4 rounded-md" />
                <Skeleton className="h-4 w-1/4 rounded-md" />
                <Skeleton className="h-4 w-1/2 rounded-md" />
              </div>

            </div>
          ) : (
            <>
              {activeView === "editor" && selectedNote && <NoteEditor note={selectedNote} updateNote={updateNote} saving={saving} />}
              {activeView === "graph" && <GraphView notes={notes} />}
            </>
          )}
        </div>
      </div>

      <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />

      {/* Saving status for desktop */}
      {!isMobile && (
        <div className="fixed bottom-4 right-4 flex items-center space-x-2 text-gray-500 text-sm">
          {saving ? (
            <>
              <Loader2 className="animate-spin w-4 h-4" />
              <span>Saving...</span>
            </>
          ) : (
            <span>Changes saved</span>
          )}
        </div>
      )}
    </div>
  )
}

