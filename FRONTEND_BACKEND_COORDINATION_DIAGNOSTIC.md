# Frontend-Backend Submission Coordination - Diagnostic Report

## Current Issue
The Submit page at `localhost:5173/submit` shows a blank screen when accessed.

## Root Cause Analysis

### Expected Behavior
The Submit page should:
1. Check if user is authenticated (token in localStorage AND walletAddress)
2. If NOT authenticated → Show "Access Restricted" message
3. If authenticated → Show submission form

### Actual Behavior
- Blank/dark page (unclear if Access Restricted message is being shown)
- Suggests authentication or context loading issue

## Coordination Checklist

### ✅ Backend API Routes (VERIFIED)
```php
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/projects', [SubmissionController::class, 'store']);
    Route::post('/projects/{id}/verify', [SubmissionController::class, 'verify']);
    Route::get('/submissions/mine', [SubmissionController::class, 'mySubmissions']);
});
```
- **Status**: Properly configured
- **Auth Method**: Sanctum bearer token
- **CORS**: Configured for localhost:5173

### ✅ Backend Validation (VERIFIED)
```php
$request->validate([
    'title' => 'required|string|min:3|max:255',
    'category' => 'required|string|in:Machine Learning,...',
    'description' => 'required|string|min:10',
    'repository_url' => 'required|url',
    'media' => 'nullable|file|max:51200'
])
```
- **Status**: Detailed validation rules in place
- **Error Messages**: Custom messages configured
- **File Upload**: Media handling implemented

### ✅ Frontend Authentication (VERIFIED)
- **Token Storage**: `localStorage.getItem('ddvs_token')`
- **Header Setup**: Axios interceptor adds `Authorization: Bearer {token}`
- **Session Restore**: AuthContext restores session on page refresh
- **Wallet Integration**: MetaMask connection through ethers.js

### ✅ Frontend Form Handling (VERIFIED)
- **State Management**: Form state + loading/error states
- **Error Display**: Multi-line error messages with formatting
- **File Preview**: Image/video preview functionality
- **Validation**: Client-side checks before submission

## Potential Issues & Solutions

### Issue 1: Authentication Not Persisting
**Symptom**: Page shows blank even after connecting wallet

**Check:**
1. Open browser DevTools → Application → LocalStorage
2. Verify `ddvs_token` exists
3. Check if `walletAddress` is set in AuthContext

**Solution:**
```javascript
// In browser console, check:
console.log('Token:', localStorage.getItem('ddvs_token'));
console.log('Page URL:', window.location.href);
```

### Issue 2: Wallet Connection Failed
**Symptom**: User connected wallet but still see "Access Restricted"

**Check:**
1. Verify MetaMask is installed
2. Check if network is correct (should be on local test network)
3. Verify backend `/auth/login` endpoint works

**Manual Test:**
```bash
# In backend directory
cd backend
php artisan serve --host 0.0.0.0 --port 8000
```

### Issue 3: CORS Issues
**Symptom**: API requests fail with CORS errors

**Check:**
- Backend CORS config allows `http://localhost:5173`
- Requests include proper headers
- 'Content-Type': 'multipart/form-data' for file uploads

**Current Config:**
```php
'allowed_origins' => ['http://localhost:5173'],
'allowed_headers' => ['*'],
'supports_credentials' => true,
```

### Issue 4: Contract Address Not Loaded
**Symptom**: Frontend can't find contract address

**Check:**
```javascript
// In browser console:
import contractAddresses from './contracts/contract-address.json'
console.log('Contract:', contractAddresses.DDVSSubmissions);
```

**Required Files:**
- `frontend/src/contracts/contract-address.json`
- `frontend/src/contracts/DDVSSubmissions.json`

## Testing Workflow

### 1. Backend Health Check
```bash
# Test if backend is running
curl http://localhost:8000/api/submissions

# Should return 401 (needs auth) or list of submissions
```

### 2. Authentication Test
```bash
# Test login endpoint
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"wallet_address": "0x123..."}'

# Should return:
# { "user": {...}, "token": "..." }
```

### 3. Submission Test
```bash
# Create test submission with token
curl -X POST http://localhost:8000/api/projects \
  -H "Authorization: Bearer {token}" \
  -F "title=Test" \
  -F "category=Web Development" \
  -F "description=Test description" \
  -F "repository_url=https://github.com/test/repo"

# Should return: 201 with submission ID
```

### 4. Frontend Submit Test
1. Open browser DevTools (F12)
2. Go to Console tab
3. Connect wallet
4. Navigate to `/submit`
5. Fill form and submit
6. Watch console for logs:
   - "Step 1: Submit Started" → Form submitted
   - "Step 2: Sending to Laravel Backend..." → Request sent
   - "Step 3: Backend Success! Project ID: X" → Success
   - "Step 4: Opening MetaMask..." → MetaMask popup
   - Error messages if something fails

## Common Error Messages & Solutions

### Error: "Authentication required. Please connect your wallet first."
- **Cause**: `ddvs_token` not in localStorage or AuthContext not loaded
- **Solution**: Click wallet icon in navbar to connect

### Error: "Validation Error: Repository URL may be invalid or private"
- **Cause**: GitHub repo doesn't exist or is private
- **Solution**: Use a valid public GitHub repository

### Error: "User rejected the transaction in MetaMask"
- **Cause**: User cancelled the MetaMask popup
- **Solution**: Retry and approve the MetaMask transaction

### Error: "Server error. Please try again later." (500)
- **Cause**: Backend error (check logs)
- **Solution**: Check `backend/storage/logs/laravel.log`

## Backend Logs Location
```
backend/storage/logs/laravel.log
```

Check for:
- Validation errors
- Database connection issues
- GitHub API errors
- File upload issues

## Data Flow Verification

```
User Submits Form
    ↓
Frontend validates
    ↓
Submit.jsx → axios.post('/projects', formData)
    ↓
Backend receives request
    ↓
SubmissionController.store() validates
    ↓
GitHubService validates repository
    ↓
Submission model created
    ↓
Response: { id, status, project }
    ↓
Frontend receives ID
    ↓
ethers.js opens MetaMask
    ↓
User signs transaction
    ↓
axios.post('/projects/{id}/verify', { tx_hash })
    ↓
Backend updates submission.ownership_status = 'verified'
    ↓
Redirect to Dashboard
    ↓
Dashboard fetches /submissions/mine
    ↓
New submission appears in "My Projects" tab
```

## Quick Debugging Steps

1. **Check Backend Running**
   ```bash
   cd backend
   php artisan serve
   ```

2. **Check Frontend Running**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Connect Wallet**
   - Click wallet icon in navbar
   - Approve MetaMask connection

4. **Navigate to Submit**
   - Open `http://localhost:5173/submit`
   - Should see form if authenticated

5. **Test Form Submission**
   - Fill in all required fields
   - Open DevTools Console (F12)
   - Click "Publish Project"
   - Watch for console logs

6. **Check Logs**
   - Frontend: Browser console (F12)
   - Backend: `backend/storage/logs/laravel.log`

## Files Involved in Submission

### Frontend
- `frontend/src/pages/Submit.jsx` - Main form
- `frontend/src/context/AuthContext.jsx` - Authentication
- `frontend/src/lib/axios.js` - API client
- `frontend/src/contracts/contract-address.json` - Contract address
- `frontend/src/contracts/DDVSSubmissions.json` - Contract ABI

### Backend
- `backend/app/Http/Controllers/SubmissionController.php` - API logic
- `backend/app/Models/Submission.php` - Database model
- `backend/app/Services/GitHubService.php` - GitHub validation
- `backend/routes/api.php` - Route definitions
- `backend/config/cors.php` - CORS settings

## Next Steps

1. **Verify Authentication**
   - Open DevTools → Application → LocalStorage
   - Check if `ddvs_token` exists after wallet connection

2. **Test Backend Connectivity**
   - Make a test API call to verify backend responds

3. **Check Logs**
   - Review `backend/storage/logs/laravel.log` for errors

4. **Verify Contract Files**
   - Ensure contract JSON files exist in frontend/src/contracts/

5. **Browser Console**
   - Look for JavaScript errors (Ctrl+Shift+K)
   - Check Network tab for failed requests
