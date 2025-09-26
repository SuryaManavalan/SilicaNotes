import type { Note } from '@/lib/types'

export interface NoteConnection {
  sourceId: string
  targetId: string
  strength?: number // Optional: weight of the connection
  type?: 'reference' | 'tag' | 'similar' | 'manual' // Optional: type of connection
}

/**
 * Utility functions for analyzing note connections
 */
export class GraphUtils {
  /**
   * Extract connections based on note content analysis
   * This is a placeholder - implement your own logic based on:
   * - Shared tags
   * - Content similarity
   * - Cross-references
   * - Manual links
   */
  static extractConnections(notes: Note[]): NoteConnection[] {
    const connections: NoteConnection[] = []
    
    // Example: Find notes that mention other note titles
    notes.forEach(sourceNote => {
      notes.forEach(targetNote => {
        if (sourceNote.id !== targetNote.id) {
          // Simple check if one note's title appears in another's content
          const titleMentioned = sourceNote.content
            .toLowerCase()
            .includes(targetNote.title.toLowerCase())
          
          if (titleMentioned) {
            connections.push({
              sourceId: sourceNote.id,
              targetId: targetNote.id,
              type: 'reference',
              strength: 1
            })
          }
        }
      })
    })
    
    return connections
  }

  /**
   * Find shared keywords/tags between notes
   */
  static findSharedKeywords(notes: Note[]): NoteConnection[] {
    const connections: NoteConnection[] = []
    const commonWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']
    
    notes.forEach(sourceNote => {
      const sourceWords = this.extractWords(sourceNote.content)
        .filter(word => !commonWords.includes(word) && word.length > 3)
      
      notes.forEach(targetNote => {
        if (sourceNote.id !== targetNote.id) {
          const targetWords = this.extractWords(targetNote.content)
          const sharedWords = sourceWords.filter(word => targetWords.includes(word))
          
          if (sharedWords.length >= 2) { // At least 2 shared meaningful words
            connections.push({
              sourceId: sourceNote.id,
              targetId: targetNote.id,
              type: 'similar',
              strength: sharedWords.length
            })
          }
        }
      })
    })
    
    return connections
  }

  /**
   * Extract words from text content
   */
  private static extractWords(content: string): string[] {
    return content
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 0)
  }

  /**
   * Combine multiple connection sources and deduplicate
   */
  static combineConnections(...connectionSources: NoteConnection[][]): NoteConnection[] {
    const connectionMap = new Map<string, NoteConnection>()
    
    connectionSources.flat().forEach(conn => {
      const key = `${conn.sourceId}-${conn.targetId}`
      const reverseKey = `${conn.targetId}-${conn.sourceId}`
      
      if (!connectionMap.has(key) && !connectionMap.has(reverseKey)) {
        connectionMap.set(key, conn)
      } else {
        // If connection exists, increase strength
        const existing = connectionMap.get(key) || connectionMap.get(reverseKey)
        if (existing) {
          existing.strength = (existing.strength || 1) + (conn.strength || 1)
        }
      }
    })
    
    return Array.from(connectionMap.values())
  }
}