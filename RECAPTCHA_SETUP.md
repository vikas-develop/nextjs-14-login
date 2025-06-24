# reCAPTCHA Setup Guide

## 1. Get reCAPTCHA Keys

1. Go to [Google reCAPTCHA Console](https://www.google.com/recaptcha/admin/create)
2. Create a new site with these settings:
   - **Label**: Your app name (e.g., "NextLogin App")
   - **reCAPTCHA type**: reCAPTCHA v2 → "I'm not a robot" Checkbox
   - **Domains**: Add `localhost` for development and your production domain
3. After creating, you'll get:
   - **Site Key** (public key)
   - **Secret Key** (private key)

## 2. Configure Environment Variables

Create a `.env.local` file in your project root with:

```
# reCAPTCHA Configuration
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_site_key_here
RECAPTCHA_SECRET_KEY=your_secret_key_here
```

Replace `your_site_key_here` and `your_secret_key_here` with the actual keys from step 1.

## 3. Test the Implementation

1. Start your development server: `npm run dev`
2. Navigate to `http://localhost:4000/login`
3. You should see the reCAPTCHA checkbox
4. Complete the reCAPTCHA verification and try logging in

## Features Added

✅ **Image Verification**: reCAPTCHA v2 with image challenges
✅ **Frontend Validation**: Prevents form submission without reCAPTCHA
✅ **Backend Verification**: Server-side token validation
✅ **Error Handling**: Clear error messages for failed verification
✅ **Loading States**: Visual feedback during authentication
✅ **Reset on Error**: reCAPTCHA resets if login fails

## Security Notes

- The Site Key is public and goes in `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`
- The Secret Key is private and goes in `RECAPTCHA_SECRET_KEY` (no NEXT_PUBLIC prefix)
- reCAPTCHA tokens are single-use and expire after a few minutes
- Failed verification attempts are logged for monitoring

## Troubleshooting

- **reCAPTCHA not showing**: Check if `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` is set correctly
- **Verification failing**: Verify `RECAPTCHA_SECRET_KEY` is correct
- **Domain errors**: Make sure your domain is added to reCAPTCHA console 