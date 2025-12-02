import Foundation
import Capacitor
import Photos

@objc(PhotoLibraryPlugin)
public class PhotoLibraryPlugin: CAPPlugin {
    
    @objc public func requestPermissions(_ call: CAPPluginCall) {
        PHPhotoLibrary.requestAuthorization(for: .readWrite) { status in
            call.resolve(["granted": status == .authorized])
        }
    }
    
    @objc public func getAllPhotos(_ call: CAPPluginCall) {
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
        
        // Smart filtering: exclude screenshots and very old photos
        var predicates: [NSPredicate] = []
        if !includeHidden {
            predicates.append(NSPredicate(format: "isHidden == NO"))
        }
        // Exclude screenshots
        predicates.append(NSPredicate(format: "(pixelWidth / pixelHeight) < 3 AND (pixelHeight / pixelWidth) < 3"))
        // Only photos from last 3 years
        let threeYearsAgo = Date().addingTimeInterval(-3 * 365 * 24 * 60 * 60)
        predicates.append(NSPredicate(format: "creationDate > %@", threeYearsAgo as NSDate))
        
        fetchOptions.predicate = NSCompoundPredicate(andPredicateWithSubpredicates: predicates)
        
        let assets = PHAsset.fetchAssets(with: .image, options: fetchOptions)
        var photoAssets: [[String: Any]] = []
        let photoAssetsLock = NSLock()
        
        let imageManager = PHImageManager.default()
        let requestOptions = PHImageRequestOptions()
        requestOptions.isSynchronous = false
        requestOptions.deliveryMode = .highQualityFormat
        requestOptions.resizeMode = .fast
        requestOptions.isNetworkAccessAllowed = true
        
        // Downsample to 1024px max dimension for faster processing
        let targetSize = CGSize(width: 1024, height: 1024)
        
        let group = DispatchGroup()
        let totalCount = assets.count
        let batchSize = 10 // Process 10 photos in parallel
        
        // Process in batches for parallel execution
        for batchStart in stride(from: 0, to: totalCount, by: batchSize) {
            let batchEnd = min(batchStart + batchSize, totalCount)
            
            for i in batchStart..<batchEnd {
                let asset = assets.object(at: i)
                group.enter()
                
                // Use requestImage instead of requestImageData for automatic downsampling
                imageManager.requestImage(for: asset, targetSize: targetSize, contentMode: .aspectFit, options: requestOptions) { image, _ in
                    if let image = image, let data = image.jpegData(compressionQuality: 0.8) {
                        let base64 = data.base64EncodedString()
                        let photoAsset: [String: Any] = [
                            "identifier": asset.localIdentifier,
                            "uri": "data:image/jpeg;base64,\(base64)",
                            "creationDate": asset.creationDate?.timeIntervalSince1970 ?? 0,
                            "modificationDate": asset.modificationDate?.timeIntervalSince1970 ?? 0,
                            "isHidden": asset.isHidden
                        ]
                        
                        photoAssetsLock.lock()
                        photoAssets.append(photoAsset)
                        photoAssetsLock.unlock()
                    }
                    group.leave()
                }
            }
            
            // Wait for each batch to complete before starting next (prevents memory issues)
            group.wait()
        }
        
        // Sort by creation date descending
        let sortedPhotos = photoAssets.sorted { 
            let date1 = $0["creationDate"] as? TimeInterval ?? 0
            let date2 = $1["creationDate"] as? TimeInterval ?? 0
            return date1 > date2
        }
        
        call.resolve(["photos": sortedPhotos])
    }
    
    @objc public func hidePhotos(_ call: CAPPluginCall) {
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
        let fetchOptions = PHFetchOptions()
        fetchOptions.includeHiddenAssets = true
        let assets = PHAsset.fetchAssets(withLocalIdentifiers: identifiers, options: fetchOptions)
        
        if assets.count == 0 {
            call.reject("No photos found with provided identifiers")
            return
        }
        
        PHPhotoLibrary.shared().performChanges({
            // Hide each asset individually by setting isHidden property
            assets.enumerateObjects { asset, _, _ in
                let request = PHAssetChangeRequest(for: asset)
                request.isHidden = true
            }
        }) { success, error in
            if success {
                call.resolve(["success": true, "hiddenCount": assets.count])
            } else {
                call.reject("Failed to hide photos: \(error?.localizedDescription ?? "unknown error")")
            }
        }
    }
    
    @objc public func deletePhotos(_ call: CAPPluginCall) {
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
