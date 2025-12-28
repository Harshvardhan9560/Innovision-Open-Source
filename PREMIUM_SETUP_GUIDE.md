# Premium Subscription Setup Guide

## Overview
This guide explains how to set up and use the premium subscription system with Razorpay integration.

## Features Implemented

### 1. Premium Subscription System
- **Price**: ₹100/month
- **Payment Gateway**: Razorpay
- **Premium Benefits**:
  - Unlimited custom course generation (up to 100 courses)
  - Unlimited YouTube course generation
  - Unlimited Studio course creation
  - Full curriculum access (LKG to Class 12)
  - Engineering course generation
  - Content Ingestion (PDFs & textbooks)
  - Code Editor & AI Website Builder
  - Multi-language translation
  - Priority support

### 2. Free User Limitations
- **Custom Courses**: 3 courses only
- **YouTube Courses**: 1 course only
- **Studio**: 1 course only (for preview/testing)
- **Curriculum**: Preview only (cannot generate)
- **Engineering**: Preview only (cannot generate)
- **Content Ingestion**: Preview only (cannot upload/process)
- **Code Editor**: Preview only (cannot run code or generate websites)
- **Translation**: Free users can use basic translation

## Setup Instructions

### Step 1: Get Razorpay API Keys

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Sign up or log in to your account
3. Navigate to Settings → API Keys
4. Generate API keys (Test mode for development, Live mode for production)
5. Copy the Key ID and Key Secret

### Step 2: Update Environment Variables

Open your `.env` file and replace the placeholder values:

```env
# Razorpay credentials
RAZORPAY_KEY_ID=your_actual_razorpay_key_id
RAZORPAY_KEY_SECRET=your_actual_razorpay_key_secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_actual_razorpay_key_id
```

**Important**: 
- Use Test keys for development
- Use Live keys only in production
- Never commit real API keys to version control

### Step 3: Install Dependencies

Run the following command to install Razorpay:

```bash
npm install
```

This will install the `razorpay` package that was added to package.json.

### Step 4: Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Login to your application

3. Navigate to `/premium` page

4. Click "Upgrade Now" button

5. Complete the test payment using Razorpay test cards:
   - Card Number: 4111 1111 1111 1111
   - CVV: Any 3 digits
   - Expiry: Any future date

## API Routes Created

### 1. `/api/premium/status` (GET)
- Returns user's premium status
- Response:
  ```json
  {
    "isPremium": false,
    "courseCount": 2,
    "maxCourses": 3
  }
  ```

### 2. `/api/premium/create-order` (POST)
- Creates a Razorpay order
- Requires authentication
- Returns order details for payment

### 3. `/api/premium/verify-payment` (POST)
- Verifies Razorpay payment signature
- Activates premium on successful verification
- Body:
  ```json
  {
    "razorpay_order_id": "order_xxx",
    "razorpay_payment_id": "pay_xxx",
    "razorpay_signature": "signature_xxx"
  }
  ```

## Files Modified/Created

### New Files:
1. `src/lib/premium.js` - Premium utility functions
2. `src/app/api/premium/status/route.js` - Premium status API
3. `src/app/api/premium/create-order/route.js` - Order creation API
4. `src/app/api/premium/verify-payment/route.js` - Payment verification API
5. `src/app/premium/page.jsx` - Premium upgrade page

### Modified Files:
1. `.env` - Added Razorpay credentials
2. `package.json` - Added razorpay dependency
3. `src/app/api/user_prompt/route.js` - Added premium checks
4. `src/app/generate/page.jsx` - Added premium UI and restrictions
5. `src/app/curriculum/page.jsx` - Added preview mode for free users

## User Flow

### Free User:
1. Can generate 3 custom courses
2. Can generate 1 YouTube course
3. Can create 1 Studio course (for testing)
4. Can view curriculum in preview mode
5. Can view engineering courses in preview mode
6. Can view content ingestion features (no upload)
7. Can view code editor (no execution)
8. Basic translation available
9. Sees upgrade prompts on restricted features
10. Can upgrade to premium for ₹100/month

### Premium User:
1. Can generate unlimited custom courses (up to 100)
2. Can generate unlimited YouTube courses
3. Can create unlimited Studio courses
4. Full access to curriculum generation
5. Full access to engineering course generation
6. Full access to content ingestion (upload PDFs, build knowledge graphs)
7. Full access to code editor and AI website builder
8. Multi-language translation for all content
9. No upgrade prompts
10. Premium badge displayed in navbar

## Database Structure

### User Document (Firestore):
```javascript
{
  email: "user@example.com",
  isPremium: true,
  premiumActivatedAt: "2024-01-01T00:00:00.000Z",
  premiumExpiresAt: "2025-01-01T00:00:00.000Z",
  premiumPaymentId: "pay_xxxxx"
}
```

## Testing Checklist

- [ ] Free user can generate 3 custom courses
- [ ] Free user blocked after 3 custom courses
- [ ] Free user can generate 1 YouTube course
- [ ] Free user blocked after 1 YouTube course
- [ ] Free user can create 1 Studio course
- [ ] Free user blocked after 1 Studio course
- [ ] Curriculum shows preview mode for free users
- [ ] Engineering shows preview mode for free users
- [ ] Content Ingestion shows preview mode for free users
- [ ] Code Editor shows preview mode for free users
- [ ] Premium page loads correctly
- [ ] Razorpay payment modal opens
- [ ] Test payment completes successfully
- [ ] Premium status updates after payment
- [ ] Premium user can generate unlimited courses
- [ ] Premium user has full curriculum access
- [ ] Premium user has full engineering access
- [ ] Premium user can use Studio unlimited
- [ ] Premium user can use YouTube unlimited
- [ ] Premium user can use Content Ingestion
- [ ] Premium user can use Code Editor
- [ ] Premium badge shows in navbar

## Security Notes

1. **API Keys**: Never expose secret keys in client-side code
2. **Signature Verification**: Always verify Razorpay signatures on server
3. **Session Validation**: All premium APIs check user authentication
4. **Expiry Checks**: Premium status checks expiry date

## Troubleshooting

### Payment Not Working:
- Check if Razorpay keys are correct
- Verify keys are for the right mode (Test/Live)
- Check browser console for errors
- Ensure Razorpay script loads properly

### Premium Not Activating:
- Check payment verification logs
- Verify signature validation
- Check Firestore permissions
- Ensure user document exists

### Course Limit Not Working:
- Clear browser cache
- Check premium status API response
- Verify Firestore query results
- Check user document structure

## Support

For issues or questions:
1. Check browser console for errors
2. Check server logs for API errors
3. Verify Razorpay dashboard for payment status
4. Check Firestore for user data

## Next Steps

1. Replace test Razorpay keys with live keys for production
2. Set up webhook for automatic payment notifications
3. Add email notifications for premium activation
4. Implement premium renewal reminders
5. Add analytics for conversion tracking
