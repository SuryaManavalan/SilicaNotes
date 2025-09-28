/**
 * Helper functions for managing note links in the frontend
 */

export interface LinkOperation {
  noteId: string
  linkedNoteId: string
}

/**
 * Add a link between two notes
 */
export async function addNoteLink({ noteId, linkedNoteId }: LinkOperation): Promise<boolean> {
  try {
    const response = await fetch('/api/notes/links', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        noteId: parseInt(noteId), 
        linkedNoteId: parseInt(linkedNoteId) 
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to add note link')
    }

    return true
  } catch (error) {
    console.error('Error adding note link:', error)
    return false
  }
}

/**
 * Remove a link between two notes
 */
export async function removeNoteLink({ noteId, linkedNoteId }: LinkOperation): Promise<boolean> {
  try {
    const response = await fetch('/api/notes/links', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        noteId: parseInt(noteId), 
        linkedNoteId: parseInt(linkedNoteId) 
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to remove note link')
    }

    return true
  } catch (error) {
    console.error('Error removing note link:', error)
    return false
  }
}

/**
 * Update a note's links array locally and sync with server
 */
export async function updateNoteLinks(
  noteId: string, 
  newLinks: number[], 
  updateNote: (note: any) => void,
  currentNote: any
): Promise<boolean> {
  // Update locally first for immediate UI feedback
  updateNote({
    ...currentNote,
    links: newLinks
  })

  // Then sync with server
  try {
    const response = await fetch('/api/notes', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...currentNote,
        links: newLinks
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to update note links')
    }

    return true
  } catch (error) {
    console.error('Error updating note links:', error)
    // Revert local changes on error
    updateNote(currentNote)
    return false
  }
}