# Firebase Configuration Setup

⚠️ **IMPORTANT:** Never commit `google-services.json` or `firebaseConfig.js` to version control!

## For Team Members - Quick Setup:

### Option 1: Get Files from Team Lead (Recommended for Development)

**Contact the project owner to get:**
1. `google-services.json` 
2. `firebaseConfig.js`

**Then:**
1. Place both files in the project root directory
2. Run `npm install` or `expo install`
3. Start the app with `npx expo start`

### Option 2: Download from Firebase Console (For Project Admins)

1. **Get google-services.json:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select project: **sigla-track**
   - Go to Project Settings → Your apps → Android app
   - Click "Download google-services.json"
   - Place it in the project root

2. **Create firebaseConfig.js:**
   ```bash
   # Copy the example file
   cp firebaseConfig.example.js firebaseConfig.js
   ```

3. **Get your Firebase config values:**
   - In Firebase Console → Project Settings → General
   - Scroll to "Your apps" section
   - Copy the config values OR extract from `google-services.json`:
     - `apiKey`: Found in google-services.json → client → api_key → current_key
     - `authDomain`: `[PROJECT_ID].firebaseapp.com`
     - `projectId`: Found in google-services.json → project_info → project_id
     - `storageBucket`: Found in google-services.json → project_info → storage_bucket
     - `messagingSenderId`: Found in google-services.json → project_info → project_number
     - `appId`: Found in google-services.json → client → mobilesdk_app_id

4. **Update firebaseConfig.js** with the actual values

## Verification:

After setup, run the app:
```bash
npx expo start
```

You should see "✅ Firebase Connected!" on the home screen.

## Team Access:

**To add teammates to Firebase Console:**
1. Go to Firebase Console → Project Settings → Users and permissions
2. Click "Add member"
3. Enter their email and assign role (Editor/Viewer)

---

These files are in `.gitignore` and will not be committed to git for security reasons.
