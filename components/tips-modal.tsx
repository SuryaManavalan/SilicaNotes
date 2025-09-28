"use client"

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, X, Lightbulb } from "lucide-react"
import { TIPS, TipsManager, type Tip } from "@/lib/tips"

interface TipsModalProps {
  isOpen: boolean
  onClose: () => void
  initialTipId?: string
}

export function TipsModal({ isOpen, onClose, initialTipId }: TipsModalProps) {
  const [currentTipIndex, setCurrentTipIndex] = useState(0)
  const [seenTips, setSeenTips] = useState<string[]>([])

  useEffect(() => {
    setSeenTips(TipsManager.getSeenTips())
  }, [isOpen])

  useEffect(() => {
    if (initialTipId) {
      const index = TIPS.findIndex(tip => tip.id === initialTipId)
      if (index !== -1) {
        setCurrentTipIndex(index)
      }
    }
  }, [initialTipId])

  const currentTip = TIPS[currentTipIndex]

  const handleNext = () => {
    setCurrentTipIndex((prev) => (prev + 1) % TIPS.length)
  }

  const handlePrevious = () => {
    setCurrentTipIndex((prev) => (prev - 1 + TIPS.length) % TIPS.length)
  }

  const handleMarkAsSeen = () => {
    TipsManager.markTipAsSeen(currentTip.id)
    setSeenTips(TipsManager.getSeenTips())
  }

  const handleClose = () => {
    // Mark current tip as seen when closing
    TipsManager.markTipAsSeen(currentTip.id)
    onClose()
  }

  if (!currentTip) return null

  const IconComponent = currentTip.icon
  const isCurrentTipSeen = seenTips.includes(currentTip.id)

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <IconComponent className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold">
                {currentTip.title}
              </DialogTitle>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {currentTip.category}
                </Badge>
                {isCurrentTipSeen && (
                  <Badge variant="secondary" className="text-xs">
                    <Lightbulb className="w-3 h-3 mr-1" />
                    Seen
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4">
          {currentTip.content}
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevious}
              disabled={TIPS.length <= 1}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNext}
              disabled={TIPS.length <= 1}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">
              {currentTipIndex + 1} of {TIPS.length}
            </span>
            {!isCurrentTipSeen && (
              <Button size="sm" onClick={handleMarkAsSeen}>
                Got it!
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}