export interface Tip {
  id: string
  title: string
  icon: React.ComponentType<{ className?: string }>
  content: React.ReactNode
  category: 'obsidian-links' | 'editor' | 'general' | 'navigation'
}

export const TIPS: Tip[] = [
  {
    id: 'obsidian-links-basics',
    title: 'Obsidian-Style Links',
    icon: ({ className }) => (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    ),
    category: 'obsidian-links',
    content: (
      <div className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-sm">
            <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">Ctrl</kbd>
            <span>+</span>
            <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">Click</kbd>
            <span className="text-muted-foreground">Navigate to linked note</span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm">
            <div className="w-12 flex justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
            <span className="text-muted-foreground">Click to edit the link</span>
          </div>
        </div>

        <div className="border-t pt-4 space-y-3">
          <h4 className="font-medium text-sm">Syntax:</h4>
          
          <div className="space-y-2 text-sm">
            <div>
              <p className="text-muted-foreground mb-1">Link to another note:</p>
              <code className="px-2 py-1 bg-muted rounded text-xs font-mono">[[Note Title]]</code>
            </div>
            
            <div>
              <p className="text-muted-foreground mb-1">Link with custom display text:</p>
              <code className="px-2 py-1 bg-muted rounded text-xs font-mono">[[Note Title|Custom Text]]</code>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'editor-shortcuts',
    title: 'Editor Shortcuts',
    icon: ({ className }) => (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
    category: 'editor',
    content: (
      <div className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-sm">
            <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">Ctrl</kbd>
            <span>+</span>
            <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">S</kbd>
            <span className="text-muted-foreground">Save note immediately</span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm">
            <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">Ctrl</kbd>
            <span>+</span>
            <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">B</kbd>
            <span className="text-muted-foreground">Bold text</span>
          </div>

          <div className="flex items-center space-x-2 text-sm">
            <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">Ctrl</kbd>
            <span>+</span>
            <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">I</kbd>
            <span className="text-muted-foreground">Italic text</span>
          </div>

          <div className="flex items-center space-x-2 text-sm">
            <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">Ctrl</kbd>
            <span>+</span>
            <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">Z</kbd>
            <span className="text-muted-foreground">Undo</span>
          </div>
        </div>

        <div className="border-t pt-4">
          <p className="text-sm text-muted-foreground">
            Notes auto-save every 10 seconds when you're signed in, or use Ctrl+S to save immediately.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 'graph-view',
    title: 'Graph View',
    icon: ({ className }) => (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
      </svg>
    ),
    category: 'navigation',
    content: (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          The Graph View shows the connections between your notes based on Obsidian-style links.
        </p>

        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-sm">
            <div className="w-3 h-3 rounded-full bg-primary"></div>
            <span className="text-muted-foreground">Connected notes</span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm">
            <div className="w-3 h-3 rounded-full bg-muted-foreground"></div>
            <span className="text-muted-foreground">Isolated notes</span>
          </div>

          <div className="flex items-center space-x-2 text-sm">
            <div className="w-8 h-0.5 bg-muted-foreground"></div>
            <span className="text-muted-foreground">Link connections</span>
          </div>
        </div>

        <div className="border-t pt-4">
          <p className="text-sm text-muted-foreground">
            Click on any node to jump to that note. The graph updates automatically as you create links.
          </p>
        </div>
      </div>
    ),
  },
]

export class TipsManager {
  private static STORAGE_KEY = 'silica-notes-tips-seen'
  
  static getSeenTips(): string[] {
    if (typeof window === 'undefined') return []
    const seen = localStorage.getItem(this.STORAGE_KEY)
    return seen ? JSON.parse(seen) : []
  }
  
  static markTipAsSeen(tipId: string): void {
    if (typeof window === 'undefined') return
    const seen = this.getSeenTips()
    if (!seen.includes(tipId)) {
      seen.push(tipId)
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(seen))
    }
  }
  
  static hasSeen(tipId: string): boolean {
    return this.getSeenTips().includes(tipId)
  }
  
  static clearAllTips(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(this.STORAGE_KEY)
  }
}