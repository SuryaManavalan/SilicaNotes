import { useState, useMemo } from 'react'
import type { Note } from '@/lib/types'
import { GraphUtils, type NoteConnection } from '@/lib/graph-utils'

export interface GraphNode {
  id: string
  title: string
  x: number
  y: number
  linkCount: number
  fx?: number | null
  fy?: number | null
  circle?: any // PIXI Graphics object - can be undefined initially
}

export interface GraphLink {
  source: GraphNode | string
  target: GraphNode | string
}

interface UseGraphDataProps {
  notes: Note[]
  width: number
  height: number
  useRealConnections?: boolean
}

export function useGraphData({ 
  notes, 
  width = 800, 
  height = 600, 
  useRealConnections = false 
}: UseGraphDataProps) {
  // State for storing connections that can be updated later with real data
  const [connections, setConnections] = useState<NoteConnection[]>([])

  const graphData = useMemo(() => {
    // Convert notes to graph nodes
    const nodes: GraphNode[] = notes.map(note => ({
      id: note.id,
      title: note.title,
      x: Math.random() * width,
      y: Math.random() * height,
      linkCount: 0
    }))

    // Generate connections based on settings
    const links: GraphLink[] = []
    let activeConnections = connections

    // If using real connections and no manual connections exist, analyze notes
    if (useRealConnections && connections.length === 0 && nodes.length > 1) {
      activeConnections = GraphUtils.combineConnections(
        GraphUtils.extractConnections(notes),
        GraphUtils.findSharedKeywords(notes)
      )
    }
    
    if (activeConnections.length === 0 && nodes.length > 1) {
      // Generate random connections (30 links or 1.5x the number of nodes, whichever is smaller)
      const numLinks = Math.min(30, Math.floor(nodes.length * 1.5))
      
      for (let i = 0; i < numLinks; i++) {
        const sourceNode = nodes[Math.floor(Math.random() * nodes.length)]
        const targetNode = nodes[Math.floor(Math.random() * nodes.length)]
        
        if (sourceNode !== targetNode) {
          // Check if link already exists
          const linkExists = links.some(link => 
            (link.source === sourceNode && link.target === targetNode) ||
            (link.source === targetNode && link.target === sourceNode)
          )
          
          if (!linkExists) {
            sourceNode.linkCount++
            targetNode.linkCount++
            links.push({ source: sourceNode, target: targetNode })
          }
        }
      }
    } else {
      // Use existing connections
      activeConnections.forEach(conn => {
        const sourceNode = nodes.find(n => n.id === conn.sourceId)
        const targetNode = nodes.find(n => n.id === conn.targetId)
        
        if (sourceNode && targetNode) {
          sourceNode.linkCount++
          targetNode.linkCount++
          links.push({ source: sourceNode, target: targetNode })
        }
      })
    }

    return { nodes, links }
  }, [notes, connections, width, height, useRealConnections])

  return {
    ...graphData,
    connections,
    setConnections
  }
}