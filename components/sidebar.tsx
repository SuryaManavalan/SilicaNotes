"use client"

import { useState, useEffect } from "react"
import type { Note } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, Plus, Menu, Edit3, GitBranch } from "lucide-react"
import { cn } from "@/lib/utils"
import { format, isValid } from "date-fns"
import { ThemeToggle } from "./theme-toggle"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { useTheme } from "next-themes"

interface SidebarProps {
  notes: Note[]
  selectedNoteId: string
  onSelectNote: (id: string) => void
  activeView: string
  onChangeView: (view: string) => void
  isLoading: boolean
  onCreateNote: () => void
}

export function Sidebar({ notes, selectedNoteId, onSelectNote, activeView, onChangeView, isLoading, onCreateNote }: SidebarProps) {

  const [searchQuery, setSearchQuery] = useState("")
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

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

  const filteredNotes = notes.filter((note) => note.title.toLowerCase().includes(searchQuery.toLowerCase()))

  // Sidebar content
  const sidebarContent = (
    <>
      <div className="p-2 flex items-center justify-between border-b">
        <div className="flex items-center">
          <img src={logoSrc} alt="Logo" className="h-8 w-8 mr-2" />
          <h2 className="font-semibold text-xl">Silica Notes</h2>
        </div>
      </div>

      <div className="p-2 border-b">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
            autoFocus={false}
          />
        </div>
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
          <Button
            key={note.id}
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
    </>
  )
}

