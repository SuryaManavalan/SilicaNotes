import type { Note } from '@/lib/types'

/**
 * Extract Obsidian-style links from note content
 * Supports both [[Note Title]] and [[Note Title|Display Text]] formats
 */
export function extractObsidianLinks(content: string): string[] {
  const linkRegex = /\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g
  const links: string[] = []
  let match

  while ((match = linkRegex.exec(content)) !== null) {
    const noteTitle = match[1].trim()
    if (noteTitle && !links.includes(noteTitle)) {
      links.push(noteTitle)
    }
  }

  return links
}

/**
 * Find note IDs that match the extracted link titles
 */
export function findLinkedNoteIds(linkTitles: string[], allNotes: Note[]): number[] {
  const linkedIds: number[] = []
  
  linkTitles.forEach(linkTitle => {
    // Find notes with matching titles (case-insensitive)
    const matchingNote = allNotes.find(note => 
      note.title.toLowerCase().trim() === linkTitle.toLowerCase().trim()
    )
    
    if (matchingNote) {
      const noteId = parseInt(matchingNote.id)
      if (!isNaN(noteId) && !linkedIds.includes(noteId)) {
        linkedIds.push(noteId)
      }
    }
  })
  
  return linkedIds
}

/**
 * Process note content and return the links that should be saved
 */
export function processNoteLinks(note: Note, allNotes: Note[]): number[] {
  // Don't process links for the note itself
  const otherNotes = allNotes.filter(n => n.id !== note.id)
  
  // Extract link titles from content
  const linkTitles = extractObsidianLinks(note.content)
  
  // Find matching note IDs
  const linkedIds = findLinkedNoteIds(linkTitles, otherNotes)
  
  return linkedIds
}

/**
 * Convert note content links to clickable elements (for display purposes)
 * This is optional - you can use it to make links clickable in the editor
 */
export function renderObsidianLinks(content: string, onLinkClick?: (noteTitle: string) => void): string {
  return content.replace(
    /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g,
    (match, noteTitle, displayText) => {
      const text = displayText || noteTitle
      const clickHandler = onLinkClick ? `onclick="handleLinkClick('${noteTitle}')"` : ''
      return `<span class="obsidian-link text-blue-600 hover:text-blue-800 cursor-pointer underline" ${clickHandler}>${text}</span>`
    }
  )
}