import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'

export interface ObsidianLinkSimpleOptions {
  onNavigate?: (noteTitle: string) => void
}

export const ObsidianLinkSimple = Extension.create<ObsidianLinkSimpleOptions>({
  name: 'obsidianLinkSimple',

  addOptions() {
    return {
      onNavigate: undefined,
    }
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('obsidian-link-decoration'),
        state: {
          init() {
            return DecorationSet.empty
          },
          apply(tr, decorationSet) {
            // Map existing decorations through the transaction
            decorationSet = decorationSet.map(tr.mapping, tr.doc)
            
            // Only recalculate if document or selection changed
            if (tr.docChanged || tr.selectionSet) {
              const decorations: Decoration[] = []
              const doc = tr.doc
              const selection = tr.selection
              const cursorPos = selection.from

              // Find all [[text]] patterns and decorate them
              doc.descendants((node, pos) => {
                if (node.isText && node.text) {
                  const regex = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g
                  let match

                  while ((match = regex.exec(node.text)) !== null) {
                    const from = pos + match.index
                    const to = from + match[0].length
                    const noteTitle = match[1].trim()
                    const displayText = match[2]?.trim() || noteTitle

                    // Check if cursor is near this link (within 3 characters)
                    const cursorNear = cursorPos >= from - 3 && cursorPos <= to + 3
                    
                    if (cursorNear) {
                      // Show full syntax when cursor is near - editing state
                      decorations.push(
                        Decoration.inline(from, to, {
                          class: 'obsidian-link-badge obsidian-link-editing',
                          'data-note-title': noteTitle,
                          'data-display-text': displayText,
                        })
                      )
                    } else {
                      // Show as clean badge when cursor is away
                      decorations.push(
                        Decoration.inline(from, to, {
                          class: 'obsidian-link-badge obsidian-link-collapsed',
                          'data-note-title': noteTitle,
                          'data-display-text': displayText,
                        })
                      )
                    }
                  }
                }
              })

              return DecorationSet.create(doc, decorations)
            }
            
            return decorationSet
          }
        },
        props: {
          decorations(state) {
            return this.getState(state)
          },

          handleClick: (view, pos, event) => {
            // Check if clicked on obsidian link badge
            const target = event.target as HTMLElement
            if (target && target.classList.contains('obsidian-link-badge')) {
              const noteTitle = target.getAttribute('data-note-title')
              
              if (noteTitle && (event.ctrlKey || event.metaKey)) {
                event.preventDefault()
                console.log('🔗 Obsidian link clicked:', noteTitle)
                
                // Dispatch navigation event
                const navEvent = new CustomEvent('obsidian-link-navigate', {
                  detail: { noteTitle },
                  bubbles: true
                })
                window.dispatchEvent(navEvent)
                return true
              } else if (noteTitle) {
                // Regular click without Ctrl/Cmd - show tip if not seen
                const tipSeenKey = 'silica-notes-tips-seen'
                const seenTips = JSON.parse(localStorage.getItem(tipSeenKey) || '[]')
                
                if (!seenTips.includes('obsidian-links-basics')) {
                  // Dispatch event to show tip
                  const tipEvent = new CustomEvent('show-obsidian-tip', {
                    detail: { tipId: 'obsidian-links-basics' },
                    bubbles: true
                  })
                  window.dispatchEvent(tipEvent)
                  return true
                }
              }
            }
            
            return false
          },
        },
      }),
    ]
  },
})