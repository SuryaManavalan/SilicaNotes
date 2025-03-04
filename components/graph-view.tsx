"use client"

import type { Note } from "@/lib/types"

interface GraphViewProps {
  notes: Note[]
}

export function GraphView({ notes }: GraphViewProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-4">
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-bold mb-4">Graph View</h2>
        <p className="text-muted-foreground mb-6">
          This is a placeholder for the graph view that would show connections between your {notes.length} notes.
        </p>
        <div className="border rounded-lg p-4 md:p-8 bg-muted/20">
          <div className="flex flex-wrap gap-2 md:gap-4 justify-center">
            {notes.map((note) => (
              <div
                key={note.id}
                className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium border border-primary/20"
                title={note.title}
              >
                {note.title.substring(0, 2).toUpperCase()}
              </div>
            ))}
          </div>
          <div className="mt-4 text-sm text-muted-foreground">Interactive graph visualization would appear here</div>
        </div>
      </div>
    </div>
  )
}

