# Profile Image Upload Setup Guide

## Installation Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Link Native Modules (if needed)
```bash
cd android
./gradlew clean
cd ..
```

### 3. Permissions Added
The following permissions have been added to `AndroidManifest.xml`:
- `CAMERA` - For taking photos with camera
- `READ_EXTERNAL_STORAGE` - For accessing gallery
- `WRITE_EXTERNAL_STORAGE` - For saving images
- `READ_MEDIA_IMAGES` - For Android 13+ gallery access

### 4. Rebuild the App
```bash
npm run android
```

Or use your build script:
```bash
.\build-installable-apk.bat
```

## Features Implemented

### Profile Image Upload
- ✅ Camera capture
- ✅ Gallery selection
- ✅ Image preview in modal
- ✅ Image stored as base64 in database
- ✅ Displays in profile screen
- ✅ Auto-resizes to 500x500px
- ✅ Quality compression (0.7)

### How It Works
1. User opens Profile screen
2. Clicks "Personal Information"
3. In edit modal, taps on profile image
4. Alert shows "Camera" or "Gallery" options
5. User selects image source
6. Image is displayed in preview
7. User clicks "Save"
8. Image is saved to database as base64 string
9. Image appears in profile screen

### Image Storage
- Images are converted to base64 and stored in the `users` table
- `profile_image` column stores the full data URI
- Format: `data:image/jpeg;base64,{base64_string}`

## Package Added
- `react-native-image-picker` v7.1.2

## Troubleshooting

### Camera Not Opening
- Check if CAMERA permission is granted in app settings
- Try reinstalling the app after running `./gradlew clean`

### Gallery Not Opening
- Check if storage permissions are granted
- On Android 13+, make sure READ_MEDIA_IMAGES permission is granted

### Image Not Displaying
- Check console logs for errors
- Verify base64 data is being saved to database
- Check if image data URI starts with `data:image/`

## Notes
- Images are optimized to 500x500px for performance
- Base64 storage works well for small profile images
- For production, consider using cloud storage (Firebase, AWS S3) for larger files

