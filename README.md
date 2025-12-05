# Whop Exit-Intent Downsell Widget

A Next.js Storefront App for Whop that displays an exit-intent downsell modal to recover abandoned sales.

## Features

- **Hybrid Exit Intent Detection**: Detects exit intent through:
  - Rapid upward mouse movement toward the top of the viewport
  - Inactivity fallback (triggers after 20 seconds of no activity)
- **Countdown Timer**: 5-minute visual countdown to create urgency
- **Direct Checkout Links**: Generates checkout links with promo codes pre-applied
- **Session Management**: Only shows once per session using `sessionStorage`
- **Iframe Compatible**: Designed to work within Whop's iframe environment

## Setup

### 1. Install Dependencies

```bash
npm install
# or
pnpm install
# or
yarn install
```

**Note:** The project uses `@whop/sdk` version `0.0.13` (latest as of setup).

### 2. Configure Environment Variables

Copy `env.example` to `.env.local` and fill in your Whop API key:

```bash
cp env.example .env.local
```

Edit `.env.local`:

```
WHOP_API_KEY=your_whop_api_key_here
WHOP_APP_ID=your_whop_app_id_here  # Optional: Only if required by your app
DEFAULT_PROMO_CODE=SAVE10
```

**Get your API key and App ID from:** [Whop Developer Dashboard](https://whop.com/developer)

### 3. Configure Whop MCP (Optional but Recommended)

For best practices and direct access to Whop documentation in Cursor, configure the Whop MCP server:

**Add to `~/.cursor/config/mcp.json`:**

```json
{
  "mcpServers": {
    "whop-docs": {
      "url": "https://docs.whop.com/mcp"
    }
  }
}
```

See `MCP_SETUP.md` for detailed instructions.

### 4. Create Promo Code in Whop Dashboard

1. Go to your Whop Developer Dashboard
2. Navigate to Promo Codes section
3. Create a promo code (e.g., `SAVE10`) with a 10% discount
4. Ensure the promo code is active and applicable to your products

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Usage

### Local Development with whop-proxy (Recommended)

For local development within Whop's iframe system, use `whop-proxy`:

```bash
# Install whop-proxy globally (if not already installed)
npm install -g whop-proxy

# Run the proxy server (defaults to port 3000)
whop-proxy
```

This creates a secure tunnel allowing your local Next.js app to run within Whop's iframe environment.

### Testing the Exit Intent

1. **Mouse Movement Method**: Move your mouse quickly toward the top of the browser window
2. **Inactivity Method**: Wait 20 seconds without moving the mouse or scrolling

### Testing with Product ID or Plan ID

Add a product ID or plan ID to the URL:

```
# Using Product ID
http://localhost:3000?productId=prod_YOUR_PRODUCT_ID

# Using Plan ID (recommended for checkout)
http://localhost:3000?planId=plan_YOUR_PLAN_ID
```

**Note:** For checkout links, you typically need a `plan_id` (format: `plan_xxx`) rather than a `product_id` (format: `prod_xxx`). If you only have a product ID, you may need to fetch the associated plan ID first.

### Deploying to Whop

1. Build the production version:

```bash
npm run build
```

2. Deploy to your hosting platform (Vercel, Netlify, etc.)
3. Configure the app in your Whop Developer Dashboard
4. Add the app to your storefront

## Project Structure

```
app/
├── api/
│   └── claim-discount/
│       └── route.ts          # API route for generating checkout links
├── components/
│   └── DownsellModal.tsx      # The exit-intent modal component
├── hooks/
│   └── useExitIntent.ts       # Custom hook for exit intent detection
├── layout.tsx                  # Root layout
├── page.tsx                    # Main page component
└── globals.css                 # Global styles with Tailwind
```

## API Route

### POST `/api/claim-discount`

Generates a checkout link with a promo code applied.

**Request Body:**

```json
{
  "productId": "prod_xxx", // Optional: Product ID
  "planId": "plan_xxx", // Optional: Plan ID (recommended for checkout)
  "promoCode": "SAVE10" // Optional: uses DEFAULT_PROMO_CODE if not provided
}
```

**Note:** Either `productId` or `planId` is required. For checkout links, `planId` is recommended as checkout URLs use plan IDs.

**Response:**

```json
{
  "success": true,
  "checkoutUrl": "https://whop.com/checkout/...",
  "promoCode": "SAVE10"
}
```

## Customization

### Change Inactivity Delay

Edit `app/page.tsx`:

```typescript
useExitIntent({
  onTrigger: handleExitIntent,
  inactivityDelay: 30000, // 30 seconds instead of 20
  mouseThreshold: 50,
});
```

### Change Discount Percentage

Edit `app/components/DownsellModal.tsx` to update the text and styling.

### Change Countdown Duration

Edit `app/page.tsx`:

```typescript
<DownsellModal
  onClose={handleClose}
  onClaim={handleClaim}
  initialTime={600} // 10 minutes instead of 5
/>
```

## Troubleshooting

### Modal Not Appearing

- Check browser console for errors
- Verify `sessionStorage` is not blocking (some privacy modes disable it)
- Ensure the hook is properly mounted

### API Route Errors

- Verify `WHOP_API_KEY` is set in `.env.local`
- If your app requires it, verify `WHOP_APP_ID` is set
- Check that the promo code exists in your Whop dashboard
- Ensure you're using a `planId` (plan_xxx) for checkout, not just a `productId`
- Review the [Whop SDK documentation](https://docs.whop.com/sdk) for any API changes

### Checkout Link Not Working

- Verify the plan ID (plan_xxx) is correct - checkout URLs require plan IDs, not product IDs
- If you only have a product ID, you may need to fetch the associated plan ID first using the Whop SDK
- Ensure the promo code is active and applicable to the plan/product
- Check [Whop API documentation](https://docs.whop.com/developer/api) for checkout link requirements

## License

MIT
