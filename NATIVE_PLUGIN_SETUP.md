# Native iOS Photo Deletion Plugin Setup

This guide explains how to set up the custom native iOS plugin for deleting photos from the Photo Library.

## What Was Created

1. **Swift Plugin Files** (`ios/App/App/`)
   - `DeleteMyExPlugin.swift` - Main plugin logic using PHPhotoLibrary
   - `DeleteMyExPlugin.m` - Objective-C bridge for Capacitor
   - `Info.plist` - iOS permissions configuration

2. **TypeScript Interface** (`src/lib/nativePhotoDelete.ts`)
   - Type-safe interface for calling the plugin from your app

3. **Updated App Code**
   - Modified to track iOS asset IDs when photos are selected
   - Integrated native deletion functionality

## Setup Instructions

After you **git pull** your project from GitHub:

### 1. Initial Setup (if not done yet)
```bash
npm install
npx cap add ios
npx cap update ios
npm run build
npx cap sync
```

### 2. Open in Xcode
```bash
npx cap open ios
```

### 3. Add the Plugin Files to Xcode

In Xcode:
1. Right-click on the "App" folder in the project navigator
2. Select "Add Files to App..."
3. Navigate to `ios/App/App/`
4. Select both `DeleteMyExPlugin.swift` and `DeleteMyExPlugin.m`
5. Make sure "Copy items if needed" is checked
6. Click "Add"

### 4. Configure Swift Bridging (if prompted)
- If Xcode asks to create a bridging header, click "Create Bridging Header"
- This enables Swift and Objective-C interoperability

### 5. Verify Permissions
The plugin requires Photo Library permissions. These are configured in:
- `Info.plist` - Contains permission descriptions
- `capacitor.config.ts` - Capacitor camera configuration

### 6. Build and Run
1. Select your target device or simulator
2. Click the Run button (▶️) or press `Cmd + R`
3. When you select photos and confirm deletion, they'll move to "Recently Deleted"

## How It Works

1. **Photo Selection**: When users select photos from their library, the app now captures iOS asset identifiers
2. **Face Detection**: AI processes photos to identify faces
3. **Marking**: User selects which face(s) to remove
4. **Confirmation**: Shows preview of photos to be deleted
5. **Native Deletion**: Uses `PHPhotoLibrary.shared().performChanges()` to move photos to "Recently Deleted"

## iOS Photo Library Behavior

- Deleted photos move to "Recently Deleted" folder
- Users have 30 days to recover deleted photos
- After 30 days, iOS permanently deletes them
- This matches native iOS Photos app behavior

## Troubleshooting

### "Module not found" error
Run `npx cap sync` to ensure all native code is updated

### Permission denied
Check that Info.plist contains the photo library usage descriptions

### Swift compilation errors
Ensure the bridging header was created correctly when adding Swift files

### Asset IDs not captured
Only photos selected from Photo Library have asset IDs. Photos taken with camera cannot be deleted from the library (they're not in it yet).

## Future Development

After initial setup, when you make changes:
```bash
npm run build
npx cap sync
```

Then rebuild in Xcode.
