import { AlertTriangle, Trash2 } from "lucide-react";
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
}

export const DeleteConfirmation = ({
  photos,
  open,
  onConfirm,
  onCancel,
}: DeleteConfirmationProps) => {
  const photosToDelete = photos.filter((p) => p.hasEx);

  return (
    <AlertDialog open={open} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-xl">
            <AlertTriangle className="w-6 h-6 text-destructive" />
            Delete {photosToDelete.length} Photo{photosToDelete.length !== 1 ? 's' : ''}?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base">
            These photos will be moved to your iPhone's "Recently Deleted" folder.
            You can recover them within 30 days.
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
                  <Trash2 className="w-6 h-6 text-destructive/60" />
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
            className="sm:flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground"
          >
            Delete {photosToDelete.length} Photo{photosToDelete.length !== 1 ? 's' : ''}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
