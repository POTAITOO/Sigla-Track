# Android Development Setup

This project requires Android SDK to run on Android devices/emulators.

## Prerequisites

1. **Install Android Studio**: Download from https://developer.android.com/studio
   - Install with default settings
   - Make sure to install Android SDK, Android SDK Platform, and Android Virtual Device

2. **Install Node.js**: Download from https://nodejs.org/
   - Recommended: LTS version (18.x or higher)
   - Includes npm and npx automatically

3. **Install Expo CLI** (Optional but recommended):
   ```bash
   npm install -g @expo/cli
   ```

4. **Expo Go Requirements**:
   - **For Emulator**: Expo Go will be automatically downloaded and installed when you run `npx expo start --android`
   - **For Physical Device**: Download Expo Go from Google Play Store
   - **Network**: Both development machine and device/emulator must be on same network

5. **Set up Environment Variables**:

   ### For Windows (Git Bash/VS Code Terminal):
   
   Add these lines to your `~/.bash_profile` (for Git Bash) and `~/.bashrc` (for VS Code terminal):
   
   ```bash
   # Android SDK configuration
   export ANDROID_HOME="/c/Users/YOUR_USERNAME/AppData/Local/Android/Sdk"
   export PATH="$PATH:/c/Users/YOUR_USERNAME/AppData/Local/Android/Sdk/platform-tools:/c/Users/YOUR_USERNAME/AppData/Local/Android/Sdk/tools:/c/Users/YOUR_USERNAME/AppData/Local/Android/Sdk/tools/bin"
   ```
   
   **Replace `YOUR_USERNAME` with your actual Windows username**

6. **Reload your terminal** or run:
   ```bash
   source ~/.bash_profile
   source ~/.bashrc
   ```

7. **Verify installation**:
   ```bash
   adb --version
   node --version
   npm --version
   npx --version
   ```

## Running the Android App

### Method 1: Using Expo Development Server (Recommended)
1. **Start the Expo development server**:
   ```bash
   npx expo start
   ```

2. **Open in Android emulator**:
   - Press `a` in the terminal to automatically open in Android emulator
   - OR run directly: `npx expo start --android`

3. **What happens**:
   - Expo Go app will be automatically downloaded and installed on the emulator (first time only)
   - Your app will load in the Expo Go app
   - Hot reloading enabled - changes appear instantly

### Method 2: Development Build
```bash
npx expo run:android
```
This creates a native Android build with your app embedded.

### Requirements for Android Studio

If you want to use Android Studio directly:

1. **Create Android Virtual Device (AVD)**:
   - Open Android Studio → Tools → AVD Manager
   - Create a new virtual device (recommended: Pixel 6 with API 34+)
   - Start the emulator

2. **Expo Go App Installation**:
   - **Automatic (Recommended)**: When you run `npx expo start --android`, Expo Go will be automatically downloaded and installed on the emulator
   - **Manual**: Open Google Play Store in emulator → Search "Expo Go" → Install
   - **First Launch**: May take 30-60 seconds to download (~50MB)
   
3. **Expo Go Requirements**:
   - **Minimum Android**: API 21 (Android 5.0) or higher
   - **Internet Connection**: Required for downloading and running development builds
   - **Storage**: ~100MB free space for Expo Go and cache

4. **Network Configuration**:
   - Ensure the emulator can access your development machine's network
   - **Default**: Uses local network (192.168.x.x)
   - **Tunnel mode**: If connection issues occur, try: `npx expo start --tunnel`
   - **Localhost**: Web version available at `http://localhost:8081`

## Troubleshooting

### Common Issues:

**Android SDK Issues:**
- If you get "adb command not found", make sure the environment variables are set correctly
- If Android SDK path is not found, verify Android Studio installed the SDK in the default location
- Close and reopen your terminal after adding environment variables

**Expo App Issues:**
- **App not showing content**: Wait for Expo Go to download and install completely (first time only)
- **Connection refused**: Try `npx expo start --tunnel` for network issues
- **Blank screen**: Check if emulator has internet connection
- **Package version warnings**: Update packages with `npm install expo@latest`

**Emulator Issues:**
- **Emulator won't start**: Check if virtualization is enabled in BIOS
- **Slow performance**: Allocate more RAM to AVD (4GB+ recommended)
- **Screen positioning**: Drag emulator window or use Ctrl+Up/Down to resize

## Alternative Setup Methods

### Option 1: System Environment Variables (Windows)
1. Open System Properties → Advanced → Environment Variables
2. Add `ANDROID_HOME` pointing to your Android SDK directory
3. Add Android SDK tools to your PATH

### Option 2: Use Android Studio's built-in terminal
Android Studio's terminal comes with Android SDK tools pre-configured.