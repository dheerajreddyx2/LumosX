# Quick Test Guide - Password Reset Feature

## 🚀 How to Test the New Password Reset Feature

### Step 1: Start Your Servers

**Backend Server:**
```bash
cd backend
npm start
```
Server should run on `http://localhost:5000`

**Frontend Server (in a new terminal):**
```bash
cd frontend
npm run dev
```
Frontend should run on `http://localhost:3000`

---

### Step 2: Test the Forgot Password Flow

1. **Go to Login Page**
   - Navigate to: `http://localhost:3000/login`
   - Look for the new **"Forgot Password?"** link below the password field

2. **Click Forgot Password**
   - Enter a registered email (e.g., `student@example.com` or `teacher@example.com`)
   - Click **"Send Reset Link"**

3. **Get Reset Token**
   - You'll see a success screen with:
     - ✅ Confirmation message
     - 📧 Instructions
     - 🔑 **Reset token** displayed (in demo mode)
     - 🔗 Direct link to reset password

4. **Important:** Copy the reset token or click the "Reset Password Now" button

---

### Step 3: Reset Your Password

1. **Enter New Password**
   - You'll be on the reset password page
   - Enter a new password (minimum 6 characters)
   - Confirm the new password
   - Use the eye icons to show/hide passwords

2. **Submit**
   - Click **"Reset Password"**
   - ✅ You should see a success message
   - 🔄 You'll be automatically logged in
   - 🏠 Redirected to the dashboard

3. **Verify**
   - Logout from the dashboard
   - Try logging in with your **NEW** password
   - Should work perfectly!

---

### Step 4: Test Token Expiration (Optional)

1. Generate a reset token
2. **DON'T** use it immediately
3. Wait 11+ minutes
4. Try to use the expired token
5. Should get error: "Invalid or expired reset token"

---

## 🎯 Quick Visual Tour

### Login Page
- New **"Forgot Password?"** link added ✨
- Right-aligned below password field
- Maintains all existing login functionality

### Forgot Password Page
- Clean gradient background (matches login)
- Simple email input form
- Success screen with reset instructions
- Demo mode shows token directly (for testing)

### Reset Password Page
- Two password fields (new + confirm)
- Password visibility toggles (eye icons)
- Password requirements checklist
- Auto-login after successful reset

---

## 📋 Test Checklist

- [ ] Can access forgot password page from login
- [ ] Can request password reset with valid email
- [ ] See error message with invalid/non-existent email
- [ ] Reset token is displayed on success screen
- [ ] Can navigate to reset password page
- [ ] Password must be at least 6 characters
- [ ] Passwords must match to submit
- [ ] Can toggle password visibility
- [ ] Successfully resets password
- [ ] Automatically logged in after reset
- [ ] Can login with new password
- [ ] Old password no longer works
- [ ] Works in both light and dark mode
- [ ] Responsive on mobile devices

---

## 🛠️ Common Test Users

Use these for testing (created via seedCourses.js):

**Student Account:**
- Email: `student@example.com`
- Password: `password123` (or whatever you set)

**Teacher Account:**
- Email: `teacher@example.com`
- Password: `password123` (or whatever you set)

---

## 🎨 Dark Mode Testing

1. Login to the application
2. Toggle dark mode using the sun/moon icon in navbar
3. Logout
4. Test forgot password flow in dark mode
5. All pages should display correctly in dark mode

---

## ✅ Expected Results

### Successful Password Reset:
```
✓ Email sent to registered address
✓ Reset token generated (10-minute validity)
✓ New password accepted (6+ characters)
✓ Old token deleted after use
✓ User automatically logged in
✓ Can login with new password
✓ Old password rejected
```

### Error Cases Handled:
```
✗ Non-existent email → "No user found with that email"
✗ Expired token (>10 min) → "Invalid or expired reset token"
✗ Invalid token → "Invalid or expired reset token"
✗ Password too short → "Password must be at least 6 characters"
✗ Passwords don't match → "Passwords do not match"
```

---

## 🐛 Troubleshooting

**"Cannot find module 'crypto'"**
- `crypto` is built into Node.js, no installation needed
- If error persists, update Node.js to latest LTS version

**"No user found with that email"**
- Make sure you're using a registered email
- Check MongoDB has user data
- Run `node seedCourses.js` to create test users

**Reset token not working**
- Check if token expired (>10 minutes)
- Request a new reset token
- Copy token exactly as shown (no extra spaces)

**Auto-login not working**
- Check browser console for errors
- Verify token is being stored in localStorage
- Clear browser cache and try again

**Styling looks broken**
- Hard refresh: `Ctrl + F5` (Windows) or `Cmd + Shift + R` (Mac)
- Clear browser cache
- Check if CSS file is loading (browser dev tools → Network tab)

---

## 🌟 New Features Summary

✨ **Forgot Password Link** on login page  
📧 **Email-based Password Reset** (demo mode: shows token directly)  
🔐 **Secure Token System** (hashed, time-limited)  
⏰ **10-Minute Expiration** for security  
🔄 **Auto-Login** after successful reset  
🎨 **Beautiful UI** matching existing design  
🌓 **Dark Mode Support**  
📱 **Fully Responsive**  
✅ **Comprehensive Validation**  

---

## 📞 Need Help?

If something doesn't work:
1. Check both terminal windows for error messages
2. Open browser console (F12) for frontend errors
3. Verify MongoDB is running
4. Ensure you're using a valid registered email
5. Try generating a fresh reset token

---

**Happy Testing! 🎉**

Remember: This is demo mode. In production, the reset link would be sent via email instead of being displayed on screen.

