# Setup Requirements for Whop Downsell App

## ✅ What's Already Implemented

1. **Admin Configuration Dashboard** (`/admin`) - Fully functional
2. **Dynamic Configuration System** - JSON-based storage working
3. **Analytics Tracking** - Event tracking and dashboard implemented
4. **Promo Code API Endpoints** - Structure ready, needs SDK integration

## 🔧 What You Need to Provide

### 1. Whop API Credentials

You need to get these from [Whop Developer Dashboard](https://whop.com/developer):

#### Required:

- **`WHOP_API_KEY`** - Your Whop API key
  - Go to: https://whop.com/developer
  - Navigate to "API Keys" section
  - Create or copy your API key
  - Add to `.env.local`: `WHOP_API_KEY=your_key_here`

#### Optional (but recommended):

- **`WHOP_APP_ID`** - Your Whop App ID (if you're building a Whop App)

  - Found in your app settings
  - Add to `.env.local`: `WHOP_APP_ID=app_xxxxxxxxxxxxxx`

- **`WHOP_COMPANY_ID`** - Your company/business ID
  - Format: `biz_xxxxxxxxxxxxxx` or your company slug
  - Needed for promo code listing operations
  - Add to `.env.local`: `WHOP_COMPANY_ID=biz_xxxxxxxxxxxxxx`

### 2. Environment File Setup

1. Copy the example file:

   ```bash
   cp env.example .env.local
   ```

2. Edit `.env.local` and add your credentials:
   ```env
   WHOP_API_KEY=your_actual_api_key_here
   WHOP_APP_ID=app_xxxxxxxxxxxxxx  # Optional
   WHOP_COMPANY_ID=biz_xxxxxxxxxxxxxx  # Optional but helpful
   DEFAULT_PROMO_CODE=SAVE10
   ```

### 3. Whop SDK Permissions

For promo code operations to work, your API key needs these permissions:

- ✅ `promo_code:basic:read` - To list and retrieve promo codes
- ✅ `access_pass:basic:read` - To read product/plan information

**How to check/set permissions:**

1. Go to https://whop.com/developer
2. Navigate to your API key settings
3. Ensure the above permissions are enabled

### 4. Test Mode Setup

For testing, you can:

1. **Create a test promo code** in your Whop dashboard:

   - Go to your Whop business dashboard
   - Navigate to "Promo Codes"
   - Create a test code (e.g., `TEST10` with 10% discount)
   - Note the code and which plan it applies to

2. **Test the API endpoints:**

   ```bash
   # List promo codes (requires companyId)
   curl "http://localhost:3000/api/promo-codes?companyId=biz_xxxxx"

   # Validate a promo code
   curl -X POST http://localhost:3000/api/promo-codes \
     -H "Content-Type: application/json" \
     -d '{"code": "TEST10", "planId": "plan_xxxxx"}'
   ```

## ⚠️ Current Limitations & Next Steps

### SDK Version Compatibility

The app uses `@whop/sdk` version `0.0.13`. The promo code methods may need adjustment based on:

- The actual SDK method names (could be `list()`, `listPromoCodes()`, etc.)
- The parameter format (could be `company_id` vs `companyId`)

**If you encounter SDK errors:**

1. Check the [Whop SDK Documentation](https://docs.whop.com/sdk/api/promo-codes)
2. Verify the method signatures match your SDK version
3. Consider upgrading `@whop/sdk` if a newer version is available

### What to Test

1. **Start the dev server:**

   ```bash
   npm run dev
   ```

2. **Test configuration:**

   - Visit `http://localhost:3000/admin`
   - Update settings and save
   - Verify config persists

3. **Test promo code API:**

   - Use the curl commands above
   - Or test via the admin dashboard (if we add UI for it)

4. **Test the modal:**
   - Visit `http://localhost:3000?productId=prod_xxxxx&planId=plan_xxxxx`
   - Trigger exit intent or wait for inactivity
   - Verify modal appears with your configured settings

## 📝 Missing Information Needed

To complete the implementation, please provide:

1. **Your Whop API Key** (add to `.env.local`)
2. **Your Company ID** (if you want to test promo code listing)
3. **A test promo code** you've created in Whop dashboard
4. **A test plan ID** to use for validation

Once you provide these, we can:

- Test the promo code validation
- Verify the SDK integration works
- Fix any SDK method name mismatches
- Add promo code management UI to the admin dashboard

## 🚀 Quick Start Checklist

- [ ] Copy `env.example` to `.env.local`
- [ ] Add `WHOP_API_KEY` to `.env.local`
- [ ] (Optional) Add `WHOP_COMPANY_ID` to `.env.local`
- [ ] Verify API key has `promo_code:basic:read` permission
- [ ] Create a test promo code in Whop dashboard
- [ ] Start dev server: `npm run dev`
- [ ] Test admin dashboard: `http://localhost:3000/admin`
- [ ] Test promo code API endpoints
- [ ] Report any SDK errors for adjustment

## 🔍 Troubleshooting

### "WHOP_API_KEY not configured"

- Make sure `.env.local` exists and contains `WHOP_API_KEY`
- Restart your dev server after adding env variables

### "SDK method not available"

- The SDK method names might differ in v0.0.13
- Check the actual SDK methods available
- We may need to adjust the method calls

### "Promo code not found"

- Verify the promo code exists in your Whop dashboard
- Check that it's active and applies to the plan you're testing
- Ensure the plan ID is correct

### "Company ID required"

- Add `WHOP_COMPANY_ID` to `.env.local`
- Or pass `companyId` as a query parameter when calling the API
