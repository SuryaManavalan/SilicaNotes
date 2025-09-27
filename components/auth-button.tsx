"use client"

import { signIn, signOut, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Github, LogOut } from "lucide-react"

export function AuthButton() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return <Button variant="ghost" disabled>Loading...</Button>
  }

  if (session) {
    return (
      <div className="flex items-center gap-2">
        <Avatar className="h-8 w-8">
          <AvatarImage src={session.user?.image || ""} alt={session.user?.name || ""} />
          <AvatarFallback>
            {session.user?.name?.charAt(0) || "U"}
          </AvatarFallback>
        </Avatar>
        <span className="text-sm font-medium">{session.user?.name}</span>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => signOut()}
          className="ml-2"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <Button 
      onClick={() => signIn('github')}
      variant="outline"
      size="sm"
    >
      <Github className="h-4 w-4 mr-2" />
      Sign in with GitHub
    </Button>
  )
}