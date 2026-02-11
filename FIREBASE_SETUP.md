# Firebase Setup Instructions

## Firebase Realtime Database Security Rules

To secure your tariff data in Firebase, you need to set up database rules. Follow these steps:

### 1. Go to Firebase Console
- Open https://console.firebase.google.com
- Select your project: **voss-taxi-e788d**

### 2. Navigate to Realtime Database Rules
- In the left sidebar, click **"Build"** → **"Realtime Database"**
- Click the **"Rules"** tab at the top

### 3. Replace the Current Rules

Copy and paste these rules:

```json
{
  "rules": {
    "tariffs": {
      ".read": true,
      ".write": false,
      "base14": {
        ".read": true,
        ".write": false,
        ".validate": "newData.hasChildren(['start', 'km0_10', 'kmOver10', 'min', 'lastUpdated', 'version'])"
      }
    }
  }
}
```

**What these rules do:**
- ✅ **Everyone can READ** tariffs (public access for all users/devices)
- ❌ **NO ONE can WRITE** directly from the web app (prevents unauthorized changes)
- The password protection in the web app is just a UI barrier
- To update tariffs, you must use Firebase Console directly

### 4. Publish the Rules
- Click **"Publish"** button to save

---

## How to Update Tariffs (Admin Guide)

Since direct writes are disabled from the web app (for security), you have 3 options:

### Option A: Use Firebase Console (Recommended)
1. Go to Firebase Console → Realtime Database → **"Data"** tab
2. Navigate to: `tariffs/base14`
3. Click "Edit" and update the values:
   - `start`: Starting price (e.g., 97)
   - `km0_10`: Price per km for 0-10km (e.g., 11.14)
   - `kmOver10`: Price per km over 10km (e.g., 21.23)
   - `min`: Price per minute (e.g., 8.42)
   - `lastUpdated`: Current timestamp in milliseconds
   - `version`: 1
4. Click "Add" or "Update"
5. **Changes sync instantly to all devices!**

### Option B: Enable Admin Write Access (Less Secure)
If you want to allow writes from the web app, change the rules to:

```json
{
  "rules": {
    "tariffs": {
      ".read": true,
      "base14": {
        ".read": true,
        ".write": true,
        ".validate": "newData.hasChildren(['start', 'km0_10', 'kmOver10', 'min', 'lastUpdated', 'version'])"
      }
    }
  }
}
```

⚠️ **Warning**: This allows anyone with the password to write to Firebase from the browser. The password is client-side and can be bypassed.

### Option C: Use Firebase Admin SDK (Most Secure)
Create a simple Node.js script with Firebase Admin SDK that requires server-side authentication.

---

## Testing Firebase Integration

### Test 1: Load Tariffs on Multiple Devices
1. Open the calculator on Device 1
2. Open the calculator on Device 2 (or incognito window)
3. Both should show the same tariffs from Firebase

### Test 2: Real-Time Sync
1. Update tariffs in Firebase Console
2. Watch both devices update automatically **without refreshing**
3. This is the real-time sync feature!

### Test 3: Offline Fallback
1. Disconnect from internet
2. The app should still work using localStorage cache
3. Reconnect - it syncs with Firebase again

---

## Current Database URL

Your Firebase Realtime Database URL:
```
https://voss-taxi-e788d-default-rtdb.europe-west1.firebasedatabase.app
```

This is automatically used in `src/firebase.js`

---

## Troubleshooting

### Error: "Permission denied"
- Check that your database rules are published
- Make sure `.read` is set to `true`

### Tariffs not syncing
- Check browser console for errors
- Verify database URL in `src/firebase.js`
- Ensure Realtime Database is enabled (not just Firestore)

### Old tariffs showing
- Clear browser cache and localStorage
- Or manually delete localStorage item: `vossTaxiTariffs`

---

## Benefits of This Setup

✅ **Real-time sync** - Changes appear instantly on all devices
✅ **Offline support** - Works without internet using localStorage
✅ **No backend needed** - Firebase handles everything
✅ **Version controlled** - Can still use git for code defaults
✅ **Fallback hierarchy**: Firebase → localStorage → Code defaults

---

## Next Steps

1. **Set up Firebase security rules** (see above)
2. **Test on multiple devices**
3. **Consider adding authentication** for admin write access
4. **Monitor Firebase usage** in console (free tier is very generous)

