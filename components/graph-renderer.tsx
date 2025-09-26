import React, { useEffect, useRef, useCallback } from 'react'
import { Application, Graphics, Text, TextStyle } from 'pixi.js'
import * as d3 from 'd3-force'
import { useTheme } from 'next-themes'
import type { GraphNode, GraphLink } from '@/hooks/use-graph-data'

interface GraphRendererProps {
  nodes: GraphNode[]
  links: GraphLink[]
  width: number
  height: number
  selectedNodeId?: string
  zoomLevel?: number
  onNodeClick?: (node: GraphNode) => void
  onZoomChange?: (newZoom: number) => void
}

export function GraphRenderer({ 
  nodes, 
  links, 
  width = 800, 
  height = 600,
  selectedNodeId,
  zoomLevel = 1,
  onNodeClick,
  onZoomChange
}: GraphRendererProps) {
  const { theme, resolvedTheme } = useTheme()
  const pixiContainer = useRef<HTMLDivElement>(null)
  const appRef = useRef<Application | null>(null)
  const simulationRef = useRef<d3.Simulation<GraphNode, GraphLink> | null>(null)
  const nodesRef = useRef<GraphNode[]>([])
  const linksRef = useRef<GraphLink[]>([])
  const graphicsRef = useRef<Graphics | null>(null)
  
  // Refs for stable values to prevent PIXI app recreation
  const currentZoomLevelRef = useRef(zoomLevel)
  const currentSelectedNodeIdRef = useRef(selectedNodeId)
  const currentThemeRef = useRef(resolvedTheme)

  // Theme-aware color scheme
  const getThemeColors = useCallback(() => {
    // Default to dark theme if resolvedTheme is not yet available (SSR/hydration)
    const isDark = resolvedTheme === 'dark' || resolvedTheme === undefined
    return {
      background: isDark ? 0x0f172a : 0xf8fafc, // slate-900 : slate-50
      nodeDefault: isDark ? 0x3b82f6 : 0x1e40af, // blue-500 : blue-800 (more muted)
      nodeSelected: isDark ? 0xf59e0b : 0xd97706, // amber-500 : amber-600
      nodeSelectedGlow: isDark ? 0xfbbf24 : 0xf59e0b, // amber-400 : amber-500
      nodeHighlight: isDark ? 0xffffff : 0xffffff, // white for inner highlight
      linkColor: isDark ? 0x64748b : 0x94a3b8, // slate-500 : slate-400
      textColor: isDark ? 0xf1f5f9 : 0x1e293b, // slate-100 : slate-800
      textStroke: isDark ? 0x000000 : 0xffffff, // black stroke in dark, white stroke in light
      textBackground: isDark ? 0x000000 : 0xffffff, // black : white
    }
  }, [resolvedTheme])

  const drawNode = useCallback((graphic: Graphics, x: number, y: number, linkCount: number, nodeId?: string, isSelected?: boolean, nodeTitle?: string, currentZoom?: number) => {
    const colors = getThemeColors()
    const baseRadius = 4 + linkCount * 2 // Base radius based on link count
    const radius = baseRadius * (currentZoom || 1) // Scale with zoom
    graphic.clear()
    
    // Debug logging
    if (isSelected) {
      console.log('🎯 Drawing selected node:', nodeId)
    }
    
    // Highlight selected node
    if (isSelected) {
      // Outer glow ring
      graphic.beginFill(colors.nodeSelectedGlow, 0.3) // Theme-aware glow
      graphic.drawCircle(x, y, radius + 4 * (currentZoom || 1))
      graphic.endFill()
      
      // Main node with different color
      graphic.beginFill(colors.nodeSelected) // Theme-aware selected color
      graphic.drawCircle(x, y, radius)
      graphic.endFill()
      
      // Inner highlight
      graphic.beginFill(colors.nodeHighlight, 0.6)
      graphic.drawCircle(x, y, Math.max(1, radius - 2))
      graphic.endFill()
    } else {
      // Normal node with muted theme-aware color
      graphic.beginFill(colors.nodeDefault)
      graphic.drawCircle(x, y, radius)
      graphic.endFill()
    }

    // Draw labels when zoomed in enough (zoom > 1.5)
    if ((currentZoom || 1) > 1.5 && nodeTitle) {
      const fontSize = Math.min(24, 12 * (currentZoom || 1)) // Scale font with zoom
      const maxWidth = 100 * (currentZoom || 1) // Scale max width with zoom
      
      // Truncate title if too long
      let displayTitle = nodeTitle
      if (displayTitle.length > 15) {
        displayTitle = displayTitle.substring(0, 12) + '...'
      }
      
      // Create text style with theme-aware colors
      const textStyle = {
        fontFamily: 'Arial, sans-serif',
        fontSize: fontSize,
        fill: colors.textColor,
        align: 'center' as const,
        stroke: colors.textStroke,
        strokeThickness: 1, // Reduced thickness
        wordWrap: true,
        wordWrapWidth: maxWidth
      }
      
      // Draw text background for readability - more subtle
      const textMetrics = { width: displayTitle.length * fontSize * 0.6, height: fontSize }
      const padding = 3 * (currentZoom || 1) // Reduced padding
      
      graphic.beginFill(colors.textBackground, 0.4) // More transparent background
      graphic.drawRoundedRect(
        x - textMetrics.width / 2 - padding,
        y + radius + 5 * (currentZoom || 1) - padding,
        textMetrics.width + padding * 2,
        textMetrics.height + padding * 2,
        3 * (currentZoom || 1) // Smaller border radius
      )
      graphic.endFill()
      
      // Add the text (we'll use PIXI.Text for this, but for now, just mark the position)
      // Note: PIXI.Text would be created separately and added to the stage
    }
  }, [getThemeColors])

  // Update refs when values change
  useEffect(() => {
    currentSelectedNodeIdRef.current = selectedNodeId
  }, [selectedNodeId])

  useEffect(() => {
    currentZoomLevelRef.current = zoomLevel
  }, [zoomLevel])

  useEffect(() => {
    currentThemeRef.current = resolvedTheme
  }, [resolvedTheme])

  const updatePositions = useCallback(() => {
    if (!graphicsRef.current) return

    const colors = getThemeColors()
    // Clear graphics before redrawing
    graphicsRef.current.clear()

    // Draw links first so nodes appear on top
    graphicsRef.current.beginFill(0x000000, 0) // Transparent fill
    const currentZoom = currentZoomLevelRef.current
    const linkWidth = Math.max(1, 2 * currentZoom) // Scale link width with zoom
    graphicsRef.current.lineStyle(linkWidth, colors.linkColor, 0.6)
    let drawnLinks = 0
    linksRef.current.forEach((link, index) => {
      if (link.source && link.target && typeof link.source === 'object' && typeof link.target === 'object') {
        const sourceX = link.source.x || 0
        const sourceY = link.source.y || 0
        const targetX = link.target.x || 0
        const targetY = link.target.y || 0
        
        // Only draw if coordinates are valid
        if (sourceX !== 0 && sourceY !== 0 && targetX !== 0 && targetY !== 0) {
          graphicsRef.current!.moveTo(sourceX, sourceY)
          graphicsRef.current!.lineTo(targetX, targetY)
          drawnLinks++
        }
        
        // Debug first few links
        if (index < 2 && Math.random() < 0.01) {
          console.log('🔗 Drawing link:', { 
            source: { id: link.source.id, x: sourceX, y: sourceY },
            target: { id: link.target.id, x: targetX, y: targetY }
          })
        }
      }
    })
    graphicsRef.current.endFill()

    // Then update node positions
    let updatedNodes = 0
    nodesRef.current.forEach(node => {
      if (node.circle) {
        node.circle.clear()
        const isSelected = currentSelectedNodeIdRef.current === node.id
        const currentZoom = currentZoomLevelRef.current
        drawNode(node.circle, node.x, node.y, node.linkCount, node.id, isSelected, node.title, currentZoom)
        
        // Update text position if it exists
        if ((node as any).textLabel) {
          const textLabel = (node as any).textLabel as Text
          textLabel.x = node.x
          textLabel.y = node.y + (4 + node.linkCount * 2) * currentZoom + 10 * currentZoom
          textLabel.visible = currentZoom > 1.5
          
          if (currentZoom > 1.5) {
            const colors = getThemeColors()
            const fontSize = Math.min(24, 12 * currentZoom)
            textLabel.style.fontSize = fontSize
            textLabel.style.fill = colors.textColor
            textLabel.style.stroke = { width: Math.max(0.5, 1 * (currentZoom / 2)), color: colors.textStroke }
          }
        }
        
        updatedNodes++
      }
    })

    // Log every 200 ticks to see if simulation is running
    if (Math.random() < 0.005) {
      console.log('🔄 Tick update:', { drawnLinks, updatedNodes, totalNodes: nodesRef.current.length, totalLinks: linksRef.current.length })
    }
  }, [drawNode, getThemeColors])

  useEffect(() => {
    const initializePixi = async () => {
      if (!pixiContainer.current) return

      // Wait for theme to be resolved on client side
      if (typeof window !== 'undefined' && resolvedTheme === undefined) {
        return
      }

      // Clean up existing app if it exists
      if (appRef.current) {
        if (simulationRef.current) {
          simulationRef.current.stop()
        }
        appRef.current.destroy(true, true)
        appRef.current = null
      }

      try {
        const colors = getThemeColors()
        // Initialize PIXI application
        const app = new Application()
        await app.init({ 
          width, 
          height, 
          antialias: true, 
          backgroundColor: colors.background // Theme-aware background
        })

        if (!app.view) {
          throw new Error('PIXI application view is not initialized.')
        }

        // Clear container and add new view
        if (pixiContainer.current) {
          pixiContainer.current.innerHTML = ''
          pixiContainer.current.appendChild(app.view)
        }
        appRef.current = app

        // Create a container for link graphics
        const graphics = new Graphics()
        app.stage.addChild(graphics)
        graphicsRef.current = graphics

        // Create fresh copies of nodes and links to avoid reference issues
        const margin = 100 // Keep nodes away from edges
        const freshNodes = nodes.map(node => ({
          ...node,
          x: margin + Math.random() * (width - 2 * margin),
          y: margin + Math.random() * (height - 2 * margin),
          circle: undefined as any, // Clear any existing circle reference
          fx: null, // Clear any fixed positions
          fy: null
        }))
        
        // Create links with proper node references
        const freshLinks = links.map(link => {
          const sourceNode = freshNodes.find(n => n.id === (typeof link.source === 'string' ? link.source : link.source.id))
          const targetNode = freshNodes.find(n => n.id === (typeof link.target === 'string' ? link.target : link.target.id))
          return {
            source: sourceNode || link.source,
            target: targetNode || link.target
          }
        }).filter(link => link.source && link.target)

        console.log('✅ Fresh nodes created:', freshNodes.slice(0, 3))
        console.log('✅ Fresh links created:', freshLinks.slice(0, 3))

        // Update refs
        nodesRef.current = freshNodes
        linksRef.current = freshLinks

        // Initialize D3 Force Simulation
        const simulation = d3.forceSimulation(nodesRef.current)
          .force('charge', d3.forceManyBody().strength(-40))
          .force('link', d3.forceLink(linksRef.current).id((d: any) => d.id).distance(100))
          .force('center', d3.forceCenter(width / 2, height / 2))
          .on('tick', updatePositions)

        simulationRef.current = simulation

        console.log('✅ Simulation initialized with:', {
          nodes: nodesRef.current.length,
          links: linksRef.current.length
        })

        // Center on selected node if provided
        if (selectedNodeId) {
          const selectedNode = nodesRef.current.find(n => n.id === selectedNodeId)
          if (selectedNode) {
            // Set the selected node near the center
            selectedNode.fx = width / 2
            selectedNode.fy = height / 2
            simulation.alpha(1).restart()
            
            // Release the fixed position after a short time
            setTimeout(() => {
              selectedNode.fx = null
              selectedNode.fy = null
            }, 1000)
          }
        }

        // Dragging logic
        let dragTarget: any = null

        function onDragMove(event: any) {
          if (dragTarget && simulationRef.current) {
            dragTarget.node.fx = event.global.x
            dragTarget.node.fy = event.global.y
            simulationRef.current.alpha(1).restart()
          }
        }

        function onDragStart(this: any, event: any) {
          this.alpha = 0.5
          dragTarget = this
          if (simulationRef.current) {
            dragTarget.node.fx = event.global.x
            dragTarget.node.fy = event.global.y
            app.stage.on('pointermove', onDragMove)
          }
        }

        function onDragEnd() {
          if (dragTarget && simulationRef.current) {
            app.stage.off('pointermove', onDragMove)
            dragTarget.alpha = 1
            dragTarget.node.fx = null
            dragTarget.node.fy = null
            dragTarget = null
            simulationRef.current.alphaTarget(0)
          }
        }

        // Set up global drag end handlers
        app.stage.eventMode = 'static'
        app.stage.hitArea = app.screen
        app.stage.on('pointerup', onDragEnd)
        app.stage.on('pointerupoutside', onDragEnd)

        // Add throttled mouse wheel zoom support
        let wheelTimeout: NodeJS.Timeout | null = null
        const handleWheel = (event: WheelEvent) => {
          event.preventDefault()
          
          if (wheelTimeout) {
            clearTimeout(wheelTimeout)
          }
          
          wheelTimeout = setTimeout(() => {
            const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1
            const newZoom = Math.max(0.3, Math.min(3, currentZoomLevelRef.current * zoomFactor))
            onZoomChange?.(newZoom)
          }, 16) // ~60fps throttling
        }

        if (app.view && app.view.addEventListener) {
          app.view.addEventListener('wheel', handleWheel, { passive: false })
        }

        // Create interactive nodes using PIXI.Graphics (Circles)
        nodesRef.current.forEach(node => {
          const circle = new Graphics()
          const isSelected = selectedNodeId === node.id
          drawNode(circle, node.x, node.y, node.linkCount, node.id, isSelected, node.title, zoomLevel)

          // Create text label
          let displayTitle = node.title
          if (displayTitle.length > 15) {
            displayTitle = displayTitle.substring(0, 12) + '...'
          }

          const textStyle = new TextStyle({
            fontFamily: 'Arial, sans-serif',
            fontSize: 12 * zoomLevel,
            fill: colors.textColor,
            align: 'center',
            stroke: { width: Math.max(0.5, 1 * (zoomLevel / 2)), color: colors.textStroke }, // Reduced stroke width
            wordWrap: true,
            wordWrapWidth: 100 * zoomLevel
          })

          const textLabel = new Text(displayTitle, textStyle)
          textLabel.anchor.set(0.5) // Center the text
          textLabel.x = node.x
          textLabel.y = node.y + (4 + node.linkCount * 2) * zoomLevel + 10 * zoomLevel
          textLabel.visible = zoomLevel > 1.5

          // Enable interaction
          circle.eventMode = 'static'
          circle.cursor = 'pointer'
          ;(circle as any).node = node
          ;(node as any).textLabel = textLabel

          // Add click handler (separate from drag)
          circle.on('pointerdown', (event) => {
            const startTime = Date.now()
            const startPos = { x: event.global.x, y: event.global.y }
            
            const handlePointerUp = (upEvent: any) => {
              const timeDiff = Date.now() - startTime
              const distance = Math.sqrt(
                Math.pow(upEvent.global.x - startPos.x, 2) + 
                Math.pow(upEvent.global.y - startPos.y, 2)
              )
              
              // If it's a quick tap with minimal movement, treat as click
              if (timeDiff < 200 && distance < 5) {
                onNodeClick?.(node)
              }
              
              app.stage.off('pointerup', handlePointerUp)
            }
            
            app.stage.on('pointerup', handlePointerUp)
          })

          // Add drag handlers
          circle.on('pointerdown', onDragStart, circle)

          app.stage.addChild(circle)
          app.stage.addChild(textLabel)
          node.circle = circle
        })

      } catch (error) {
        console.error('Error initializing PIXI application:', error)
      }
    }

    initializePixi()

    return () => {
      if (simulationRef.current) {
        simulationRef.current.stop()
        simulationRef.current = null
      }
      if (appRef.current) {
        appRef.current.destroy(true, true)
        appRef.current = null
      }
      nodesRef.current = []
      linksRef.current = []
      graphicsRef.current = null
    }
  }, [nodes, links, width, height, updatePositions, drawNode, onNodeClick, selectedNodeId, resolvedTheme]) // Added resolvedTheme to trigger recreation on theme change

  // Handle selectedNodeId changes without recreating the component
  useEffect(() => {
    if (!simulationRef.current) return

    // Redraw all nodes to update highlighting
    nodesRef.current.forEach(node => {
      if (node.circle) {
        const isSelected = selectedNodeId === node.id
        drawNode(node.circle, node.x, node.y, node.linkCount, node.id, isSelected, node.title, zoomLevel)
        
        // Update text visibility and size
        if ((node as any).textLabel) {
          const textLabel = (node as any).textLabel as Text
          textLabel.visible = zoomLevel > 1.5
          if (zoomLevel > 1.5) {
            const colors = getThemeColors()
            const fontSize = Math.min(24, 12 * zoomLevel)
            textLabel.style.fontSize = fontSize
            textLabel.style.fill = colors.textColor
            textLabel.style.stroke = { width: Math.max(0.5, 1 * (zoomLevel / 2)), color: colors.textStroke } // Reduced stroke width
          }
        }
      }
    })

    // Center the selected node if one is provided
    if (selectedNodeId) {
      const selectedNode = nodesRef.current.find(n => n.id === selectedNodeId)
      if (selectedNode) {
        selectedNode.fx = width / 2
        selectedNode.fy = height / 2
        simulationRef.current.alpha(1).restart()
        
        // Release the fixed position after centering
        setTimeout(() => {
          selectedNode.fx = null
          selectedNode.fy = null
        }, 1000)
      }
    }
  }, [selectedNodeId, width, height, drawNode, zoomLevel])

  // Handle zoom changes separately without recreating the component
  useEffect(() => {
    if (!appRef.current) return

    // Update link distances based on zoom level
    if (simulationRef.current) {
      const linkDistance = 100 * zoomLevel // Base distance of 100, scaled by zoom
      const linkForce = simulationRef.current.force('link') as d3.ForceLink<GraphNode, GraphLink>
      if (linkForce) {
        linkForce.distance(linkDistance)
        simulationRef.current.alpha(0.3).restart() // Gentle restart to apply new distances
      }
    }

    // Update all nodes with new zoom level
    nodesRef.current.forEach(node => {
      if (node.circle) {
        const isSelected = selectedNodeId === node.id
        drawNode(node.circle, node.x, node.y, node.linkCount, node.id, isSelected, node.title, zoomLevel)
        
        // Update text label
        if ((node as any).textLabel) {
          const textLabel = (node as any).textLabel as Text
          textLabel.visible = zoomLevel > 1.5
          
          if (zoomLevel > 1.5) {
            const colors = getThemeColors()
            const fontSize = Math.min(24, 12 * zoomLevel)
            textLabel.style.fontSize = fontSize
            textLabel.style.fill = colors.textColor
            textLabel.style.stroke = { width: Math.max(0.5, 1 * (zoomLevel / 2)), color: colors.textStroke } // Reduced stroke width
            
            // Update position based on new node size
            const radius = (4 + node.linkCount * 2) * zoomLevel
            textLabel.y = node.y + radius + 10 * zoomLevel
          }
        }
      }
    })
  }, [zoomLevel, selectedNodeId, drawNode])

  return (
    <div 
      ref={pixiContainer} 
      style={{ 
        width: `${width}px`, 
        height: `${height}px`,
        overflow: 'hidden',
        position: 'relative'
      }} 
    />
  )
}