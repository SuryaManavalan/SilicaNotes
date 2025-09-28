"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { useSession } from "next-auth/react"
import type { Note } from "@/lib/types"
import { Sidebar } from "./sidebar"
import { NoteEditor } from "./note-editor"
import { GraphView } from "./graph-view"
import { AuthButton } from "./auth-button"
import { Skeleton } from "@/components/ui/skeleton"
import { Loader2 } from 'lucide-react'
import { processNoteLinks } from "@/lib/obsidian-links"

interface NotesAppProps {
  notes: Note[]
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>
}

export function NotesApp({ notes, setNotes }: NotesAppProps) {
  const { data: session, status } = useSession()
  const [selectedNoteId, setSelectedNoteId] = useState<string>(notes[0]?.id || "")
  const [activeView, setActiveView] = useState<string>("editor")
  const [isMobile, setIsMobile] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const isAuthenticated = !!session
  const isAuthLoading = status === "loading"

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

  // Cleanup on unmount - save any pending changes
  useEffect(() => {
    return () => {
      savePendingChanges()
    }
  }, [])

  const selectedNote = notes.find((note) => note.id === selectedNoteId) || notes[0]

  const updateNoteTimers = useRef(new Map<string, NodeJS.Timeout>())

  // Save any pending changes before switching notes
  const savePendingChanges = async () => {
    if (updateNoteTimers.current.size > 0 && isAuthenticated) {
      // Get all pending notes and save them immediately
      const pendingNoteIds = Array.from(updateNoteTimers.current.keys())
      
      for (const noteId of pendingNoteIds) {
        const noteToSave = notes.find(note => note.id === noteId)
        if (noteToSave) {
          // Clear the timer and save immediately
          clearTimeout(updateNoteTimers.current.get(noteId)!)
          updateNoteTimers.current.delete(noteId)
          
          try {
            await fetch('/api/notes', {
              method: noteToSave.id === "0" || parseInt(noteToSave.id) < 0 ? 'POST' : 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(noteToSave),
            })
          } catch (error) {
            console.error('Error saving pending changes:', error)
          }
        }
      }
      setSaving(false)
    }
  }

  const getLowestUnusedId = (notes: Note[]): string => {
    let id = 0;
    while (notes.some(note => note.id === id.toString())) {
      id--;
    }
    return id.toString();
  }

  const updateNote = useCallback((updatedNote: Note) => {
    // Always update local state for immediate UI feedback
    setNotes(currentNotes => currentNotes.map((note) => (note.id === updatedNote.id ? updatedNote : note)))

    // If not authenticated, don't save to server
    if (!isAuthenticated) {
      console.log('Note updated locally only - user not authenticated')
      return
    }

    // Clear any existing timer for this note
    if (updateNoteTimers.current.has(updatedNote.id)) {
      clearTimeout(updateNoteTimers.current.get(updatedNote.id)!)
    }

    // Set a longer timer (10 seconds) to allow for continuous typing
    const timerId = setTimeout(async () => {
      console.log('Saving note to server:', updatedNote.id)
      
      // Process Obsidian-style links before saving
      const extractedLinks = processNoteLinks(updatedNote, notes)
      const noteWithLinks = {
        ...updatedNote,
        links: extractedLinks
      }
      
      // Update local state with processed links
      setNotes(currentNotes => currentNotes.map((note) => 
        note.id === updatedNote.id ? noteWithLinks : note
      ))
      
      try {
        const response = await fetch('/api/notes', {
          method: updatedNote.id === "0" || parseInt(updatedNote.id) < 0 ? 'POST' : 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(noteWithLinks),
        })

        if (!response.ok) {
          throw new Error('Failed to update note')
        }

        const result = await response.json()
        console.log('Note saved successfully:', result.id)

        // If the note is new, update its ID with the one from the database
        if (updatedNote.id === "0" || parseInt(updatedNote.id) < 0) {
          const newId = result.id
          setNotes(currentNotes => currentNotes.map((note) => 
            note.id === updatedNote.id ? { ...note, id: newId } : note
          ))
          setSelectedNoteId(newId)
        }
      } catch (error) {
        console.error('Error saving note:', error)
      } finally {
        updateNoteTimers.current.delete(updatedNote.id)
        if (updateNoteTimers.current.size === 0) {
          setSaving(false)
        }
      }
    }, 10000) // Increased to 10 seconds

    // Store the new timer
    updateNoteTimers.current.set(updatedNote.id, timerId)
    setSaving(true)
  }, [isAuthenticated, notes, setNotes, setSelectedNoteId, setSaving])

  const saveNoteImmediately = async (noteToSave: Note) => {
    if (!isAuthenticated) return

    // Clear any existing timer for this note
    if (updateNoteTimers.current.has(noteToSave.id)) {
      clearTimeout(updateNoteTimers.current.get(noteToSave.id)!)
      updateNoteTimers.current.delete(noteToSave.id)
    }

    setSaving(true)
    
    // Process Obsidian-style links before saving
    const extractedLinks = processNoteLinks(noteToSave, notes)
    const noteWithLinks = {
      ...noteToSave,
      links: extractedLinks
    }
    
    // Update local state with processed links
    setNotes(currentNotes => currentNotes.map((note) => 
      note.id === noteToSave.id ? noteWithLinks : note
    ))
    
    try {
      const response = await fetch('/api/notes', {
        method: noteToSave.id === "0" || parseInt(noteToSave.id) < 0 ? 'POST' : 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(noteWithLinks),
      })

      if (!response.ok) {
        throw new Error('Failed to save note')
      }

      const result = await response.json()
      console.log('Note saved immediately:', result.id)

      // If the note is new, update its ID with the one from the database
      if (noteToSave.id === "0" || parseInt(noteToSave.id) < 0) {
        const newId = result.id
        setNotes(currentNotes => currentNotes.map((note) => 
          note.id === noteToSave.id ? { ...note, id: newId } : note
        ))
        setSelectedNoteId(newId)
      }
    } catch (error) {
      console.error('Error saving note immediately:', error)
    } finally {
      setSaving(false)
    }
  }

  const onCreateNote = () => {
    const newNote: Note = {
      id: getLowestUnusedId(notes),
      title: isAuthenticated ? "Untitled Note" : "Preview Note (Sign in to save)",
      content: "",
      links: [],
      updated_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    }
    setNotes([newNote, ...notes])
    setSelectedNoteId(newNote.id)
    setActiveView("editor")
    
    if (!isAuthenticated) {
      console.log('Note created locally only - user not authenticated')
    }
  }

  const onDeleteNote = async (id: string) => {
    // Always allow local deletion for better UX
    setNotes(notes.filter((note) => note.id !== id))
    setSelectedNoteId(notes.filter(note => note.id !== id)[0]?.id || "")
    
    // If not authenticated, only delete locally
    if (!isAuthenticated) {
      console.log('Note deleted locally only - user not authenticated')
      return
    }

    try {
      const response = await fetch('/api/notes', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      })

      if (!response.ok) {
        throw new Error('Failed to delete note')
      }

      const result = await response.json()
      console.log('Note deleted successfully from server:', result)
    } catch (error) {
      console.error('Error deleting note:', error)
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <Sidebar
        notes={notes}
        selectedNoteId={selectedNoteId}
        onSelectNote={async (noteId: string) => {
          await savePendingChanges()
          setSelectedNoteId(noteId)
        }}
        activeView={activeView}
        onChangeView={setActiveView}
        isLoading={isLoading}
        onCreateNote={onCreateNote}
        onDeleteNote={onDeleteNote}
        isAuthenticated={isAuthenticated}
        isAuthLoading={isAuthLoading}
      />

      {/* Main content area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="flex justify-end items-center p-1 md:p-2">
          <AuthButton />
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
              {activeView === "editor" && selectedNote && (
                <NoteEditor 
                  note={selectedNote} 
                  updateNote={updateNote} 
                  saving={saving} 
                  isAuthenticated={isAuthenticated}
                  onSave={() => saveNoteImmediately(selectedNote)}
                  onNavigateToNote={(noteTitle) => {
                    console.log('🎯 Attempting to navigate to:', noteTitle)
                    // Find the note with matching title
                    const targetNote = notes.find(n => 
                      n.title.toLowerCase().trim() === noteTitle.toLowerCase().trim()
                    )
                    if (targetNote) {
                      console.log('✅ Found target note:', targetNote.title, 'ID:', targetNote.id)
                      setSelectedNoteId(targetNote.id)
                    } else {
                      console.log(`❌ Note not found: "${noteTitle}"`)
                      console.log('📋 Available notes:', notes.map(n => n.title))
                    }
                  }}
                  allNotes={notes}
                />
              )}
              {activeView === "graph" && (
                <GraphView 
                  notes={notes} 
                  selectedNodeId={selectedNoteId}
                  onNodeSelect={(nodeId) => {
                    setSelectedNoteId(nodeId)
                    setActiveView("editor") // Switch to editor when node is clicked
                  }}
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* Saving status for desktop */}
      {!isMobile && (
        <div className="fixed bottom-4 right-4 flex items-center space-x-2 text-gray-500 text-sm">
          {!isAuthenticated ? (
            <span className="text-amber-600">Preview mode - Sign in to save</span>
          ) : saving ? (
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

