# Password Reset Feature Documentation

## Overview
This LMS now includes a complete **Forgot Password** and **Password Reset** feature that allows users to securely reset their passwords if they forget them.

---

## Features Added

### 1. **Backend API Endpoints**

#### **Forgot Password** - Request Password Reset
- **Endpoint:** `POST /api/auth/forgot-password`
- **Access:** Public
- **Description:** Generates a secure reset token when user provides their email
- **Request Body:**
  ```json
  {
    "email": "user@example.com"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "Password reset link generated",
    "data": {
      "resetToken": "abc123...",
      "resetUrl": "http://localhost:5000/reset-password/abc123...",
      "info": "In production, this would be sent via email"
    }
  }
  ```
- **Token Expiry:** 10 minutes

#### **Reset Password** - Change Password with Token
- **Endpoint:** `POST /api/auth/reset-password/:resetToken`
- **Access:** Public
- **Description:** Resets user password using the token from email/link
- **Request Body:**
  ```json
  {
    "password": "newPassword123"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "Password reset successful",
    "data": {
      "user": { ... },
      "token": "jwt_token_here"
    }
  }
  ```
- **Features:**
  - Validates token hasn't expired
  - Hashes new password automatically
  - Logs user in automatically after reset

#### **Change Password** - For Logged-In Users
- **Endpoint:** `POST /api/auth/change-password`
- **Access:** Private (requires authentication)
- **Description:** Allows logged-in users to change their password
- **Request Body:**
  ```json
  {
    "currentPassword": "oldPassword123",
    "newPassword": "newPassword456"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "Password changed successfully"
  }
  ```

---

### 2. **Database Changes**

#### **User Model** (`backend/models/User.js`)
Added two new fields to store reset token information:
```javascript
{
  resetPasswordToken: String,        // Hashed token for security
  resetPasswordExpire: Date          // Expiration timestamp
}
```

---

### 3. **Frontend Pages**

#### **Forgot Password Page** (`/forgot-password`)
- **File:** `frontend/src/pages/ForgotPassword.jsx`
- **Features:**
  - Clean, user-friendly form to enter email
  - Shows success screen with reset instructions
  - In demo mode: displays the reset token directly
  - Provides direct link to reset password page
  - "Back to Login" navigation
  - Responsive design with gradient background

#### **Reset Password Page** (`/reset-password/:token`)
- **File:** `frontend/src/pages/ResetPassword.jsx`
- **Features:**
  - Secure form to enter new password
  - Password confirmation field
  - Show/hide password toggles for both fields
  - Password strength requirements display
  - Validates passwords match
  - Validates minimum 6 characters
  - Auto-login after successful reset
  - Handles expired/invalid tokens gracefully

#### **Login Page Updates**
- Added "Forgot Password?" link below password field
- Positioned to the right for easy discovery
- Maintains existing login functionality

---

### 4. **Security Features**

✅ **Token Hashing:** Reset tokens are hashed using SHA-256 before storage  
✅ **Time Expiration:** Tokens expire after 10 minutes  
✅ **One-Time Use:** Tokens are deleted after successful password reset  
✅ **Password Hashing:** New passwords are automatically hashed via mongoose pre-save hook  
✅ **Validation:** Checks for password length, matching passwords, valid tokens  
✅ **No Token Reuse:** Once used or expired, tokens cannot be reused

---

## User Flow

### For Students/Teachers Who Forgot Password:

1. **Request Reset:**
   - Click "Forgot Password?" on login page
   - Enter registered email address
   - Click "Send Reset Link"

2. **Get Reset Token:**
   - In production: Receive email with reset link
   - In demo mode: See token displayed on success screen

3. **Reset Password:**
   - Click the reset link (or navigate manually)
   - Enter new password (min 6 characters)
   - Confirm new password
   - Click "Reset Password"

4. **Auto Login:**
   - System automatically logs you in
   - Redirected to dashboard
   - Can now use new password for future logins

### For Logged-In Users (Change Password):
```javascript
// Future implementation - can be added to user profile/settings page
POST /api/auth/change-password
{
  "currentPassword": "current",
  "newPassword": "new"
}
```

---

## Testing the Feature

### 1. Test Forgot Password Flow
```bash
# 1. Start the backend server
cd backend
npm start

# 2. Start the frontend (in another terminal)
cd frontend
npm run dev

# 3. Navigate to http://localhost:3000/forgot-password
# 4. Enter a registered user email (e.g., student@example.com)
# 5. Copy the reset token from the success screen
# 6. Navigate to reset password page or click the link
```

### 2. Test Reset Password
```bash
# 1. On reset password page, enter:
#    - New password (min 6 chars)
#    - Confirm password (must match)
# 2. Click "Reset Password"
# 3. You should be auto-logged in and redirected to dashboard
# 4. Try logging out and logging in with new password
```

### 3. Test Token Expiration
```bash
# 1. Generate a reset token
# 2. Wait 11 minutes
# 3. Try to use the token
# 4. Should get "Invalid or expired reset token" error
```

---

## Routes Added

### Frontend Routes
```javascript
// Public routes (no authentication required)
/forgot-password          → ForgotPassword page
/reset-password/:token    → ResetPassword page
```

### Backend Routes
```javascript
// Public API endpoints
POST /api/auth/forgot-password           → Request password reset
POST /api/auth/reset-password/:token     → Reset password with token

// Private API endpoint (requires authentication)
POST /api/auth/change-password           → Change password when logged in
```

---

## Styling

All password reset pages use the existing `Auth.css` stylesheet with new additions:

- **Gradient Background:** Consistent with login/register pages
- **Responsive Cards:** Clean white/themed cards that work in light & dark mode
- **Password Toggles:** Eye icons to show/hide password fields
- **Success Icons:** Large checkmark for successful operations
- **Info Boxes:** Highlighted sections for instructions and tokens
- **Back Links:** Easy navigation back to login

---

## Production Considerations

### Email Integration (Future Enhancement)

To make this production-ready, integrate an email service:

```javascript
// Example with Nodemailer
const nodemailer = require('nodemailer');

// In forgot-password route, replace the response with:
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const mailOptions = {
  from: process.env.EMAIL_USER,
  to: user.email,
  subject: 'Password Reset Request',
  html: `
    <h1>Password Reset</h1>
    <p>You requested a password reset. Click the link below:</p>
    <a href="${resetUrl}">Reset Password</a>
    <p>This link expires in 10 minutes.</p>
  `
};

await transporter.sendMail(mailOptions);
```

### Environment Variables

Add to `.env`:
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### Frontend URL Configuration

Update the reset URL in production:
```javascript
// In forgot-password route
const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
```

---

## Error Handling

The feature includes comprehensive error handling:

| Error | Status | Message |
|-------|--------|---------|
| Email not found | 404 | "No user found with that email" |
| Invalid token | 400 | "Invalid or expired reset token" |
| Expired token | 400 | "Invalid or expired reset token" |
| Password too short | 400 | "Password must be at least 6 characters" |
| Passwords don't match | 400 | "Passwords do not match" (frontend) |
| Missing fields | 400 | "Please provide required fields" |

---

## Files Modified/Created

### Backend
- ✅ `backend/models/User.js` - Added reset token fields
- ✅ `backend/routes/auth.js` - Added 3 new endpoints

### Frontend
- ✅ `frontend/src/pages/ForgotPassword.jsx` - New page
- ✅ `frontend/src/pages/ResetPassword.jsx` - New page
- ✅ `frontend/src/pages/Login.jsx` - Added forgot password link
- ✅ `frontend/src/pages/Register.jsx` - Updated styling consistency
- ✅ `frontend/src/pages/Auth.css` - Added new styles
- ✅ `frontend/src/App.jsx` - Added new routes

---

## Summary

✨ **Complete password reset flow implemented**  
🔐 **Secure token-based authentication**  
⏰ **Time-limited tokens (10 minutes)**  
🎨 **Beautiful, responsive UI**  
🌓 **Dark mode compatible**  
📱 **Mobile friendly**  
🔄 **Auto-login after reset**  
✅ **Comprehensive validation**  
🚀 **Production-ready architecture** (needs email service)

---

## Next Steps (Optional Enhancements)

1. **Email Service Integration:** Connect with SendGrid, Mailgun, or AWS SES
2. **Rate Limiting:** Prevent abuse of password reset requests
3. **Password Strength Meter:** Visual indicator of password strength
4. **Change Password in Profile:** Add UI for logged-in password changes
5. **Password History:** Prevent reuse of recent passwords
6. **Two-Factor Authentication:** Additional security layer
7. **Account Lockout:** After multiple failed attempts
8. **Security Questions:** Alternative verification method

---

## Support

If you encounter any issues with the password reset feature:
1. Check the browser console for errors
2. Check the backend terminal for API errors
3. Verify MongoDB is running
4. Ensure all dependencies are installed
5. Check token hasn't expired (10-minute limit)

---

**Feature Status:** ✅ Fully Implemented and Tested  
**Compatible With:** Light Mode, Dark Mode, All screen sizes  
**Security Level:** Production-ready (pending email service integration)

