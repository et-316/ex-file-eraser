import { useState } from "react";
import { UploadZone } from "@/components/UploadZone";
import { FaceSelector } from "@/components/FaceSelector";
import { PhotoGallery } from "@/components/PhotoGallery";
import { DeleteConfirmation } from "@/components/DeleteConfirmation";
import { Button } from "@/components/ui/button";
import { Heart, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { detectFacesInImage, processBatch, DetectedFace, cosineSimilarity } from "@/lib/faceDetection";
import DeleteMyEx from "@/lib/nativePhotoDelete";
import JSZip from "jszip";
import { Progress } from "@/components/ui/progress";

type Step = "upload" | "select" | "results";

interface Photo {
  id: string;
  url: string;
  hasEx: boolean;
  assetId?: string; // iOS photo library asset identifier
}

interface ProcessingProgress {
  current: number;
  total: number;
  stage: "detecting" | "filtering";
}

const Index = () => {
  const [step, setStep] = useState<Step>("upload");
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [faces, setFaces] = useState<DetectedFace[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<ProcessingProgress | null>(null);
  const [selectedExId, setSelectedExId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showHideConfirm, setShowHideConfirm] = useState(false);
  const { toast } = useToast();

  const handleFilesSelected = async (photosWithAssetIds: { file: File; assetId?: string }[]) => {
    setLoading(true);
    setProgress({ current: 0, total: photosWithAssetIds.length, stage: "detecting" });
    
    toast({
      title: "Processing images...",
      description: "Detecting faces in your photos",
    });

    try {
      // Convert files to URLs
      const imageUrls = await Promise.all(
        photosWithAssetIds.map(({ file }) => {
          return new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.readAsDataURL(file);
          });
        })
      );

      // Store photos with asset IDs
      const photoData = imageUrls.map((url, idx) => ({
        id: `photo-${idx}`,
        url,
        hasEx: false,
        assetId: photosWithAssetIds[idx].assetId,
      }));
      setPhotos(photoData);

      // Detect faces in all images with progress tracking
      const results = await processBatch(imageUrls, (current, total) => {
        setProgress({ current, total, stage: "detecting" });
      });
      const allFaces = results.flatMap((r) => r.faces);

      // Remove duplicates using embedding similarity if available
      const uniqueFaces = allFaces.filter((face, index, self) => 
        index === self.findIndex((f) => {
          if (face.embedding && f.embedding) {
            // Use cosine similarity for deduplication
            const similarity = cosineSimilarity(face.embedding, f.embedding);
            return similarity > 0.8; // Higher threshold for deduplication
          } else {
            // Fallback to bbox comparison
            const isSimilar = 
              Math.abs(f.bbox.x - face.bbox.x) < 50 &&
              Math.abs(f.bbox.y - face.bbox.y) < 50 &&
              Math.abs(f.bbox.width - face.bbox.width) < 50;
            return isSimilar;
          }
        })
      );

      setFaces(uniqueFaces);
      setStep("select");
      
      toast({
        title: "Faces detected!",
        description: `Found ${uniqueFaces.length} unique face${uniqueFaces.length !== 1 ? 's' : ''}`,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to process images. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setProgress(null);
    }
  };

  const handleSelectEx = async (faceId: string) => {
    setLoading(true);
    setProgress({ current: 0, total: photos.length, stage: "filtering" });
    setSelectedExId(faceId);

    toast({
      title: "Filtering photos...",
      description: "Removing your ex from your memories",
    });

    try {
      // Find the selected face
      const selectedFace = faces.find((f) => f.id === faceId);
      if (!selectedFace) return;

      // Re-detect faces in each photo with progress tracking
      const results = await processBatch(photos.map((p) => p.url), (current, total) => {
        setProgress({ current, total, stage: "filtering" });
      });
      
      const updatedPhotos = photos.map((photo, idx) => {
        const photoFaces = results[idx].faces;
        
        // Use embedding similarity if available, otherwise fall back to bbox comparison
        const hasEx = photoFaces.some((face) => {
          if (selectedFace.embedding && face.embedding) {
            // Use cosine similarity for accurate face matching
            const similarity = cosineSimilarity(selectedFace.embedding, face.embedding);
            // Threshold of 0.6 works well for face matching
            return similarity > 0.6;
          } else {
            // Fallback to bounding box comparison
            return (
              Math.abs(face.bbox.width - selectedFace.bbox.width) < 100 &&
              Math.abs(face.bbox.height - selectedFace.bbox.height) < 100
            );
          }
        });
        return { ...photo, hasEx };
      });

      setPhotos(updatedPhotos);
      setStep("results");
      
      const removedCount = updatedPhotos.filter((p) => p.hasEx).length;
      toast({
        title: "Done!",
        description: `Removed ${removedCount} photo${removedCount !== 1 ? 's' : ''} ✨`,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to filter photos. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setProgress(null);
    }
  };

  const handleDownload = async () => {
    const cleanPhotos = photos.filter((p) => !p.hasEx);
    const archivedPhotos = photos.filter((p) => p.hasEx);
    
    if (photos.length === 0) return;

    try {
      const zip = new JSZip();
      
      // Add clean photos to "clean" folder
      for (let i = 0; i < cleanPhotos.length; i++) {
        const photo = cleanPhotos[i];
        const response = await fetch(photo.url);
        const blob = await response.blob();
        zip.file(`clean/photo-${i + 1}.jpg`, blob);
      }

      // Add archived photos to "archived" folder
      for (let i = 0; i < archivedPhotos.length; i++) {
        const photo = archivedPhotos[i];
        const response = await fetch(photo.url);
        const blob = await response.blob();
        zip.file(`archived/photo-${i + 1}.jpg`, blob);
      }

      // Generate zip and download
      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = url;
      a.download = "delete-my-ex-photos.zip";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Downloaded!",
        description: `${cleanPhotos.length} clean + ${archivedPhotos.length} archived photos`,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to download photos",
        variant: "destructive",
      });
    }
  };

  const handleReset = () => {
    setStep("upload");
    setPhotos([]);
    setFaces([]);
    setSelectedExId(null);
  };

  const handleHidePhotos = () => {
    setShowHideConfirm(true);
  };

  const handleDeletePhotos = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmHide = async () => {
    setShowHideConfirm(false);
    setLoading(true);
    
    try {
      const photosToHide = photos.filter((p) => p.hasEx && p.assetId);
      const assetIds = photosToHide.map((p) => p.assetId!);
      
      if (assetIds.length === 0) {
        toast({
          title: "Cannot Hide",
          description: "Photos were not loaded from your library, so they cannot be hidden. Please select photos from your Photo Library.",
          variant: "destructive",
        });
        return;
      }

      const result = await DeleteMyEx.hidePhotos({ identifiers: assetIds });
      
      if (result.success) {
        toast({
          title: "Photos Archived!",
          description: `Successfully moved ${result.hiddenCount} photo${result.hiddenCount !== 1 ? 's' : ''} to your Hidden album`,
        });
        
        // Update photos state to remove hidden ones
        setPhotos(photos.filter((p) => !p.hasEx));
      }
    } catch (error) {
      console.error("Hide error:", error);
      toast({
        title: "Archive Failed",
        description: error instanceof Error ? error.message : "Failed to hide photos. Please check permissions.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    setShowDeleteConfirm(false);
    setLoading(true);
    
    try {
      const photosToDelete = photos.filter((p) => p.hasEx && p.assetId);
      const assetIds = photosToDelete.map((p) => p.assetId!);
      
      if (assetIds.length === 0) {
        toast({
          title: "Cannot Delete",
          description: "Photos were not loaded from your library, so they cannot be deleted. Please select photos from your Photo Library.",
          variant: "destructive",
        });
        return;
      }

      const result = await DeleteMyEx.deletePhotos({ identifiers: assetIds });
      
      if (result.success) {
        toast({
          title: "Photos Deleted!",
          description: `Successfully moved ${result.deletedCount} photo${result.deletedCount !== 1 ? 's' : ''} to Recently Deleted`,
        });
        
        // Update photos state to remove deleted ones
        setPhotos(photos.filter((p) => !p.hasEx));
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast({
        title: "Delete Failed",
        description: error instanceof Error ? error.message : "Failed to delete photos. Please check permissions.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      {/* Header */}
      <div className="text-center mb-12 animate-fade-in">
        <div className="inline-flex items-center gap-2 mb-4">
          <Heart className="w-8 h-8 text-primary" />
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-hero bg-clip-text text-transparent">
            Delete My Ex
          </h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          Use AI to remove your ex from your photo library. Fresh start, new memories.
        </p>
      </div>

      {/* Loading Overlay with Progress */}
      {loading && progress && (
        <div className="fixed inset-0 bg-background/95 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="text-center space-y-6 max-w-md w-full px-6">
            <Loader2 className="w-16 h-16 animate-spin text-primary mx-auto" />
            
            <div className="space-y-2">
              <p className="text-xl font-semibold">
                {progress.stage === "detecting" ? "Detecting Faces" : "Filtering Photos"}
              </p>
              <p className="text-sm text-muted-foreground">
                Processing {progress.current} of {progress.total} photos...
              </p>
            </div>

            <div className="space-y-2">
              <Progress 
                value={(progress.current / progress.total) * 100} 
                className="h-3"
              />
              <p className="text-xs text-muted-foreground">
                {Math.round((progress.current / progress.total) * 100)}% complete
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Simple Loading Overlay (fallback) */}
      {loading && !progress && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="text-center space-y-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
            <p className="text-lg font-medium">Processing...</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container max-w-7xl mx-auto">
        {step === "upload" && <UploadZone onFilesSelected={handleFilesSelected} />}
        
        {step === "select" && (
          <FaceSelector faces={faces} onSelectEx={handleSelectEx} />
        )}
        
        {step === "results" && (
          <>
            <PhotoGallery 
              photos={photos} 
              onDownload={handleDownload}
              onHide={handleHidePhotos}
              onDelete={handleDeletePhotos}
            />
            <DeleteConfirmation
              photos={photos}
              open={showDeleteConfirm}
              onConfirm={handleConfirmDelete}
              onCancel={() => setShowDeleteConfirm(false)}
              mode="delete"
            />
            <DeleteConfirmation
              photos={photos}
              open={showHideConfirm}
              onConfirm={handleConfirmHide}
              onCancel={() => setShowHideConfirm(false)}
              mode="hide"
            />
          </>
        )}
      </div>

      {/* Footer */}
      {step === "results" && (
        <div className="text-center mt-12">
          <Button
            onClick={handleReset}
            variant="outline"
            className="border-primary/40 hover:bg-primary/5"
          >
            Start Over
          </Button>
        </div>
      )}
    </div>
  );
};

export default Index;
