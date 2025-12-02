import { registerPlugin } from '@capacitor/core';

export interface PhotoAsset {
  identifier: string;
  uri: string;
  creationDate?: string;
  modificationDate?: string;
  isHidden?: boolean;
}

export interface PhotoLibraryPlugin {
  requestPermissions(): Promise<{ granted: boolean }>;
  getAllPhotos(options?: { includeHidden?: boolean }): Promise<{ photos: PhotoAsset[] }>;
  deletePhotos(options: { identifiers: string[] }): Promise<{ success: boolean; deletedCount: number }>;
  hidePhotos(options: { identifiers: string[] }): Promise<{ success: boolean; hiddenCount: number }>;
}

const PhotoLibrary = registerPlugin<PhotoLibraryPlugin>('PhotoLibraryPlugin');

export default PhotoLibrary;
