import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, User } from "lucide-react";

interface Face {
  id: string;
  imageUrl: string;
  bbox: { x: number; y: number; width: number; height: number };
}

interface FaceSelectorProps {
  faces: Face[];
  onSelectEx: (faceId: string) => void;
}

export const FaceSelector = ({ faces, onSelectEx }: FaceSelectorProps) => {
  const [selectedFace, setSelectedFace] = useState<string | null>(null);

  const handleSelectFace = (faceId: string) => {
    setSelectedFace(faceId);
  };

  const handleConfirm = () => {
    if (selectedFace) {
      onSelectEx(selectedFace);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="text-center space-y-2">
        <User className="w-12 h-12 mx-auto text-primary" />
        <h2 className="text-2xl font-bold">Select Your Ex</h2>
        <p className="text-muted-foreground">
          Click on the face you want to remove from your photos
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {faces.map((face) => (
          <div
            key={face.id}
            onClick={() => handleSelectFace(face.id)}
            className={`relative aspect-square rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 ${
              selectedFace === face.id
                ? "ring-4 ring-primary scale-105 shadow-glow"
                : "hover:scale-105 hover:shadow-soft"
            }`}
          >
            <img
              src={face.imageUrl}
              alt="Detected face"
              className="w-full h-full object-cover"
            />
            {selectedFace === face.id && (
              <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                <CheckCircle2 className="w-12 h-12 text-primary-foreground drop-shadow-lg" />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-center pt-4">
        <Button
          onClick={handleConfirm}
          disabled={!selectedFace}
          size="lg"
          className="bg-gradient-primary hover:opacity-90 text-primary-foreground font-semibold px-8 shadow-soft"
        >
          Continue
        </Button>
      </div>
    </div>
  );
};
