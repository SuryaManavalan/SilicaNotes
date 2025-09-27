"use client"

import type React from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Heading from "@tiptap/extension-heading"
import Placeholder from "@tiptap/extension-placeholder"
import type { Note } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Bold, Italic, List, ListOrdered, Heading1, Heading2, Heading3, Undo, Redo, MoreHorizontal, Save } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Loader2 } from "lucide-react"

interface NoteEditorProps {
  note: Note
  updateNote: (note: Note) => void
  saving: boolean
  isAuthenticated: boolean
  onSave?: () => void
}

export function NoteEditor({ note, updateNote, saving, isAuthenticated, onSave }: NoteEditorProps) {
  const [isMobile, setIsMobile] = useState(false)

  // Check if we're on mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 640)
    }

    // Initial check
    checkIfMobile()

    // Add event listener
    window.addEventListener("resize", checkIfMobile)

    // Cleanup
    return () => window.removeEventListener("resize", checkIfMobile)
  }, [])

  // Add keyboard shortcut for manual save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        if (onSave && isAuthenticated) {
          onSave()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onSave, isAuthenticated])

  const editor = useEditor({
    extensions: [
      StarterKit,
      Heading.configure({
        levels: [1, 2, 3],
      }),
      Placeholder.configure({
        placeholder: "Start writing...",
      }),
    ],
    content: note.content,
    onUpdate: ({ editor }) => {
      updateNote({
        ...note,
        content: editor.getHTML(),
        updated_at: new Date().toISOString(),
      })
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[300px]",
      },
    },
  })

  // Update editor content when note changes (but not during typing)
  useEffect(() => {
    if (editor && note.content !== undefined) {
      const currentContent = editor.getHTML()
      // Only update if the content is significantly different (not just minor formatting)
      if (currentContent !== note.content && !editor.isFocused) {
        editor.commands.setContent(note.content)
      }
    }
  }, [note.id, editor]) // Only trigger when note ID changes (switching notes)

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateNote({
      ...note,
      title: e.target.value,
      updated_at: new Date().toISOString(),
    })
  }

  if (!editor) {
    return null
  }

  // Mobile formatting options in dropdown
  const mobileFormattingMenu = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">More formatting options</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
          <Heading1 className="h-4 w-4 mr-2" />
          <span>Heading 1</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          <Heading2 className="h-4 w-4 mr-2" />
          <span>Heading 2</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
          <Heading3 className="h-4 w-4 mr-2" />
          <span>Heading 3</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List className="h-4 w-4 mr-2" />
          <span>Bullet List</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered className="h-4 w-4 mr-2" />
          <span>Ordered List</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  return (
    <div className="flex flex-col h-full p-2 md:p-4">
      <Input
        value={note.title}
        onChange={handleTitleChange}
        className="text-xl font-semibold border-none px-0 mb-4 focus-visible:ring-0 bg-transparent"
        placeholder="Note title"
      />

      <div className="rounded-md mb-4">
        <div className="flex items-center p-1 border-b gap-0.5 flex-wrap">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={cn("h-8 w-8", editor.isActive("bold") && "bg-accent")}
          >
            <Bold className="h-4 w-4" />
            <span className="sr-only">Bold</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={cn("h-8 w-8", editor.isActive("italic") && "bg-accent")}
          >
            <Italic className="h-4 w-4" />
            <span className="sr-only">Italic</span>
          </Button>

          {/* Show more options on desktop */}
          {!isMobile && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={cn("h-8 w-8", editor.isActive("heading", { level: 1 }) && "bg-accent")}
              >
                <Heading1 className="h-4 w-4" />
                <span className="sr-only">Heading 1</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={cn("h-8 w-8", editor.isActive("heading", { level: 2 }) && "bg-accent")}
              >
                <Heading2 className="h-4 w-4" />
                <span className="sr-only">Heading 2</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                className={cn("h-8 w-8", editor.isActive("heading", { level: 3 }) && "bg-accent")}
              >
                <Heading3 className="h-4 w-4" />
                <span className="sr-only">Heading 3</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={cn("h-8 w-8", editor.isActive("bulletList") && "bg-accent")}
              >
                <List className="h-4 w-4" />
                <span className="sr-only">Bullet List</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={cn("h-8 w-8", editor.isActive("orderedList") && "bg-accent")}
              >
                <ListOrdered className="h-4 w-4" />
                <span className="sr-only">Ordered List</span>
              </Button>
            </>
          )}

          {/* Show dropdown menu on mobile */}
          {isMobile && (
            <>
              {mobileFormattingMenu}
            </>
          )}

          {/* Manual save button and status */}
          {isAuthenticated && onSave && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onSave}
              disabled={saving}
              className="h-8 w-8 ml-auto"
              title="Save now (Ctrl+S)"
            >
              {saving ? <Loader2 className="animate-spin w-4 h-4" /> : <Save className="h-4 w-4" />}
              <span className="sr-only">Save</span>
            </Button>
          )}

          {/* Show saving status on mobile */}
          {isMobile && (
            <div className="flex items-center space-x-1 text-gray-500 text-xs">
              {!isAuthenticated ? (
                <span className="text-amber-600">Preview</span>
              ) : saving ? (
                <>
                  <Loader2 className="animate-spin w-3 h-3" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Saved</span>
              )}
            </div>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="h-8 w-8"
          >
            <Undo className="h-4 w-4" />
            <span className="sr-only">Undo</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="h-8 w-8"
          >
            <Redo className="h-4 w-4" />
            <span className="sr-only">Redo</span>
          </Button>
        </div>
        <EditorContent editor={editor} className="p-4" />
      </div>
    </div>
  )
}

