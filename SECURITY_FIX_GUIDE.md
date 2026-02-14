# 🚨 Security Issue: Exposed Firebase Credentials

## What Happened

Firebase credentials were committed to the public repository in `src/config/firebase.config.js` (commit `4aa2dc0`). This was detected by GitGuardian security scanner.

**Risk Level**: 🔴 **CRITICAL**

Exposed credentials:
- Firebase API Key
- Firebase Project ID
- Firebase Database URL
- Other Firebase configuration

---

## Immediate Actions Required

### 1. ✅ Rotate Firebase Credentials (DO THIS FIRST!)

**You must invalidate the exposed credentials immediately:**

1. Go to **Firebase Console**: https://console.firebase.google.com/
2. Select project: **voss-taxi-e788d**
3. Click **⚙️ Project Settings** → **General** tab
4. Scroll to **Your apps** section
5. Find the web app and click **Delete app** (⋮ menu)
6. Click **➕ Add app** → **Web** (</>)
7. Register a new app with a new name (e.g., "Voss Taxi Calculator v2")
8. **Copy the new configuration** (you'll need this below)

### 2. ✅ Update Environment Variables (DONE)

I've already updated the code to use environment variables. Now you need to create a `.env` file:

```bash
# In the project root directory
cp .env.example .env
```

Then edit `.env` and paste your **NEW** Firebase configuration:

```env
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Paste NEW Firebase config here:
VITE_FIREBASE_API_KEY=your_new_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=voss-taxi-e788d.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=voss-taxi-e788d
VITE_FIREBASE_STORAGE_BUCKET=voss-taxi-e788d.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_new_sender_id
VITE_FIREBASE_APP_ID=your_new_app_id
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_FIREBASE_DATABASE_URL=https://voss-taxi-e788d-default-rtdb.europe-west1.firebasedatabase.app

VITE_TARIFF_PASSWORD=Hestavangen11
```

**IMPORTANT**: Never commit `.env` to git! It's already in `.gitignore`.

### 3. ✅ Remove Secret from Git History

The exposed credentials are still in git history. You need to remove them:

#### Option A: Using git filter-repo (Recommended)

```bash
# Install git-filter-repo
pip install git-filter-repo

# Remove the file from entire history
git filter-repo --path src/config/firebase.config.js --invert-paths --force

# Force push to update remote
git push origin --force --all
```

#### Option B: Using BFG Repo-Cleaner (Alternative)

```bash
# Download BFG
wget https://repo1.maven.org/maven2/com/madgag/bfg/1.14.0/bfg-1.14.0.jar

# Create a file with the exposed secret
echo "AIzaSyAY57NLDNCXggXL7cv6FBnBTfln74Pu3Dc" > secrets.txt

# Remove secret from history
java -jar bfg-1.14.0.jar --replace-text secrets.txt

# Clean up
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push
git push origin --force --all
```

#### Option C: Delete and Recreate Repository (Easiest but drastic)

If the repository doesn't have important history:

1. Delete the repository on GitHub
2. Create a new repository with the same name
3. Push only the fixed code (current state)

### 4. ✅ Update Vercel Environment Variables

If you're using Vercel for deployment:

1. Go to Vercel Dashboard: https://vercel.com/
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Delete all old Firebase variables
5. Add new variables with **NEW** credentials:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_FIREBASE_MEASUREMENT_ID`
   - `VITE_FIREBASE_DATABASE_URL`
   - `VITE_GOOGLE_MAPS_API_KEY`
   - `VITE_TARIFF_PASSWORD`
6. Redeploy the application

---

## What I Fixed in the Code

### Changes Made:

1. ✅ **Updated `src/config/firebase.config.js`**:
   - Removed hardcoded credentials
   - Now uses `import.meta.env.VITE_*` environment variables
   - Added security documentation

2. ✅ **Created `.env.example`**:
   - Template file with placeholder values
   - Safe to commit to git
   - Instructions for setup

3. ✅ **Verified `.gitignore`**:
   - Already includes `.env` (good!)
   - Prevents future accidents

### Files Modified:
- `src/config/firebase.config.js` - Now uses env vars
- `.env.example` - New file (template)
- `SECURITY_FIX_GUIDE.md` - This file

---

## How to Test After Fixing

1. Create `.env` file with new credentials
2. Run `npm run dev`
3. Check browser console - should connect to Firebase
4. Test tariff loading
5. Test tariff saving
6. Verify no errors

---

## Preventing Future Incidents

### ✅ Best Practices:

1. **Never hardcode credentials** in source code
2. **Always use environment variables** for sensitive data
3. **Use `.env` files** for local development
4. **Add `.env` to `.gitignore`** (already done)
5. **Create `.env.example`** with placeholders (done)
6. **Use different credentials** for dev/staging/production
7. **Rotate credentials** if exposed
8. **Enable secret scanning** (GitHub → Settings → Security)

### ✅ GitHub Security Features:

Enable these in your repository:

1. **Settings** → **Security** → **Code security and analysis**
2. Enable:
   - ✅ **Dependency graph**
   - ✅ **Dependabot alerts**
   - ✅ **Dependabot security updates**
   - ✅ **Secret scanning** (already enabled - GitGuardian)
   - ✅ **Push protection** (prevents commits with secrets)

### ✅ Pre-commit Hook (Optional):

Install a pre-commit hook to catch secrets before committing:

```bash
# Install pre-commit
npm install --save-dev @commitlint/cli husky

# Install git-secrets
brew install git-secrets  # macOS
# OR
apt-get install git-secrets  # Linux

# Configure
git secrets --register-aws --global
git secrets --install
```

---

## Firebase Security Rules

After rotating credentials, also review your Firebase security rules:

```json
{
  "rules": {
    "tariffs": {
      ".read": true,
      "base14": {
        ".write": "auth != null",  // Require authentication
        ".validate": "newData.hasChildren(['start', 'km0_10', 'kmOver10', 'min'])"
      }
    }
  }
}
```

**Current issue**: Your Firebase allows **public writes** (`.write: true`). Anyone can modify tariffs!

**Recommendation**: Implement Firebase Authentication and restrict writes to authenticated admins only.

---

## Checklist

Before closing this incident:

- [ ] Rotated Firebase credentials (deleted old app, created new)
- [ ] Created `.env` file with new credentials
- [ ] Tested app locally (connects to Firebase)
- [ ] Removed secret from git history (using filter-repo or BFG)
- [ ] Force pushed cleaned history to GitHub
- [ ] Updated Vercel environment variables
- [ ] Redeployed application
- [ ] Enabled GitHub push protection
- [ ] Reviewed Firebase security rules
- [ ] Tested production app
- [ ] Monitored for unauthorized access

---

## Resources

- **Firebase Security**: https://firebase.google.com/docs/rules
- **Git Filter Repo**: https://github.com/newren/git-filter-repo
- **BFG Repo Cleaner**: https://rtyley.github.io/bfg-repo-cleaner/
- **GitHub Secret Scanning**: https://docs.github.com/en/code-security/secret-scanning
- **OWASP Secrets Management**: https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html

---

## Support

If you need help with this security incident:

1. Check Firebase Console for suspicious activity
2. Review Firebase Realtime Database activity logs
3. Monitor for unauthorized tariff changes
4. Contact me if you see anything suspicious

---

**Fixed by**: Claude
**Date**: 2026-02-14
**Severity**: CRITICAL
**Status**: Code fixed, credentials need rotation
