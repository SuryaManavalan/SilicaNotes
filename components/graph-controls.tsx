import React from 'react'
import { Button } from '@/components/ui/button'
import { RotateCcw, Zap, ZapOff, Shuffle, Link, ZoomIn, ZoomOut, Maximize } from 'lucide-react'

interface GraphControlsProps {
  onReset?: () => void
  onTogglePhysics?: () => void
  onToggleConnectionType?: () => void
  onZoomIn?: () => void
  onZoomOut?: () => void
  onResetZoom?: () => void
  physicsEnabled?: boolean
  useRealConnections?: boolean
  zoomLevel?: number
  nodeCount: number
  linkCount: number
}

export function GraphControls({ 
  onReset, 
  onTogglePhysics, 
  onToggleConnectionType,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  physicsEnabled = true,
  useRealConnections = false,
  zoomLevel = 1,
  nodeCount, 
  linkCount 
}: GraphControlsProps) {
  return (
    <div className="absolute top-4 left-4 bg-background/80 backdrop-blur-sm rounded-lg p-3 border shadow-lg">
      <div className="flex flex-col gap-2">
        <div className="text-xs text-muted-foreground">
          {nodeCount} notes • {linkCount} connections • {Math.round(zoomLevel * 100)}% zoom
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onReset}
            className="h-8 px-2"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Reset
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onTogglePhysics}
            className="h-8 px-2"
          >
            {physicsEnabled ? (
              <>
                <ZapOff className="h-3 w-3 mr-1" />
                Pause
              </>
            ) : (
              <>
                <Zap className="h-3 w-3 mr-1" />
                Resume
              </>
            )}
          </Button>
        </div>
        <div className="flex gap-2 mt-2">
          <Button
            size="sm"
            variant={useRealConnections ? "default" : "outline"}
            onClick={onToggleConnectionType}
            className="h-8 px-2 text-xs"
          >
            {useRealConnections ? (
              <>
                <Link className="h-3 w-3 mr-1" />
                Smart
              </>
            ) : (
              <>
                <Shuffle className="h-3 w-3 mr-1" />
                Random
              </>
            )}
          </Button>
        </div>
        <div className="flex gap-1 mt-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onZoomOut}
            className="h-8 px-2"
            disabled={zoomLevel <= 0.3}
          >
            <ZoomOut className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onResetZoom}
            className="h-8 px-2 text-xs"
          >
            <Maximize className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onZoomIn}
            className="h-8 px-2"
            disabled={zoomLevel >= 3}
          >
            <ZoomIn className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  )
}