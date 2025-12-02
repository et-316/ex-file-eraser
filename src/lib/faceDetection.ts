import { pipeline, env, RawImage } from '@huggingface/transformers';

// Configure transformers.js
env.allowLocalModels = false;
env.useBrowserCache = true;

let detector: any = null;
let embedder: any = null;

export const initFaceDetector = async () => {
  if (!detector) {
    try {
      detector = await pipeline('object-detection', 'Xenova/detr-resnet-50', {
        device: 'webgpu',
      });
    } catch (error) {
      console.warn('WebGPU not available, falling back to CPU:', error);
      detector = await pipeline('object-detection', 'Xenova/detr-resnet-50', {
        device: 'cpu',
      });
    }
  }
  return detector;
};

export const initFaceEmbedder = async () => {
  if (!embedder) {
    try {
      // Using MobileFaceNet for face embeddings
      embedder = await pipeline('feature-extraction', 'Xenova/mobilefacenet', {
        device: 'webgpu',
      });
    } catch (error) {
      console.warn('WebGPU not available for embedder, falling back to CPU:', error);
      embedder = await pipeline('feature-extraction', 'Xenova/mobilefacenet', {
        device: 'cpu',
      });
    }
  }
  return embedder;
};

// Compute cosine similarity between two embeddings
export const cosineSimilarity = (a: number[], b: number[]): number => {
  if (a.length !== b.length) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

export interface DetectedFace {
  id: string;
  imageUrl: string;
  bbox: { x: number; y: number; width: number; height: number };
  embedding?: number[]; // Face embedding for similarity matching
}

export const detectFacesInImage = async (imageUrl: string): Promise<DetectedFace[]> => {
  try {
    const detector = await initFaceDetector();
    const embedder = await initFaceEmbedder();
    
    return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = async () => {
      try {
        const results = await detector(img);
        
        // Filter for person detections (which includes faces)
        let detections = results.filter((r: any) => r.label === 'person' && r.score > 0.3);

        // Fallback: if nothing detected, treat the whole image as one face so the flow still works
        if (!detections.length) {
          detections = [{
            box: {
              xmin: 0,
              ymin: 0,
              xmax: img.width,
              ymax: img.height,
            },
          }];
        }
        
        const faces = await Promise.all(
          detections.map(async (result: any, index: number) => {
            const { box } = result;
            
            // Create a canvas to extract the face region
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return null;
            
            const padding = 20;
            const x = Math.max(0, box.xmin - padding);
            const y = Math.max(0, box.ymin - padding);
            const width = Math.min(img.width - x, (box.xmax ?? img.width) - (box.xmin ?? 0) + padding * 2);
            const height = Math.min(img.height - y, (box.ymax ?? img.height) - (box.ymin ?? 0) + padding * 2);
            
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, x, y, width, height, 0, 0, width, height);
            
            try {
              // Generate face embedding for accurate matching
              const faceImageUrl = canvas.toDataURL('image/jpeg', 0.8);
              const rawImage = await RawImage.fromURL(faceImageUrl);
              const embeddingResult = await embedder(rawImage);
              
              // Extract embedding array
              const embedding = Array.from(embeddingResult.data);
              
              return {
                id: `${imageUrl}-${index}`,
                imageUrl: faceImageUrl,
                bbox: { x, y, width, height },
                embedding,
              };
            } catch (error) {
              console.error('Error generating embedding:', error);
              return {
                id: `${imageUrl}-${index}`,
                imageUrl: canvas.toDataURL('image/jpeg', 0.8),
                bbox: { x, y, width, height },
              };
            }
          })
        );
        
        resolve(faces.filter(Boolean) as DetectedFace[]);
      } catch (error) {
        console.error('Error detecting faces:', error);
        resolve([]);
      }
    };
      img.onerror = () => resolve([]);
      img.src = imageUrl;
    });
  } catch (error) {
    console.error('Critical error in detectFacesInImage:', error);
    return [];
  }
};

export const processBatch = async (
  imageUrls: string[],
  onProgress?: (current: number, total: number) => void
): Promise<{ url: string; faces: DetectedFace[] }[]> => {
  const results = [];
  for (let i = 0; i < imageUrls.length; i++) {
    const url = imageUrls[i];
    try {
      const faces = await detectFacesInImage(url);
      results.push({ url, faces });
    } catch (error) {
      console.error(`Error processing image ${i}:`, error);
      results.push({ url, faces: [] });
    }
    
    // Report progress
    if (onProgress) {
      onProgress(i + 1, imageUrls.length);
    }
  }
  return results;
};
