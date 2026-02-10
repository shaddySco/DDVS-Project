# Frontend-Backend Integration Test Guide

## Quick Start - Step by Step

### Step 1: Start the Backend

Open a terminal and run:
```powershell
cd d:\DDVS-Project\backend
php artisan serve --host 0.0.0.0 --port 8000
```

**Expected Output:**
```
Starting Laravel development server: http://0.0.0.0:8000
```

**⚠️ If this fails:**
- Missing PHP? Install from https://windows.php.net/
- Missing Laravel? Run: `composer install`
- Database issues? Run: `php artisan migrate:fresh --seed`

---

### Step 2: Start the Frontend

Open another terminal and run:
```powershell
cd d:\DDVS-Project\frontend
npm run dev
```

**Expected Output:**
```
VITE v5.x.x  ready in xx ms

➜  Local:   http://localhost:5173/
```

**⚠️ If this fails:**
- Missing Node? Install from https://nodejs.org/
- Missing dependencies? Run: `npm install`

---

### Step 3: Test Authentication Flow

1. **Open Browser**: http://localhost:5173
2. **Click Wallet Icon** (top right)
3. **Connect MetaMask**
   - Select account
   - Approve connection
4. **Dashboard Opens** if first time (profile setup)
5. **Go to Submit**: Click logo or type `/submit`

---

### Step 4: Test Form Submission

1. **Ensure You're on `/submit`** page
2. **Fill All Fields**:
   - Title: "My Test Project"
   - Category: "Web Development"
   - Description: "This is a test of the submission system" (min 10 chars)
   - Repository: "https://github.com/facebook/react" (must be valid public repo)
   - Media: (optional) Upload an image

3. **Open Browser Console** (F12 → Console tab)

4. **Click "🚀 Publish Project"**

5. **Watch Console Output**:
   ```
   Step 1: Submit Started
   Step 2: Sending to Laravel Backend...
   Step 3: Backend Success! Project ID: 123
   Step 4: Opening MetaMask for Blockchain...
   Step 5: Transaction Sent! Hash: 0x...
   Step 6: Transaction Confirmed on Blockchain!
   ```

6. **Approve MetaMask Transaction** (popup will appear)

7. **Result**: Should redirect to Dashboard with "My Projects" showing new submission

---

## Debugging Checklist

### 🔴 Blank Page at /submit

**Check 1: Authentication**
```javascript
// In browser console (F12):
localStorage.getItem('ddvs_token')  // Should return a long token string
localStorage.getItem('ddvs_wallet') // Should return wallet address (if stored)
```

**Solution**: Connect wallet first by clicking the wallet icon

---

**Check 2: Backend Running**
```javascript
// In browser console:
fetch('http://localhost:8000/api/submissions')
  .then(r => r.json())
  .then(d => console.log(d))
```

**Expected**: Array of submissions (even if empty [])
**If error**: Backend not running → `php artisan serve`

---

### 🔴 Error: "Validation Error"

**If you see validation errors like:**
```
title: Project title must be at least 3 characters long.
description: Description must be at least 10 characters long.
```

**Solutions:**
- Title: At least 3 characters
- Description: At least 10 characters
- Category: Must be one of the predefined categories
- Repository URL: Must be valid URL format (https://...)

---

### 🔴 Error: "Invalid or inaccessible GitHub repository"

**Cause**: Repository doesn't exist, is private, or URL format is wrong

**Solutions**:
- ✅ Use: `https://github.com/facebook/react` (valid public repo)
- ❌ Don't use: Private repos, deleted repos, or malformed URLs
- Test URL: Paste it in browser, should load GitHub page

---

### 🔴 Error: "User rejected the transaction in MetaMask"

**Cause**: You clicked "Cancel" or "Reject" on MetaMask popup

**Solution**: Try again and click "Confirm" on the MetaMask popup

---

### 🔴 500 Server Error

**Check Backend Logs:**
```bash
cd d:\DDVS-Project\backend
Get-Content storage/logs/laravel.log -Tail 50  # Last 50 lines
```

**Common Issues:**
- Database migration not run: `php artisan migrate`
- GitHub API token invalid: Check `config/services.php`
- File permissions: Check `storage/` folder is writable

---

### 🔴 CORS Error

**Error looks like:**
```
Access to XMLHttpRequest at 'http://localhost:8000/api/projects' 
from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Solution:**
1. Stop backend server (Ctrl+C)
2. Ensure `config/cors.php` has:
   ```php
   'allowed_origins' => ['http://localhost:5173'],
   ```
3. Restart backend: `php artisan serve`

---

## Success Indicators

### After Successful Submission:

✅ Browser console shows all 6 steps completing
✅ MetaMask popup appears for transaction approval
✅ Page redirects to Dashboard
✅ New project appears in "My Projects" tab
✅ Project shows status: "⏳ Pending" or "✓ Verified"
✅ Project appears in Community Feed (if verified)

---

## API Endpoint Testing (Without Frontend)

### Test 1: Check Backend Health
```bash
curl http://localhost:8000/api/submissions -v
```

Expected: `200 OK` with list of submissions

---

### Test 2: Test Login Endpoint
```powershell
$body = '{"wallet_address":"0x' + ('1' * 40) + '"}'
curl -X POST http://localhost:8000/api/auth/login `
  -H "Content-Type: application/json" `
  -d $body -v
```

Expected: 
```json
{
  "user": {...},
  "token": "..."
}
```

---

### Test 3: Get User Submissions (with token)
```powershell
curl http://localhost:8000/api/submissions/mine `
  -H "Authorization: Bearer YOUR_TOKEN_HERE" -v
```

Expected: `200 OK` with array of submissions

---

## File Organization Verification

```
✅ frontend/src/pages/Submit.jsx
✅ frontend/src/context/AuthContext.jsx
✅ frontend/src/lib/axios.js
✅ frontend/src/contracts/contract-address.json
✅ frontend/src/contracts/DDVSSubmissions.json

✅ backend/app/Http/Controllers/SubmissionController.php
✅ backend/app/Models/Submission.php
✅ backend/app/Services/GitHubService.php
✅ backend/routes/api.php
✅ backend/config/cors.php
✅ backend/storage/logs/laravel.log (created after first error)
```

---

## Performance Optimization Notes

**Frontend:**
- Form only submits when all validations pass
- Media preview loads asynchronously
- Only shows error message, not form during loading

**Backend:**
- GitHub validation cached per URL
- Database indexes on `user_id` and `ownership_status`
- File uploads stored in `storage/app/projects/`

---

## Key Configuration Files

**Frontend Auth**: `frontend/src/context/AuthContext.jsx`
- Manages wallet connection
- Stores token in localStorage
- Restores session on page refresh

**Backend Auth**: `backend/routes/api.php`
- Uses Sanctum middleware: `auth:sanctum`
- Bearer token in header: `Authorization: Bearer {token}`

**CORS Config**: `backend/config/cors.php`
- Allows: localhost:5173
- Credentials: enabled
- All headers allowed

---

## NextSteps

1. **Start Services**
   - Backend: `php artisan serve`
   - Frontend: `npm run dev`

2. **Connect Wallet**
   - Click wallet icon
   - Approve MetaMask

3. **Test Submission**
   - Go to `/submit`
   - Fill form
   - Submit

4. **Verify Success**
   - Check Dashboard → My Projects tab
   - Check Community feed

5. **Debug if Issues**
   - Check browser console (F12)
   - Check backend logs
   - Use curl to test API directly

---

**Last Updated**: February 10, 2026
**Status**: Ready for Integration Testing
