import { Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Photo {
  id: string;
  url: string;
  hasEx: boolean;
}

interface PhotoGalleryProps {
  photos: Photo[];
  onDownload: () => void;
}

export const PhotoGallery = ({ photos, onDownload }: PhotoGalleryProps) => {
  const cleanPhotos = photos.filter((p) => !p.hasEx);
  const removedCount = photos.length - cleanPhotos.length;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-primary rounded-full text-primary-foreground font-semibold shadow-glow">
          <Trash2 className="w-5 h-5" />
          <span>{removedCount} photo{removedCount !== 1 ? 's' : ''} removed</span>
        </div>
        <h2 className="text-3xl font-bold">Fresh Start 🎉</h2>
        <p className="text-muted-foreground">
          Here are your cleaned photos. Download them all!
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {cleanPhotos.map((photo) => (
          <div
            key={photo.id}
            className="relative aspect-square rounded-2xl overflow-hidden shadow-soft hover:shadow-glow transition-all duration-300 hover:scale-105"
          >
            <img
              src={photo.url}
              alt="Clean photo"
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>

      {cleanPhotos.length > 0 && (
        <div className="flex justify-center pt-4">
          <Button
            onClick={onDownload}
            size="lg"
            className="bg-gradient-secondary hover:opacity-90 text-secondary-foreground font-semibold px-8 shadow-soft"
          >
            <Download className="w-5 h-5 mr-2" />
            Download All ({cleanPhotos.length})
          </Button>
        </div>
      )}

      {cleanPhotos.length === 0 && (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">
            All photos contained your ex. Time for new memories! 📸
          </p>
        </div>
      )}
    </div>
  );
};
