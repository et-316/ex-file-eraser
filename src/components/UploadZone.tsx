import { Upload } from "lucide-react";
import { useCallback } from "react";

interface UploadZoneProps {
  onFilesSelected: (files: File[]) => void;
}

export const UploadZone = ({ onFilesSelected }: UploadZoneProps) => {
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const files = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.startsWith("image/")
      );
      if (files.length > 0) {
        onFilesSelected(files);
      }
    },
    [onFilesSelected]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []).filter((file) =>
        file.type.startsWith("image/")
      );
      if (files.length > 0) {
        onFilesSelected(files);
      }
    },
    [onFilesSelected]
  );

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className="relative w-full max-w-2xl mx-auto"
    >
      <label
        htmlFor="file-upload"
        className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-primary/40 rounded-3xl cursor-pointer bg-gradient-to-br from-primary/5 to-secondary/5 hover:from-primary/10 hover:to-secondary/10 transition-all duration-300 hover:border-primary/60 group"
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4">
          <Upload className="w-12 h-12 mb-4 text-primary group-hover:scale-110 transition-transform duration-300" />
          <p className="mb-2 text-lg font-medium text-foreground">
            <span className="font-bold">Click to upload</span> or drag and drop
          </p>
          <p className="text-sm text-muted-foreground">
            Upload photos to get started
          </p>
        </div>
        <input
          id="file-upload"
          type="file"
          className="hidden"
          multiple
          accept="image/*"
          onChange={handleFileInput}
        />
      </label>
    </div>
  );
};
