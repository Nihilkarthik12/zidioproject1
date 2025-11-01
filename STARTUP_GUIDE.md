# Excel Analytics - Startup Guide

## Issues Fixed

### 1. Frontend API URL Configuration
- ✅ Added `REACT_APP_API_URL=http://localhost:5000/api` to `frontend/.env`
- ✅ Updated `AuthContext.js` to use environment variable
- ✅ Fixed `UploadTest.js` to use correct endpoint (`/api/upload/simple`)
- ✅ Improved error handling to distinguish network errors from server errors

### 2. Upload Endpoints
Your project has **two upload endpoints**:

#### Authenticated Upload (requires login)
- **Endpoint**: `POST /api/upload`
- **Component**: `FileUpload.js`
- **Requires**: JWT token (user must be logged in)
- **Field name**: `file`

#### Simple Upload (no authentication)
- **Endpoint**: `POST /api/upload/simple`
- **Component**: `UploadTest.js`
- **Requires**: No authentication
- **Field name**: `file`

## How to Start the Application

### Step 1: Start Backend Server

Open a terminal in the backend directory:

```powershell
cd "c:\Users\Asus\OneDrive\Desktop\zidio project\backend"
npm start
```

Or for development with auto-reload:

```powershell
npm run dev
```

**Expected output:**
```
🚀 Server running on port 5000
✅ MongoDB Connected
```

**If MongoDB fails to connect**, that's OK - the upload functionality will still work, but you won't be able to save upload history.

### Step 2: Start Frontend

Open a **NEW** terminal in the frontend directory:

```powershell
cd "c:\Users\Asus\OneDrive\Desktop\zidio project\frontend"
npm start
```

**Important**: After changing `.env`, you MUST restart the React dev server for changes to take effect.

**Expected output:**
```
Compiled successfully!
You can now view frontend in the browser.
Local: http://localhost:3000
```

### Step 3: Test the Upload

1. Open browser to `http://localhost:3000`
2. Try uploading an Excel file (.xlsx or .xls)

## Troubleshooting

### Error: "Network Error - Cannot reach server"

**Cause**: Backend is not running or running on wrong port

**Solution**:
1. Check if backend is running: Open `http://localhost:5000/api/health` in browser
   - Should show: `{"status":"OK","timestamp":"...","message":"Health check OK"}`
2. If not running, start backend: `cd backend && npm start`
3. Check backend terminal for errors

### Error: "401 Unauthorized" when using FileUpload

**Cause**: You're not logged in, but the `/api/upload` endpoint requires authentication

**Solution**:
- Option A: Login first, then upload
- Option B: Use the simple upload endpoint (UploadTest component) which doesn't require auth

### Error: "Please upload Excel files only"

**Cause**: File extension is not .xlsx or .xls

**Solution**: Only upload Excel files (.xlsx or .xls)

### Error: "Invalid Excel file"

**Cause**: File is corrupted or not a valid Excel file

**Solution**: Try a different Excel file

## Port Configuration

- **Backend**: Port 5000 (configured in `backend/.env`)
- **Frontend**: Port 3000 (React default)
- **API Base URL**: `http://localhost:5000/api`

If you need to change the backend port:
1. Edit `backend/.env` → Change `PORT=5000` to your desired port
2. Edit `frontend/.env` → Change `REACT_APP_API_URL` to match
3. Restart both servers

## File Structure

```
zidio project/
├── backend/
│   ├── server.js              # Main server (port 5000)
│   ├── routes/
│   │   ├── upload.js          # Authenticated upload
│   │   └── upload-simple.js   # Simple upload (no auth)
│   └── uploads/               # Uploaded files stored here
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── FileUpload.js      # Auth upload component
│   │   │   └── UploadTest.js      # Simple upload component
│   │   └── context/
│   │       └── AuthContext.js     # API configuration
│   └── .env                       # Frontend config
└── STARTUP_GUIDE.md              # This file
```

## Testing Checklist

- [ ] Backend starts without errors on port 5000
- [ ] Frontend starts without errors on port 3000
- [ ] Can access http://localhost:5000/api/health
- [ ] Can access http://localhost:3000
- [ ] Can upload Excel file using UploadTest (no auth)
- [ ] Can register/login
- [ ] Can upload Excel file using FileUpload (with auth)

## Next Steps

1. Start both servers (backend first, then frontend)
2. Test simple upload with UploadTest component
3. If that works, test authenticated upload with FileUpload component
4. Check browser console (F12) and backend terminal for any error messages

If you still see "Network Error", share:
- Backend terminal output
- Browser console errors (F12 → Console tab)
- Browser network tab (F12 → Network tab, filter by "upload")
