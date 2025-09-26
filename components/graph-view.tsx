"use client"

import React, { useState, useCallback, useRef } from 'react'
import type { Note } from '@/lib/types'
import { useGraphData, type GraphNode } from '@/hooks/use-graph-data'
import { GraphRenderer } from '@/components/graph-renderer'
import { GraphControls } from '@/components/graph-controls'
import { Button } from '@/components/ui/button'
import { Maximize2, Minimize2 } from 'lucide-react'

interface GraphViewProps {
  notes: Note[]
  selectedNodeId?: string
  onNodeSelect?: (nodeId: string) => void
}

export function GraphView({ notes, selectedNodeId, onNodeSelect }: GraphViewProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [physicsEnabled, setPhysicsEnabled] = useState(true)
  const [useRealConnections, setUseRealConnections] = useState(false)
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })
  const [zoomLevel, setZoomLevel] = useState(1)
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Update dimensions when container or fullscreen state changes
  React.useEffect(() => {
    const updateDimensions = () => {
      if (isFullscreen) {
        setDimensions({
          width: window.innerWidth,
          height: window.innerHeight
        })
      } else if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setDimensions({
          width: Math.max(400, rect.width),
          height: Math.max(300, rect.height)
        })
      }
    }

    // Initial update
    updateDimensions()
    
    // Listen for window resize
    window.addEventListener('resize', updateDimensions)
    
    // Use ResizeObserver to detect container size changes (like sidebar collapse)
    let resizeObserver: ResizeObserver | null = null
    if (containerRef.current && !isFullscreen) {
      resizeObserver = new ResizeObserver(updateDimensions)
      resizeObserver.observe(containerRef.current)
    }
    
    return () => {
      window.removeEventListener('resize', updateDimensions)
      if (resizeObserver) {
        resizeObserver.disconnect()
      }
    }
  }, [isFullscreen])

  const { width, height } = dimensions
  
  const { nodes, links, setConnections } = useGraphData({ 
    notes, 
    width, 
    height,
    useRealConnections
  })

  const handleNodeClick = useCallback((node: GraphNode) => {
    console.log('Node clicked:', node.title)
    onNodeSelect?.(node.id)
  }, [onNodeSelect])

  const handleReset = useCallback(() => {
    // This will regenerate connections
    setConnections([])
  }, [setConnections])

  const toggleConnectionType = useCallback(() => {
    setUseRealConnections(prev => !prev)
    setConnections([]) // Reset connections when switching types
  }, [setConnections])

  const handleTogglePhysics = useCallback(() => {
    setPhysicsEnabled(prev => !prev)
    // Note: Full physics control would require exposing simulation controls
  }, [])

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev)
  }, [])

  const handleZoomIn = useCallback(() => {
    setZoomLevel(prev => Math.min(prev * 1.2, 3)) // Max zoom 3x
  }, [])

  const handleZoomOut = useCallback(() => {
    setZoomLevel(prev => Math.max(prev / 1.2, 0.3)) // Min zoom 0.3x
  }, [])

  const handleResetZoom = useCallback(() => {
    setZoomLevel(1)
  }, [])

  const handleZoomChange = useCallback((newZoom: number) => {
    setZoomLevel(newZoom)
  }, [])

  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4">Graph View</h2>
          <p className="text-muted-foreground">
            Create some notes to see them visualized in the graph view.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div 
      ref={containerRef}
      className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-background' : 'w-full h-full'}`}
    >
      {/* Fullscreen toggle */}
      <Button
        size="sm"
        variant="outline"
        onClick={toggleFullscreen}
        className="absolute top-4 right-4 z-10 h-8 px-2 bg-background/80 backdrop-blur-sm"
      >
        {isFullscreen ? (
          <>
            <Minimize2 className="h-3 w-3 mr-1" />
            Exit
          </>
        ) : (
          <>
            <Maximize2 className="h-3 w-3 mr-1" />
            Expand
          </>
        )}
      </Button>

      {/* Graph Controls */}
      <GraphControls
        onReset={handleReset}
        onTogglePhysics={handleTogglePhysics}
        onToggleConnectionType={toggleConnectionType}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetZoom={handleResetZoom}
        physicsEnabled={physicsEnabled}
        useRealConnections={useRealConnections}
        zoomLevel={zoomLevel}
        nodeCount={nodes.length}
        linkCount={links.length}
      />

      {/* Graph Container */}
      <div className="w-full h-full overflow-hidden">
        <GraphRenderer
          nodes={nodes}
          links={links}
          width={width}
          height={height}
          selectedNodeId={selectedNodeId}
          zoomLevel={zoomLevel}
          onNodeClick={handleNodeClick}
          onZoomChange={handleZoomChange}
        />
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 bg-background/80 backdrop-blur-sm rounded-lg p-3 border shadow-lg max-w-sm">
        <div className="text-xs text-muted-foreground">
          <div className="font-medium mb-1">Interactive Graph</div>
          <div>• Drag nodes to reposition them</div>
          <div>• Click nodes to select (logged to console)</div>
          <div>• Scroll to zoom in/out (shows labels at high zoom)</div>
          <div>• Larger nodes have more connections</div>
        </div>
      </div>
    </div>
  )
}

