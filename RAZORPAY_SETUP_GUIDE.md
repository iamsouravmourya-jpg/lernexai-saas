# Razorpay Integration Setup Guide

## Overview
This guide will help you complete the Razorpay payment integration for LernexAI Pro subscriptions.

---

## STEP 1: Get Razorpay Test Keys

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Sign up or log in
3. Navigate to **Settings** → **API Keys**
4. Copy the **Test Mode Key ID** (starts with `rzp_test_`)
5. Copy the **Test Mode Key Secret**

---

## STEP 2: Update .env File

Replace the placeholder in your `.env` file:

```env
VITE_RAZORPAY_KEY_ID=rzp_test_your_actual_key_here
```

**Note:** Never commit your actual Razorpay keys to git!

---

## STEP 3: Create Payments Table in Supabase

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy the contents of `supabase/payments_table.sql`
5. Paste and run the SQL

This will create:
- `payments` table for storing transactions
- Indexes for performance and order idempotency
- Row Level Security so users can only read their own payments

`plan_type` is stored in Supabase Auth user metadata and is updated by the
verification Edge Function through the Admin Auth API.

---

## STEP 4: Deploy Supabase Edge Functions

### Install Supabase CLI (if not already installed)

```bash
npm install -g supabase
```

### Login to Supabase

```bash
supabase login
```

### Link your project

```bash
supabase link --project-ref bwykymyxuzfkirybrnkh
```

### Set Environment Variables for Edge Functions

```bash
supabase secrets set RAZORPAY_KEY_ID=your_test_key_id
supabase secrets set RAZORPAY_KEY_SECRET=your_test_key_secret
```

### Deploy Edge Functions

```bash
supabase functions deploy create-razorpay-order
supabase functions deploy verify-razorpay-payment
```

---

## STEP 5: Test the Payment Flow

1. Start your dev server:
   ```bash
   npm run dev
   ```

2. Log in to your account
3. Navigate to `/upgrade`
4. Click "Upgrade to Pro"
5. Complete the test payment (use Razorpay test card details)

**Test Card Details:**
- Card Number: `4111 1111 1111 1111`
- Expiry: Any future date
- CVV: Any 3 digits
- Name: Any name

---

## STEP 6: Verify Payment Success

After successful payment:
1. Check Supabase `payments` table - should show status "success"
2. Check the user's Auth metadata - `plan_type` should be `"pro"`
3. Refresh your app - should show "Pro Member" badge
4. Upgrade button should disappear

---

## Troubleshooting

### Edge Function Deployment Fails
- Ensure Supabase CLI is installed and logged in
- Check that project reference is correct
- Verify environment variables are set

### Payment Verification Fails
- Check Edge Function logs in Supabase dashboard
- Verify RAZORPAY_KEY_SECRET is correct
- Check that payment signature is being passed correctly

### User Plan Not Updating
- Check the user's `raw_user_meta_data` in Supabase Authentication
- Verify `SUPABASE_SERVICE_ROLE_KEY` is available to the Edge Function
- Check Edge Function logs for errors

### CORS Errors
- Ensure your domain is added to Supabase allowed origins
- Check that Edge Functions have proper CORS headers

---

## Production Checklist

Before going live:

- [ ] Switch Razorpay to Live Mode
- [ ] Update .env with live keys
- [ ] Update Supabase Edge Function secrets with live keys
- [ ] Test live payment with small amount
- [ ] Set up webhooks for payment notifications
- [ ] Configure refund policies
- [ ] Set up monitoring for failed payments
- [ ] Add analytics for conversion tracking

---

## File Structure

```
supabase/
├── payments_table.sql              # SQL to create payments table
└── functions/
    ├── create-razorpay-order/      # Edge function to create Razorpay order
    │   └── index.ts
    └── verify-razorpay-payment/    # Edge function to verify payment
        └── index.ts

src/
├── lib/
│   └── razorpay.ts                # Payment handler utility
└── pages/
    └── Upgrade.tsx                # Upgrade page component
```

---

## Support

If you encounter issues:
1. Check Supabase Edge Function logs
2. Check Razorpay dashboard for payment status
3. Review browser console for errors
4. Verify all environment variables are set correctly
