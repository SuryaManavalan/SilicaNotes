"use client"

import { useState } from "react"
import { NotesApp } from "@/components/notes-app"
import type { Note } from "@/lib/types"

// Mock notes data
const mockNotes: Note[] = [
  {
    id: "1",
    title: "Welcome to Silica Notes",
    content:
      "<h1>Welcome to your Notes App!</h1><p>This is a simple notes application with a rich text editor powered by Tiptap.</p><p>You can:</p><ul><li><p>Create and edit notes</p></li><li><p>Format text with rich editing options</p></li><li><p>Switch between editor and graph view</p></li></ul>",
    createdAt: new Date("2023-05-01").toISOString(),
    updatedAt: new Date("2023-05-01").toISOString(),
  },
  {
    id: "2",
    title: "Meeting Notes",
    content:
      "<h2>Project Kickoff Meeting</h2><p>Date: June 15, 2023</p><p>Attendees:</p><ul><li><p>John Smith</p></li><li><p>Sarah Johnson</p></li><li><p>Mike Williams</p></li></ul><p>Action Items:</p><ol><li><p>Create project timeline</p></li><li><p>Assign team responsibilities</p></li><li><p>Schedule follow-up meeting</p></li></ol>",
    createdAt: new Date("2023-06-15").toISOString(),
    updatedAt: new Date("2023-06-16").toISOString(),
  },
  {
    id: "3",
    title: "Ideas for New Project",
    content:
      "<h2>Project Ideas</h2><p>Here are some ideas for our next project:</p><ul><li><p>Mobile app for task management</p></li><li><p>Web platform for team collaboration</p></li><li><p>AI-powered content generator</p></li></ul><p>Need to research market demand and competition for each idea.</p>",
    createdAt: new Date("2023-07-10").toISOString(),
    updatedAt: new Date("2023-07-12").toISOString(),
  },
  {
    id: "4",
    title: "Weekly Goals",
    content:
      "<h2>Goals for This Week</h2><ul><li><p>Complete project proposal</p></li><li><p>Review client feedback</p></li><li><p>Update website content</p></li><li><p>Prepare for team presentation</p></li></ul>",
    createdAt: new Date("2023-08-01").toISOString(),
    updatedAt: new Date("2023-08-01").toISOString(),
  },
  {
    id: "5",
    title: "Book Recommendations",
    content:
      '<h2>Books to Read</h2><ol><li><p>"Atomic Habits" by James Clear</p></li><li><p>"Deep Work" by Cal Newport</p></li><li><p>"The Psychology of Money" by Morgan Housel</p></li><li><p>"Building a Second Brain" by Tiago Forte</p></li></ol><p>Start with Atomic Habits first.</p>',
    createdAt: new Date("2023-08-15").toISOString(),
    updatedAt: new Date("2023-08-17").toISOString(),
  },
]

export default function Home() {
  const [notes, setNotes] = useState<Note[]>(mockNotes)

  return <NotesApp notes={notes} setNotes={setNotes} />
}

