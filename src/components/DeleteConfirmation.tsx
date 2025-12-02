import * as React from "react";
import { AlertTriangle, Trash2, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
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

interface Photo {
  id: string;
  url: string;
  hasEx: boolean;
}

interface DeleteConfirmationProps {
  photos: Photo[];
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  mode: "delete" | "hide";
}

export const DeleteConfirmation = ({
  photos,
  open,
  onConfirm,
  onCancel,
  mode,
}: DeleteConfirmationProps) => {
  const photosToDelete = photos.filter((p) => p.hasEx);
  
  const isDeleteMode = mode === "delete";
  const icon = isDeleteMode ? Trash2 : Archive;
  const title = isDeleteMode 
    ? `Permanently Delete ${photosToDelete.length} Photo${photosToDelete.length !== 1 ? 's' : ''}?`
    : `Archive ${photosToDelete.length} Photo${photosToDelete.length !== 1 ? 's' : ''}?`;
  const description = isDeleteMode
    ? "⚠️ This action moves photos to Recently Deleted. After 30 days, they will be PERMANENTLY DELETED and cannot be recovered."
    : "These photos will be moved to your iPhone's Hidden album permanently. You can find them in the Hidden album later if needed.";

  return (
    <AlertDialog open={open} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-xl">
            <AlertTriangle className="w-6 h-6 text-destructive" />
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base font-semibold">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex-1 overflow-y-auto py-4">
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {photosToDelete.map((photo) => (
              <div
                key={photo.id}
                className="relative aspect-square rounded-lg overflow-hidden border-2 border-destructive/20"
              >
                <img
                  src={photo.url}
                  alt="Photo to delete"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-destructive/10 flex items-center justify-center">
                  {React.createElement(icon, { className: "w-6 h-6 text-destructive/60" })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel onClick={onCancel} className="sm:flex-1">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={isDeleteMode 
              ? "sm:flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              : "sm:flex-1 bg-secondary hover:bg-secondary/90 text-secondary-foreground"
            }
          >
            {isDeleteMode ? 'Delete' : 'Archive'} {photosToDelete.length} Photo{photosToDelete.length !== 1 ? 's' : ''}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
