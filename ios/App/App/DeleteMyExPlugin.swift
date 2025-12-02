import Foundation
import Capacitor
import Photos

@objc(DeleteMyExPlugin)
public class DeleteMyExPlugin: CAPPlugin {
    
    @objc func hidePhotos(_ call: CAPPluginCall) {
        guard let photoIdentifiers = call.getArray("identifiers", String.self) else {
            call.reject("Must provide photo identifiers")
            return
        }
        
        // Request authorization
        PHPhotoLibrary.requestAuthorization(for: .readWrite) { status in
            switch status {
            case .authorized, .limited:
                self.performHide(identifiers: photoIdentifiers, call: call)
            case .denied, .restricted:
                call.reject("Photo library access denied")
            case .notDetermined:
                call.reject("Photo library access not determined")
            @unknown default:
                call.reject("Unknown authorization status")
            }
        }
    }
    
    @objc func deletePhotos(_ call: CAPPluginCall) {
        guard let photoIdentifiers = call.getArray("identifiers", String.self) else {
            call.reject("Must provide photo identifiers")
            return
        }
        
        // Request authorization
        PHPhotoLibrary.requestAuthorization(for: .readWrite) { status in
            switch status {
            case .authorized, .limited:
                self.performDeletion(identifiers: photoIdentifiers, call: call)
            case .denied, .restricted:
                call.reject("Photo library access denied")
            case .notDetermined:
                call.reject("Photo library access not determined")
            @unknown default:
                call.reject("Unknown authorization status")
            }
        }
    }
    
    private func performDeletion(identifiers: [String], call: CAPPluginCall) {
        // Fetch options that include hidden assets
        let fetchOptions = PHFetchOptions()
        fetchOptions.includeHiddenAssets = true
        
        let fetchResult = PHAsset.fetchAssets(withLocalIdentifiers: identifiers, options: fetchOptions)
        
        if fetchResult.count == 0 {
            call.reject("No photos found with provided identifiers")
            return
        }
        
        PHPhotoLibrary.shared().performChanges({
            PHAssetChangeRequest.deleteAssets(fetchResult)
        }) { success, error in
            if success {
                call.resolve([
                    "success": true,
                    "deletedCount": fetchResult.count
                ])
            } else {
                call.reject("Failed to delete photos: \(error?.localizedDescription ?? "Unknown error")")
            }
        }
    }
    
    private func performHide(identifiers: [String], call: CAPPluginCall) {
        // Fetch options that include hidden assets
        let fetchOptions = PHFetchOptions()
        fetchOptions.includeHiddenAssets = true
        
        let fetchResult = PHAsset.fetchAssets(withLocalIdentifiers: identifiers, options: fetchOptions)
        
        if fetchResult.count == 0 {
            call.reject("No photos found with provided identifiers")
            return
        }
        
        PHPhotoLibrary.shared().performChanges({
            // Hide the assets instead of deleting
            let assets = NSMutableArray()
            fetchResult.enumerateObjects { asset, _, _ in
                assets.add(asset)
            }
            PHAssetChangeRequest.hideAssets(assets as! [PHAsset])
        }) { success, error in
            if success {
                call.resolve([
                    "success": true,
                    "hiddenCount": fetchResult.count
                ])
            } else {
                call.reject("Failed to hide photos: \(error?.localizedDescription ?? "Unknown error")")
            }
        }
    }
}
