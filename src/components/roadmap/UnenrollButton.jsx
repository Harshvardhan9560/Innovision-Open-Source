"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function UnenrollButton({ roadmapId }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleUnenroll = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/roadmap/${roadmapId}/unenroll`, {
        method: "DELETE"
      });

      if (res.ok) {
        toast.success("Successfully unenrolled from course");
        router.push("/courses");
      } else {
        toast.error("Failed to unenroll");
      }
    } catch (error) {
      toast.error("Failed to unenroll");
    }
    setIsDeleting(false);
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Trash2 className="h-4 w-4 mr-2" />
          Unenroll
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Unenroll from Course?</AlertDialogTitle>
          <AlertDialogDescription>
            This will remove this course from your roadmap. All progress will be lost. You can re-enroll later if needed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleUnenroll}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Unenrolling..." : "Unenroll"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
