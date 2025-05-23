
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserPlus } from 'lucide-react';

interface SignupDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SignupDialog({ isOpen, onClose }: SignupDialogProps) {
  const handleSignup = (event: React.FormEvent) => {
    event.preventDefault();
    // Placeholder for actual signup logic
    console.log('Signup attempt');
    onClose(); // Close dialog after "signup"
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus size={24} /> Create Account
          </DialogTitle>
          <DialogDescription>
            Join PackSmart to save your travel plans and packing lists.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSignup}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email-signup" className="text-right">
                Email
              </Label>
              <Input id="email-signup" type="email" placeholder="you@example.com" className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password-signup" className="text-right">
                Password
              </Label>
              <Input id="password-signup" type="password" className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="confirm-password-signup" className="text-right">
                Confirm
              </Label>
              <Input id="confirm-password-signup" type="password" placeholder="Confirm password" className="col-span-3" required />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">
              <UserPlus className="mr-2 h-4 w-4" /> Sign Up
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
