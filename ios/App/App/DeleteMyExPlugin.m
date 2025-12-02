#import <Foundation/Foundation.h>
#import <Capacitor/Capacitor.h>

CAP_PLUGIN(DeleteMyExPlugin, "DeleteMyExPlugin",
    CAP_PLUGIN_METHOD(deletePhotos, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(hidePhotos, CAPPluginReturnPromise);
)
