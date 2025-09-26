# Graph View Implementation

This implementation provides an interactive node graph visualization for SilicaNotes using PIXI.js and D3-force simulation.

## Features

### Interactive Graph
- **Drag & Drop**: Click and drag nodes to reposition them
- **Physics Simulation**: Nodes are attracted/repelled with realistic physics
- **Node Sizing**: Node size reflects the number of connections
- **Smooth Animation**: Real-time physics simulation with smooth movement

### Controls
- **Reset**: Regenerate the graph layout and connections
- **Physics Toggle**: Pause/Resume the physics simulation
- **Connection Types**: Switch between Random and Smart connections
- **Fullscreen**: Expand to full screen for better visualization

### Connection Types

#### Random Connections (Default)
- Generates random connections between notes
- Creates approximately 1.5x connections per note (max 30)
- Good for testing and demonstration

#### Smart Connections
- Analyzes note content to find real relationships
- **Reference Links**: Finds notes that mention other note titles
- **Shared Keywords**: Connects notes with similar content
- **Keyword Analysis**: Filters out common words, focuses on meaningful terms

## Technical Implementation

### Components Structure
```
components/
  graph-view.tsx          # Main graph component
  graph-renderer.tsx      # PIXI.js rendering logic
  graph-controls.tsx      # UI controls

hooks/
  use-graph-data.ts       # Graph data management

lib/
  graph-utils.ts          # Connection analysis utilities
```

### Key Technologies
- **PIXI.js**: Hardware-accelerated 2D rendering
- **D3-force**: Physics simulation for node positioning
- **React Hooks**: State management and lifecycle
- **TypeScript**: Type safety and better development experience

## Customization

### Adding New Connection Types
1. Create analysis function in `lib/graph-utils.ts`
2. Add it to `GraphUtils.combineConnections()` call
3. Update UI controls if needed

### Modifying Physics
Edit the D3 force parameters in `graph-renderer.tsx`:
```typescript
const simulation = d3.forceSimulation(nodes)
  .force('charge', d3.forceManyBody().strength(-40))     // Repulsion strength
  .force('link', d3.forceLink(links).distance(100))     // Link distance
  .force('center', d3.forceCenter(width / 2, height / 2)) // Centering force
```

### Styling Nodes
Modify the `drawNode` function in `graph-renderer.tsx`:
```typescript
const radius = 4 + linkCount * 2  // Size based on connections
graphic.beginFill(0x66ccff)       // Node color
graphic.drawCircle(x, y, radius)  // Shape
```

## Future Enhancements

- [ ] Node labels/tooltips
- [ ] Different node types/colors
- [ ] Link weights and styling
- [ ] Clustering algorithms
- [ ] Search and highlight
- [ ] Export functionality
- [ ] Performance optimization for large graphs

## Dependencies
- `pixi.js`: 2D rendering engine
- `d3-force`: Physics simulation
- `@types/d3-force`: TypeScript definitions