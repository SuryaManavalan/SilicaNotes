"use client"

import type React from "react"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Heading from "@tiptap/extension-heading"
import Placeholder from "@tiptap/extension-placeholder"
import type { Note } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Bold, Italic, List, ListOrdered, Heading1, Heading2, Heading3, Undo, Redo } from "lucide-react"
import { cn } from "@/lib/utils"

interface NoteEditorProps {
  note: Note
  updateNote: (note: Note) => void
}

export function NoteEditor({ note, updateNote }: NoteEditorProps) {
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
        updatedAt: new Date().toISOString(),
      })
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[300px]",
      },
    },
  })

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateNote({
      ...note,
      title: e.target.value,
      updatedAt: new Date().toISOString(),
    })
  }

  if (!editor) {
    return null
  }

  return (
    <div className="flex flex-col h-full p-4">
      <Input
        value={note.title}
        onChange={handleTitleChange}
        className="text-xl font-semibold border-none px-0 mb-4 focus-visible:ring-0 bg-transparent"
        placeholder="Note title"
      />

      <div className="border rounded-md mb-4">
        <div className="flex items-center p-1 border-b gap-0.5">
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
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="h-8 w-8 ml-auto"
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

