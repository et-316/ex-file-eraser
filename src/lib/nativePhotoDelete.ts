import { registerPlugin } from '@capacitor/core';

export interface DeleteMyExPlugin {
  deletePhotos(options: { identifiers: string[] }): Promise<{ success: boolean; deletedCount: number }>;
  hidePhotos(options: { identifiers: string[] }): Promise<{ success: boolean; hiddenCount: number }>;
}

const DeleteMyEx = registerPlugin<DeleteMyExPlugin>('DeleteMyExPlugin');

export default DeleteMyEx;
