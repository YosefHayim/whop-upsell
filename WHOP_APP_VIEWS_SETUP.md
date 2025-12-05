# Whop App Views Setup Guide

This app now supports both **Experience View** and **Dashboard View** as required by Whop's app architecture.

## 📋 Overview

- **Experience View** (`/experiences/[experienceId]`) - Where members interact with the downsell modal
- **Dashboard View** (`/dashboard/[companyId]`) - Where admins configure the downsell settings

## 🔧 Configuration in Whop Developer Dashboard

### Step 1: Configure App Paths

1. Go to [Whop Developer Dashboard](https://whop.com/developer)
2. Select your app
3. Navigate to **Hosting** section
4. Configure the following paths:

#### Experience View Path:

```
/experiences/[experienceId]
```

This allows Whop to pass the experience ID dynamically: `/experiences/exp_xxxxxxxx`

#### Dashboard View Path:

```
/dashboard/[companyId]
```

This allows Whop to pass the company ID dynamically: `/dashboard/biz_xxxxxxxx`

### Step 2: Environment Variables

Make sure your `.env.local` file contains:

```env
# Required
WHOP_API_KEY=your_api_key_here
WHOP_APP_ID=app_xxxxxxxxxxxxxx

# Optional
WHOP_COMPANY_ID=biz_xxxxxxxxxxxxxx
DEFAULT_PROMO_CODE=SAVE10
```

### Step 3: Test Your App

#### Testing Experience View:

1. **Install your app** in your Whop business
2. **Create an experience** that uses your app
3. **Access the experience** from the Whop sidebar
4. The downsell modal will appear when:
   - User moves mouse toward top of page (exit intent)
   - User is inactive for the configured time period

#### Testing Dashboard View:

1. **Install your app** in your Whop business
2. **Go to your business dashboard**
3. **Navigate to Apps section** in the sidebar
4. **Click on your app** - it will open at `/dashboard/biz_xxxxxxxx`
5. Configure all downsell settings from the admin interface

## 🎯 How It Works

### Experience View Flow:

1. User visits your app experience in Whop
2. Whop passes `experienceId` in the URL: `/experiences/exp_123`
3. App verifies user has access to the experience
4. App shows the downsell modal when exit intent is detected
5. User clicks "Claim Discount" → redirected to checkout with promo code

### Dashboard View Flow:

1. Admin opens your app from the dashboard
2. Whop passes `companyId` in the URL: `/dashboard/biz_123`
3. App verifies user is an admin of the company
4. Admin configures all downsell settings
5. Settings are saved and used by the Experience View

## 🔐 Authentication

Both views use Whop's authentication system:

- **Experience View**: Checks if user has access to the experience (customer or admin)
- **Dashboard View**: Requires admin access to the company

The authentication is handled automatically via:

- `x-whop-user-token` header (passed by Whop iframe)
- `whopsdk.verifyUserToken()` - Verifies the token and gets user ID
- `whopsdk.users.checkAccess()` - Checks access permissions

## 📁 File Structure

```
app/
├── experiences/
│   └── [experienceId]/
│       ├── page.tsx              # Server component with auth
│       └── DownsellExperience.tsx # Client component with modal
├── dashboard/
│   └── [companyId]/
│       ├── page.tsx              # Server component with auth
│       └── DashboardAdmin.tsx     # Client component with config UI
└── admin/
    └── page.tsx                   # Legacy route (still works for local dev)
```

## 🚀 Local Development

For local development, you can still use:

- `http://localhost:3000` - Basic test page
- `http://localhost:3000/admin` - Admin dashboard (no auth required locally)

But for production/Whop integration, use:

- Experience View: `/experiences/[experienceId]`
- Dashboard View: `/dashboard/[companyId]`

## ⚠️ Important Notes

1. **App ID Required**: Make sure `WHOP_APP_ID` is set in your environment variables
2. **API Key Required**: `WHOP_API_KEY` is needed for all SDK operations
3. **Path Configuration**: The paths in Whop dashboard must match exactly:
   - Experience: `/experiences/[experienceId]`
   - Dashboard: `/dashboard/[companyId]`
4. **Testing**: Use Whop's preview feature or install the app to test the views

## 🐛 Troubleshooting

### "Access Denied" in Experience View

- User doesn't have access to the experience
- Check that the experience is attached to a product the user has access to

### "Admin Access Required" in Dashboard View

- User is not an admin of the company
- Only company admins can access the dashboard

### SDK Errors

- Verify `WHOP_API_KEY` and `WHOP_APP_ID` are set correctly
- Check that your API key has the required permissions
- Restart your dev server after changing env variables

## 📚 Next Steps

1. Configure the paths in Whop Developer Dashboard
2. Install your app in a test Whop business
3. Create a test experience
4. Test both views
5. Customize the configuration as needed

For more information, see:

- [Whop App Views Documentation](https://docs.whop.com/developer/guides/app-views)
- [Whop Authentication Guide](https://docs.whop.com/developer/guides/authentication)
