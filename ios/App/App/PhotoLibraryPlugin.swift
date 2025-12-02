import Foundation
import Capacitor
import Photos

@objc(PhotoLibraryPlugin)
public class PhotoLibraryPlugin: CAPPlugin {
    
    @objc func requestPermissions(_ call: CAPPluginCall) {
        PHPhotoLibrary.requestAuthorization(for: .readWrite) { status in
            call.resolve(["granted": status == .authorized])
        }
    }
    
    @objc func getAllPhotos(_ call: CAPPluginCall) {
        let includeHidden = call.getBool("includeHidden") ?? true
        
        PHPhotoLibrary.requestAuthorization(for: .readWrite) { [weak self] status in
            guard status == .authorized else {
                call.reject("Photo library access denied")
                return
            }
            
            self?.fetchAllPhotos(includeHidden: includeHidden, call: call)
        }
    }
    
    private func fetchAllPhotos(includeHidden: Bool, call: CAPPluginCall) {
        let fetchOptions = PHFetchOptions()
        fetchOptions.sortDescriptors = [NSSortDescriptor(key: "creationDate", ascending: false)]
        if !includeHidden {
            fetchOptions.predicate = NSPredicate(format: "isHidden == NO")
        }
        
        let assets = PHAsset.fetchAssets(with: .image, options: fetchOptions)
        var photoAssets: [[String: Any]] = []
        
        let imageManager = PHImageManager.default()
        let requestOptions = PHImageRequestOptions()
        requestOptions.isSynchronous = false
        requestOptions.deliveryMode = .fastFormat
        requestOptions.resizeMode = .fast
        
        let group = DispatchGroup()
        
        // Process ALL photos in the library
        let totalCount = assets.count
        
        for i in 0..<totalCount {
            let asset = assets.object(at: i)
            group.enter()
            
            imageManager.requestImageDataAndOrientation(for: asset, options: requestOptions) { data, _, _, _ in
                if let data = data {
                    let base64 = data.base64EncodedString()
                    let photoAsset: [String: Any] = [
                        "identifier": asset.localIdentifier,
                        "uri": "data:image/jpeg;base64,\(base64)",
                        "creationDate": asset.creationDate?.timeIntervalSince1970 ?? 0,
                        "modificationDate": asset.modificationDate?.timeIntervalSince1970 ?? 0,
                        "isHidden": asset.isHidden
                    ]
                    photoAssets.append(photoAsset)
                }
                group.leave()
            }
        }
        
        group.notify(queue: .main) {
            call.resolve(["photos": photoAssets])
        }
    }
    
    @objc func hidePhotos(_ call: CAPPluginCall) {
        guard let identifiers = call.getArray("identifiers", String.self) else {
            call.reject("Must provide identifiers")
            return
        }
        
        PHPhotoLibrary.requestAuthorization(for: .readWrite) { status in
            guard status == .authorized else {
                call.reject("Photo library access denied")
                return
            }
            
            self.performHide(identifiers: identifiers, call: call)
        }
    }
    
    private func performHide(identifiers: [String], call: CAPPluginCall) {
        let assets = PHAsset.fetchAssets(withLocalIdentifiers: identifiers, options: nil)
        
        PHPhotoLibrary.shared().performChanges({
            PHAssetChangeRequest.hideAssets(assets as NSFastEnumeration)
        }) { success, error in
            if success {
                call.resolve(["success": true, "hiddenCount": assets.count])
            } else {
                call.reject("Failed to hide photos: \(error?.localizedDescription ?? "unknown error")")
            }
        }
    }
    
    @objc func deletePhotos(_ call: CAPPluginCall) {
        guard let identifiers = call.getArray("identifiers", String.self) else {
            call.reject("Must provide identifiers")
            return
        }
        
        PHPhotoLibrary.requestAuthorization(for: .readWrite) { status in
            guard status == .authorized else {
                call.reject("Photo library access denied")
                return
            }
            
            self.performDeletion(identifiers: identifiers, call: call)
        }
    }
    
    private func performDeletion(identifiers: [String], call: CAPPluginCall) {
        let assets = PHAsset.fetchAssets(withLocalIdentifiers: identifiers, options: nil)
        
        PHPhotoLibrary.shared().performChanges({
            PHAssetChangeRequest.deleteAssets(assets as NSFastEnumeration)
        }) { success, error in
            if success {
                call.resolve(["success": true, "deletedCount": assets.count])
            } else {
                call.reject("Failed to delete photos: \(error?.localizedDescription ?? "unknown error")")
            }
        }
    }
}
