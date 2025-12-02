#import <Capacitor/Capacitor.h>

CAP_PLUGIN(PhotoLibraryPlugin, "PhotoLibraryPlugin",
    CAP_PLUGIN_METHOD(requestPhotoPermissions, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(getAllPhotos, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(hidePhotos, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(deletePhotos, CAPPluginReturnPromise);
)
