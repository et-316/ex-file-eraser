# Full Photo Library Scan Setup

The app now supports scanning your ENTIRE photo library (including hidden photos) to automatically find all photos containing your ex!

## Features
- ✅ Scans all photos in your library automatically
- ✅ Includes hidden album photos
- ✅ Detects all faces across your entire library
- ✅ Finds every photo containing the selected person
- ✅ Bulk hide or delete all matching photos

## Setup Instructions

### 1. Export to GitHub
Click the "Export to GitHub" button in Lovable to push your code.

### 2. Clone and Install
```bash
git clone <your-repo-url>
cd <your-repo>
npm install
```

### 3. Add iOS Platform
```bash
npx cap add ios
npx cap update ios
```

### 4. Build the Web App
```bash
npm run build
```

### 5. Sync to Native
```bash
npx cap sync
```

### 6. Open in Xcode
```bash
npx cap open ios
```

### 7. In Xcode
1. Select your development team in "Signing & Capabilities"
2. Connect your iPhone via USB
3. Select your device as the build target
4. Click Run (▶️) to install on your phone

## How It Works

1. **"Scan Entire Photo Library"** button appears on iOS app
2. App requests full photo library access
3. Scans up to 500 most recent photos (to avoid overwhelming device)
4. Detects all unique faces across your library
5. You select which face to remove
6. App shows ALL photos containing that person
7. Bulk hide or delete them with one tap

## Browser Fallback
On web browser, you can still manually select photos - but automatic library scanning only works in the native iOS app.

## Privacy
- All processing happens on-device
- No photos are uploaded to any server
- App only accesses photos you grant permission for
- Face detection runs locally using AI models

## Troubleshooting

**"Permission Denied"**
- Go to Settings > Privacy > Photos
- Find "Delete My Ex"
- Select "Full Access"

**"Native App Required"**
- This feature only works in the iOS app
- Use the setup instructions above to build it

**Scan takes too long**
- Limited to 500 most recent photos for performance
- Can be adjusted in `PhotoLibraryPlugin.swift` line 43
