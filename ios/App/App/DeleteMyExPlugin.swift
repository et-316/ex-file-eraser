import Foundation
import Capacitor
import Photos

@objc(DeleteMyExPlugin)
public class DeleteMyExPlugin: CAPPlugin {
    
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
        let fetchResult = PHAsset.fetchAssets(withLocalIdentifiers: identifiers, options: nil)
        
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
}
