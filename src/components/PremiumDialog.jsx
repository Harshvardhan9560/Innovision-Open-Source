"use client";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Crown } from "lucide-react";

export default function PremiumDialog({ open, onOpenChange, feature = "this feature" }) {
  const router = useRouter();

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-600" />
            Premium Feature Required
          </AlertDialogTitle>
          <AlertDialogDescription>
            {feature} is only available for Premium users. Upgrade now for just ₹100/month to unlock unlimited access to all features!
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => router.push("/premium")}
            className="bg-yellow-500 hover:bg-yellow-600 text-black"
          >
            Upgrade to Premium
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
