# Submission Flow - Testing Documentation

## Overview
This document outlines the comprehensive testing approach for the submission flow, including validation error handling, dashboard integration, and end-to-end blockchain verification.

## Automated Tests

### Running Backend Tests
```bash
cd backend
php artisan test tests/Feature/SubmissionFlowTest.php
```

### Test Cases Covered

1. **User can create submission**
   - Validates that authenticated users can submit projects
   - Checks that response includes submission ID and details
   - Verifies database record creation

2. **User can retrieve own submissions**
   - Tests `/api/submissions/mine` endpoint
   - Ensures users only see their own submissions
   - Verifies proper authentication

3. **Validation errors for missing fields**
   - Tests required field validation
   - Checks detailed error messages
   - Validates form field constraints

4. **Authentication required**
   - Ensures unauthenticated requests are rejected
   - Returns proper 401 status

5. **Submission verification**
   - Tests blockchain verification with transaction hash
   - Updates submission status to 'verified'
   - Records transaction hash

6. **Community feed filtering**
   - Ensures only verified submissions appear in feed
   - Pending submissions don't show publicly
   - Users see their own submissions via `/submissions/mine`

## Manual Testing Guide

### Frontend Testing

#### 1. Dashboard - My Projects Tab
**Steps:**
1. Login with wallet
2. Go to Dashboard
3. Click "My Projects" tab
4. Verify submissions load correctly
5. Check status badges (Pending/Verified)

**Expected Results:**
- My Projects tab is visible
- Submissions list loads from `/api/submissions/mine`
- Cards show project details (title, category, description, stats)
- "New Project" button redirects to /submit
- Empty state shows helpful message

#### 2. Submit Page - Form Validation
**Test Case 1: Missing Title**
1. Leave title empty
2. Fill other required fields
3. Click "Publish Project"
4. Check error message

**Expected Result:**
- Error: "Project title is required."

**Test Case 2: Invalid URL**
1. Fill title, category, description
2. Enter invalid repository URL (e.g., "not-a-url")
3. Click "Publish Project"
4. Check error message

**Expected Result:**
- Error: "Please enter a valid URL (e.g., https://github.com/...)"

**Test Case 3: Short Description**
1. Fill all fields
2. Enter description < 10 characters
3. Click "Publish Project"
4. Check error message

**Expected Result:**
- Error: "Description must be at least 10 characters long."

#### 3. Submit Page - GitHub Validation
**Test Case 1: Private Repository**
1. Enter valid GitHub URL for private repository
2. Click "Publish Project"
3. Check error message

**Expected Result:**
- Error: "The repository URL may be invalid or private. Please ensure it is a valid, publicly accessible GitHub repository."

**Test Case 2: Non-existent Repository**
1. Enter non-existent GitHub URL
2. Click "Publish Project"
3. Check error message

**Expected Result:**
- Error: "The repository URL may be invalid or private..."

#### 4. Complete Submission Flow
**Steps:**
1. Login with wallet
2. Go to Submit page
3. Fill form with:
   - Title: "Test Project"
   - Category: "Web Development"
   - Description: "This is a comprehensive test of the submission flow."
   - Repository URL: "https://github.com/user/public-repo"
   - Media: Upload image or video (optional)
4. Click "Publish Project"
5. Approve transaction in MetaMask
6. Wait for confirmation
7. Check Dashboard → My Projects tab

**Expected Results:**
- Form submits successfully
- MetaMask popup appears for signing
- Page redirects to Dashboard
- New submission appears in "My Projects" tab
- Status shows "⏳ Pending" initially
- After blockchain verification, status updates to "✓ Verified"

#### 5. Error Handling - Detailed Messages
**Test Case: Network Error During Submission**
1. Start submission
2. Disconnect from network or backend goes down
3. Check error message display

**Expected Result:**
- Error message is clearly displayed
- Multi-line errors are properly formatted
- User can retry by clicking "Publish Project" again

## API Endpoints Reference

### Public Endpoints
- `GET /api/submissions` - Get community feed (verified only)
- `GET /api/submissions/{id}` - Get submission details
- `GET /api/users/{id}` - Get user profile

### Authenticated Endpoints
- `POST /api/projects` - Create submission
- `POST /api/projects/{id}/verify` - Verify with tx hash
- `GET /api/submissions/mine` - Get user's submissions
- `GET /auth/me` - Get current user

## Error Response Examples

### Validation Error (422)
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "title": ["Project title is required."],
    "repository_url": ["Please enter a valid URL (e.g., https://github.com/...)"]
  }
}
```

### GitHub Validation Error (422)
```json
{
  "status": "error",
  "message": "Invalid or inaccessible GitHub repository",
  "details": "The repository URL may be invalid or private. Please ensure it is a valid, publicly accessible GitHub repository."
}
```

## Known Limitations & Notes

1. **Media Upload**: Currently accepts up to 50MB files
2. **GitHub Validation**: Requires public repositories
3. **Pending Submissions**: Don't appear in community feed until blockchain verified
4. **My Projects**: Show all user submissions regardless of verification status

## Future Improvements

1. Add file type validation for media uploads
2. Support private repository verification with GitHub tokens
3. Add batch operations for multiple submissions
4. Implement submission editing before blockchain verification
5. Add draft/save functionality for incomplete submissions

## Support

For testing issues or bugs, check:
1. Browser console for JavaScript errors
2. Laravel logs at `backend/storage/logs/laravel.log`
3. Network tab for API response details
4. MetaMask console for blockchain-related issues
