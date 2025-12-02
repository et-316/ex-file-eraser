import { Camera as CameraIcon, ImagePlus } from "lucide-react";
import { useCallback } from "react";
import { Camera } from "@capacitor/camera";
import { CameraResultType, CameraSource } from "@capacitor/camera";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

interface UploadZoneProps {
  onFilesSelected: (files: File[]) => void;
}

export const UploadZone = ({ onFilesSelected }: UploadZoneProps) => {
  const { toast } = useToast();

  const handleNativePhotoPicker = useCallback(async () => {
    try {
      const photos = await Camera.pickImages({
        quality: 90,
        limit: 0, // 0 means no limit
      });

      if (!photos.photos || photos.photos.length === 0) {
        return;
      }

      // Convert photos to File objects
      const files = await Promise.all(
        photos.photos.map(async (photo, index) => {
          const response = await fetch(photo.webPath!);
          const blob = await response.blob();
          return new File([blob], `photo-${index}.jpg`, { type: "image/jpeg" });
        })
      );

      onFilesSelected(files);
    } catch (error) {
      console.error("Error picking photos:", error);
      toast({
        title: "Error",
        description: "Failed to access photo library. Please check permissions.",
        variant: "destructive",
      });
    }
  }, [onFilesSelected, toast]);

  const handleNativeCamera = useCallback(async () => {
    try {
      const photo = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
      });

      if (!photo.webPath) {
        return;
      }

      // Convert photo to File object
      const response = await fetch(photo.webPath);
      const blob = await response.blob();
      const file = new File([blob], "camera-photo.jpg", { type: "image/jpeg" });

      onFilesSelected([file]);
    } catch (error) {
      console.error("Error taking photo:", error);
      toast({
        title: "Error",
        description: "Failed to access camera. Please check permissions.",
        variant: "destructive",
      });
    }
  }, [onFilesSelected, toast]);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="flex flex-col items-center justify-center w-full p-8 rounded-3xl bg-gradient-to-br from-primary/5 to-secondary/5 border-2 border-primary/20">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">Choose Photos</h2>
          <p className="text-muted-foreground">
            Select photos from your library or take new ones
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
          <Button
            onClick={handleNativePhotoPicker}
            size="lg"
            className="flex-1 h-32 flex-col gap-3 bg-gradient-primary hover:opacity-90 text-primary-foreground shadow-glow"
          >
            <ImagePlus className="w-10 h-10" />
            <span className="text-lg font-semibold">Photo Library</span>
          </Button>

          <Button
            onClick={handleNativeCamera}
            size="lg"
            variant="outline"
            className="flex-1 h-32 flex-col gap-3 border-primary/40 hover:bg-primary/5"
          >
            <CameraIcon className="w-10 h-10" />
            <span className="text-lg font-semibold">Take Photo</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
