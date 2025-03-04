import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] max-w-[95vw] rounded-lg">
        <DialogHeader>
          <DialogTitle>Profile</DialogTitle>
          <DialogDescription>
            This is a placeholder for the user profile. You can expand this component to include user details, settings,
            etc.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <p>User: John Doe</p>
          <p>Email: john@example.com</p>
          <p>Role: Admin</p>
        </div>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button onClick={onClose} className="w-full sm:w-auto">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

