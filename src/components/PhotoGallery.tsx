import { Download, Archive, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Photo {
  id: string;
  url: string;
  hasEx: boolean;
}

interface PhotoGalleryProps {
  photos: Photo[];
  onDownload: () => void;
  onHide?: () => void;
  onDelete?: () => void;
}

export const PhotoGallery = ({ photos, onDownload, onHide, onDelete }: PhotoGalleryProps) => {
  const cleanPhotos = photos.filter((p) => !p.hasEx);
  const archivedPhotos = photos.filter((p) => p.hasEx);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Clean Photos Section */}
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold">Fresh Start 🎉</h2>
          <p className="text-muted-foreground">
            {cleanPhotos.length} clean photo{cleanPhotos.length !== 1 ? 's' : ''} ready to download
          </p>
        </div>

        {cleanPhotos.length > 0 ? (
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
        ) : (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">
              All photos contained your ex. Check the archive below.
            </p>
          </div>
        )}
      </div>

      {/* Archived Photos Section */}
      {archivedPhotos.length > 0 && (
        <div className="space-y-6 pt-8 border-t border-border">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-muted rounded-full text-muted-foreground font-semibold">
              <Archive className="w-5 h-5" />
              <span>{archivedPhotos.length} photo{archivedPhotos.length !== 1 ? 's' : ''} archived</span>
            </div>
            <p className="text-sm text-muted-foreground">
              These photos will be saved in a separate "archived" folder
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {archivedPhotos.map((photo) => (
              <div
                key={photo.id}
                className="relative aspect-square rounded-2xl overflow-hidden opacity-60 hover:opacity-80 transition-opacity shadow-soft"
              >
                <img
                  src={photo.url}
                  alt="Archived photo"
                  className="w-full h-full object-cover grayscale"
                />
                <div className="absolute inset-0 bg-background/20 flex items-center justify-center">
                  <Archive className="w-8 h-8 text-foreground/60" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {photos.length > 0 && (
        <div className="flex flex-col gap-4 pt-4">
          <div className="flex justify-center">
            <Button
              onClick={onDownload}
              size="lg"
              className="bg-gradient-secondary hover:opacity-90 text-secondary-foreground font-semibold px-8 shadow-soft"
            >
              <Download className="w-5 h-5 mr-2" />
              Download All ({cleanPhotos.length} clean + {archivedPhotos.length} archived)
            </Button>
          </div>

          {(onHide || onDelete) && archivedPhotos.length > 0 && (
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              {onHide && (
                <Button
                  onClick={onHide}
                  size="lg"
                  variant="secondary"
                  className="font-semibold px-8 shadow-soft"
                >
                  <Archive className="w-5 h-5 mr-2" />
                  Archive {archivedPhotos.length} (Hide Permanently)
                </Button>
              )}

              {onDelete && (
                <Button
                  onClick={onDelete}
                  size="lg"
                  variant="destructive"
                  className="font-semibold px-8 shadow-soft"
                >
                  <Trash2 className="w-5 h-5 mr-2" />
                  Delete {archivedPhotos.length} (30-Day Recovery)
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
