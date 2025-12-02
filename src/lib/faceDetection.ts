import { pipeline, env } from '@huggingface/transformers';

// Configure transformers.js
env.allowLocalModels = false;
env.useBrowserCache = true;

let detector: any = null;

export const initFaceDetector = async () => {
  if (!detector) {
    detector = await pipeline('object-detection', 'Xenova/detr-resnet-50', {
      device: 'webgpu',
    });
  }
  return detector;
};

export interface DetectedFace {
  id: string;
  imageUrl: string;
  bbox: { x: number; y: number; width: number; height: number };
}

export const detectFacesInImage = async (imageUrl: string): Promise<DetectedFace[]> => {
  const detector = await initFaceDetector();
  
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = async () => {
      try {
        const results = await detector(img);
        
        // Filter for person detections (which includes faces)
        const faces = results
          .filter((r: any) => r.label === 'person' && r.score > 0.5)
          .map((result: any, index: number) => {
            const { box } = result;
            
            // Create a canvas to extract the face region
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return null;
            
            const padding = 20;
            const x = Math.max(0, box.xmin - padding);
            const y = Math.max(0, box.ymin - padding);
            const width = Math.min(img.width - x, box.xmax - box.xmin + padding * 2);
            const height = Math.min(img.height - y, box.ymax - box.ymin + padding * 2);
            
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, x, y, width, height, 0, 0, width, height);
            
            return {
              id: `${imageUrl}-${index}`,
              imageUrl: canvas.toDataURL('image/jpeg', 0.8),
              bbox: { x, y, width, height }
            };
          })
          .filter(Boolean);
        
        resolve(faces);
      } catch (error) {
        console.error('Error detecting faces:', error);
        resolve([]);
      }
    };
    img.onerror = () => resolve([]);
    img.src = imageUrl;
  });
};

export const processBatch = async (imageUrls: string[]): Promise<{ url: string; faces: DetectedFace[] }[]> => {
  const results = [];
  for (const url of imageUrls) {
    const faces = await detectFacesInImage(url);
    results.push({ url, faces });
  }
  return results;
};
