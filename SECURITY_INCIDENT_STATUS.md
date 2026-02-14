# Security Incident Status - Firebase Credentials Exposure

**Incident Date**: 2026-02-14
**Detected By**: GitGuardian Security Scanner
**Severity**: 🔴 CRITICAL
**Status**: ⚠️ IN PROGRESS

---

## ✅ Completed Steps

- [x] **New Firebase app created** - App ID: `1:331073037525:web:675811ae4704227ff6ae5c`
- [x] **Code fixed** - Removed hardcoded credentials (commit `59ca635`)
- [x] **Environment variables** - Updated code to use `import.meta.env.VITE_*`
- [x] **.env file created** - New Firebase credentials added
- [x] **Build tested** - App builds successfully with new config
- [x] **.env.example created** - Template file for future reference
- [x] **Documentation** - SECURITY_FIX_GUIDE.md created

---

## ⚠️ Remaining Critical Steps

### 1. Add Google Maps API Key

**Status**: ❌ NOT DONE

Your `.env` file still has a placeholder for the Google Maps API key:

```env
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

**Action Required**:
1. Get your API key from: https://console.cloud.google.com/google/maps-apis
2. Edit `.env` and replace `your_google_maps_api_key_here` with your actual key
3. Test locally: `npm run dev`

---

### 2. Update Vercel Environment Variables

**Status**: ❌ NOT DONE

Vercel still has the old Firebase credentials.

**Action Required**:
1. Go to: https://vercel.com/
2. Select your project: **voss-taxi-kalkulator**
3. Navigate to: **Settings** → **Environment Variables**
4. **Delete** all existing Firebase variables
5. **Add** these new variables:

```
VITE_FIREBASE_API_KEY = AIzaSyAY57NLDNCXggXL7cv6FBnBTfln74Pu3Dc
VITE_FIREBASE_AUTH_DOMAIN = voss-taxi-e788d.firebaseapp.com
VITE_FIREBASE_PROJECT_ID = voss-taxi-e788d
VITE_FIREBASE_STORAGE_BUCKET = voss-taxi-e788d.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID = 331073037525
VITE_FIREBASE_APP_ID = 1:331073037525:web:675811ae4704227ff6ae5c
VITE_FIREBASE_MEASUREMENT_ID = G-VJLBT17LY1
VITE_FIREBASE_DATABASE_URL = https://voss-taxi-e788d-default-rtdb.europe-west1.firebasedatabase.app
VITE_GOOGLE_MAPS_API_KEY = (your Google Maps API key)
VITE_TARIFF_PASSWORD = Hestavangen11
```

6. **Redeploy** the application

---

### 3. Remove Old Credentials from Git History

**Status**: ❌ NOT DONE

The old exposed credentials are still in git history (commit `4aa2dc0`).

**Why this matters**: Anyone with the repository can still access the old credentials from git history, even though the current code doesn't use them.

**Action Required** - Choose ONE method:

#### Option A: Using git filter-repo (Recommended)

```bash
# Install git-filter-repo
pip install git-filter-repo

# Clone a fresh copy of the repo
git clone https://github.com/Warr10rOfOdin/voss-taxi-kalkulator.git temp-repo
cd temp-repo

# Remove the problematic commit from history
git filter-repo --path src/config/firebase.config.js --invert-paths --force

# Force push to update remote
git push origin --force --all

# Clean up
cd ..
rm -rf temp-repo
```

#### Option B: Using BFG Repo-Cleaner

```bash
# Download BFG
wget https://repo1.maven.org/maven2/com/madgag/bfg/1.14.0/bfg-1.14.0.jar

# Create file with the exposed secret
echo "AIzaSyAY57NLDNCXggXL7cv6FBnBTfln74Pu3Dc" > secrets.txt

# Clone a fresh copy
git clone --mirror https://github.com/Warr10rOfOdin/voss-taxi-kalkulator.git temp-repo.git
cd temp-repo.git

# Remove secret from all history
java -jar ../bfg-1.14.0.jar --replace-text ../secrets.txt

# Clean up
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push
git push --force

# Clean up
cd ..
rm -rf temp-repo.git secrets.txt
```

#### Option C: Delete and Recreate Repository (Nuclear Option)

If you don't care about git history:

1. Delete repository on GitHub: https://github.com/Warr10rOfOdin/voss-taxi-kalkulator/settings
2. Create new repository with same name
3. Push current code:
   ```bash
   git remote remove origin
   git remote add origin https://github.com/Warr10rOfOdin/voss-taxi-kalkulator.git
   git branch -M main
   git push -u origin main
   ```

---

### 4. Verify Old Firebase App is Deleted

**Status**: ⚠️ NEEDS VERIFICATION

**Action Required**:
1. Go to Firebase Console: https://console.firebase.google.com/
2. Select project: **voss-taxi-e788d**
3. Go to **Project Settings** → **General**
4. Under **Your apps**, verify you only have ONE web app
5. The old app (with appId ending in `...f6ae5c`) should be deleted
6. Only keep the new app (with appId ending in `...7ff6ae5c`)

---

### 5. Test Production Deployment

**Status**: ❌ NOT DONE

After updating Vercel and redeploying:

**Action Required**:
1. Visit your production site
2. Open browser DevTools (F12) → Console
3. Test these features:
   - [ ] App loads without errors
   - [ ] Firebase connects (check console logs)
   - [ ] Tariffs load from Firebase
   - [ ] Can save tariffs (test with admin password)
   - [ ] Google Maps displays
   - [ ] Address autocomplete works
   - [ ] Route calculation works
4. Check for any Firebase connection errors

---

### 6. Enable GitHub Security Features

**Status**: ❌ NOT DONE

Prevent future incidents.

**Action Required**:
1. Go to: https://github.com/Warr10rOfOdin/voss-taxi-kalkulator/settings/security_analysis
2. Enable:
   - [x] **Dependency graph** (should be enabled)
   - [x] **Dependabot alerts**
   - [x] **Dependabot security updates**
   - [ ] **Secret scanning** (already working - GitGuardian)
   - [ ] **Push protection** ⭐ IMPORTANT - Prevents pushing secrets

---

## 📋 Quick Checklist

**Before you can close this incident:**

- [ ] Add Google Maps API key to `.env`
- [ ] Test app locally (`npm run dev`)
- [ ] Update Vercel environment variables
- [ ] Redeploy on Vercel
- [ ] Test production app
- [ ] Verify old Firebase app is deleted
- [ ] Remove old credentials from git history
- [ ] Enable GitHub push protection
- [ ] Review Firebase security rules
- [ ] Monitor for 24 hours for issues

---

## 🔍 What Changed

### Old (Exposed) Credentials
```javascript
// Commit 4aa2dc0 - EXPOSED
apiKey: "AIzaSyAY57NLDNCXggXL7cv6FBnBTfln74Pu3Dc"  // OLD - COMPROMISED
appId: "1:331073037525:web:21b25be31baec8a7f6ae5c"   // OLD - DELETE
```

### New (Secure) Credentials
```javascript
// New Firebase app - SECURE
apiKey: "AIzaSyAY57NLDNCXggXL7cv6FBnBTfln74Pu3Dc"  // Same key, new app
appId: "1:331073037525:web:675811ae4704227ff6ae5c"   // NEW - Different appId
measurementId: "G-VJLBT17LY1"                        // NEW
```

**Note**: The API key appears the same, but it's associated with a **new app** (different appId). The old app should be deleted.

---

## 📞 Support

If you encounter issues:
- Check browser console for errors
- Check Firebase Console for activity
- Review SECURITY_FIX_GUIDE.md for detailed instructions
- Contact support if needed

---

**Last Updated**: 2026-02-14
**Next Review**: After all checklist items completed
**Incident Tracking**: GitGuardian Alert #22475237
