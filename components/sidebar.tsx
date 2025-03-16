"use client"

import { useState, useEffect } from "react"
import type { Note } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, Plus, Menu, Edit3, GitBranch, Trash2, Filter, ArrowLeft, Trash, CalendarArrowDown, CalendarArrowUp, ArrowDownAZ, ArrowUpAZ } from "lucide-react"
import { cn } from "@/lib/utils"
import { format, isValid } from "date-fns"
import { ThemeToggle } from "./theme-toggle"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { useTheme } from "next-themes"
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"

interface SidebarProps {
  notes: Note[]
  selectedNoteId: string
  onSelectNote: (id: string) => void
  activeView: string
  onChangeView: (view: string) => void
  isLoading: boolean
  onCreateNote: () => void
  onDeleteNote: (id: string) => void
}

export function Sidebar({ notes, selectedNoteId, onSelectNote, activeView, onChangeView, isLoading, onCreateNote, onDeleteNote }: SidebarProps) {

  const [searchQuery, setSearchQuery] = useState("")
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null)
  const [activeInput, setActiveInput] = useState<"search" | "filter" | null>(null)
  const [showDeleteIcons, setShowDeleteIcons] = useState(false)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | "alphaAsc" | "alphaDesc">("asc")

  const { theme } = useTheme()

  const logoSrc = theme === "dark" ? "/logo_dark.png" : "/logo_light.png"

  // Check if we're on mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    // Initial check
    checkIfMobile()

    // Add event listener
    window.addEventListener("resize", checkIfMobile)

    // Cleanup
    return () => window.removeEventListener("resize", checkIfMobile)
  }, [])

  const filteredNotes = notes
    .filter((note) => note.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortOrder === "asc") {
        return new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()
      } else if (sortOrder === "desc") {
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      } else if (sortOrder === "alphaAsc") {
        return a.title.localeCompare(b.title)
      } else {
        return b.title.localeCompare(a.title)
      }
    })

  const handleDeleteNote = (id: string) => {
    setNoteToDelete(id)
    setIsDeleteModalOpen(true)
  }

  const confirmDeleteNote = () => {
    if (noteToDelete) {
      onDeleteNote(noteToDelete)
      setNoteToDelete(null)
      setIsDeleteModalOpen(false)
    }
  }

  const handleIconClick = (inputType: "search" | "filter") => {
    setActiveInput(activeInput === inputType ? null : inputType)
  }

  // Sidebar content
  const sidebarContent = (
    <>
      <div className="p-2 flex items-center justify-between border-b">
        <div className="flex items-center">
          <img src={logoSrc} alt="Logo" className="h-8 w-8 mr-2" />
          <h2 className="font-semibold text-xl">Silica Notes</h2>
        </div>
      </div>

      <div className="p-2 border-b flex items-center justify-around">
        {activeInput === null ? (
          <>
            <Button variant="ghost" size="icon" onClick={() => handleIconClick("search")}>
              <Search className="h-4 w-4 text-muted-foreground" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => handleIconClick("filter")}>
              <Filter className="h-4 w-4 text-muted-foreground" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowDeleteIcons(!showDeleteIcons)}
              className={cn(showDeleteIcons && "bg-accent text-accent-foreground")}
            >
              <Trash className="h-4 w-4 text-muted-foreground" />
            </Button>
          </>
        ) : (
          <Button variant="ghost" size="icon" onClick={() => setActiveInput(null)}>
            <ArrowLeft className="h-4 w-4 text-muted-foreground" />
          </Button>
        )}
        {activeInput === "search" && (
          <div className="relative flex-1 ml-2">
            <Input
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
              autoFocus={false}
            />
          </div>
        )}
        {activeInput === "filter" && (
          <div className="relative flex-1 ml-2 flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                if (sortOrder === "asc") setSortOrder("desc")
                else if (sortOrder === "desc") setSortOrder("alphaAsc")
                else if (sortOrder === "alphaAsc") setSortOrder("alphaDesc")
                else setSortOrder("asc")
              }}
            >
              {sortOrder === "asc" ? (
                <CalendarArrowDown className="h-4 w-4 text-muted-foreground" />
              ) : sortOrder === "desc" ? (
                <CalendarArrowUp className="h-4 w-4 text-muted-foreground" />
              ) : sortOrder === "alphaAsc" ? (
                <ArrowDownAZ className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ArrowUpAZ className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
            <span className="ml-2 text-sm text-muted-foreground">
              {sortOrder === "asc" ? "Oldest First" : sortOrder === "desc" ? "Newest First" : sortOrder === "alphaAsc" ? "A-Z" : "Z-A"}
            </span>
          </div>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {isLoading ? (
            // Show skeleton placeholders when loading
            <div className="space-y-8">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              ))}
            </div>
          ) : (
            filteredNotes.map((note) => (
              <div key={note.id} className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start text-left font-normal h-auto py-3",
                    selectedNoteId === note.id && "bg-accent text-accent-foreground",
                  )}
                  onClick={() => {
                    onSelectNote(note.id)
                    if (isMobile) setIsMobileMenuOpen(false)
                  }}
                >
                  <div className="flex flex-col w-full gap-1 overflow-hidden">
                    <div className="font-medium truncate">{note.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {isValid(new Date(note.updated_at)) ? format(new Date(note.updated_at), "MMM d, yyyy") : "Invalid date"}
                    </div>
                  </div>
                </Button>
                {showDeleteIcons && (
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteNote(note.id)} className="group hover:bg-transparent">
                    <Trash2 className="h-4 w-4 text-muted-foreground group-hover:text-red-500" />
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      <div className="p-2 border-t">
        <Button className="w-full" size="sm" onClick={onCreateNote}>
          <Plus className="h-4 w-4 mr-2" />
          New Note
        </Button>
      </div>
    </>
  )

  return (
    <>
      {/* Desktop sidebar */}
      {!isMobile && (
        <div className="flex h-screen">
          {/* Always visible sidebar */}
          <div className="border-r bg-muted/40 flex flex-col items-center py-2 w-12">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="mb-4"
            >
              <Menu className="h-4 w-4" />
              <span className="sr-only">Toggle Sidebar</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onChangeView("editor")}
              className={cn(activeView === "editor" && "bg-accent")}
            >
              <Edit3 className="h-4 w-4" />
              <span className="sr-only">Editor View</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onChangeView("graph")}
              className={cn(activeView === "graph" && "bg-accent")}
            >
              <GitBranch className="h-4 w-4" />
              <span className="sr-only">Graph View</span>
            </Button>
            <div className="mt-auto">
              <ThemeToggle />
            </div>
          </div>

          {/* Collapsible sidebar content */}
          <div
            className={cn(
              "border-r bg-muted/40 flex flex-col transition-all duration-300",
              isSidebarCollapsed ? "w-0 opacity-0 overflow-hidden" : "w-72 opacity-100",
            )}
          >
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Mobile sidebar */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 z-50 w-full border-t bg-background md:hidden">
          <div className="flex items-center justify-around h-16">
            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="h-5 w-5" />
              <span className="sr-only">Menu</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onChangeView("editor")}
              className={cn(activeView === "editor" && "bg-accent")}
            >
              <Edit3 className="h-5 w-5" />
              <span className="sr-only">Editor View</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onChangeView("graph")}
              className={cn(activeView === "graph" && "bg-accent")}
            >
              <GitBranch className="h-5 w-5" />
              <span className="sr-only">Graph View</span>
            </Button>
            <ThemeToggle />
          </div>
        </div>
      )}

      {/* Mobile sidebar sheet */}
      <Sheet open={isMobileMenuOpen && isMobile} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-[80%] sm:max-w-sm" >
          <div className="flex flex-col h-full">{sidebarContent}</div>
        </SheetContent>
      </Sheet>

      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this note? This action cannot be undone.
          </DialogDescription>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDeleteNote}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

