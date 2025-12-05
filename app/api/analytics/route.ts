import { NextRequest, NextResponse } from "next/server";
import { mkdir, readFile, writeFile } from "fs/promises";

import { existsSync } from "fs";
import path from "path";

const ANALYTICS_FILE = path.join(process.cwd(), ".whop-downsell-analytics.json");

interface AnalyticsEvent {
  id: string;
  timestamp: number;
  type: "modal_shown" | "modal_closed" | "claim_clicked" | "checkout_completed" | "timer_expired";
  metadata?: {
    productId?: string;
    planId?: string;
    promoCode?: string;
    triggerType?: "exit_intent" | "inactivity";
    timeSpent?: number; // seconds
  };
}

interface AnalyticsData {
  events: AnalyticsEvent[];
  summary: {
    totalModalShown: number;
    totalModalClosed: number;
    totalClaimClicked: number;
    totalCheckoutCompleted: number;
    totalTimerExpired: number;
    conversionRate: number; // claim_clicked / modal_shown
    checkoutRate: number; // checkout_completed / claim_clicked
    revenueRecovered: number; // placeholder for future implementation
  };
}

const defaultAnalytics: AnalyticsData = {
  events: [],
  summary: {
    totalModalShown: 0,
    totalModalClosed: 0,
    totalClaimClicked: 0,
    totalCheckoutCompleted: 0,
    totalTimerExpired: 0,
    conversionRate: 0,
    checkoutRate: 0,
    revenueRecovered: 0,
  },
};

async function ensureAnalyticsFile() {
  if (!existsSync(ANALYTICS_FILE)) {
    await writeFile(ANALYTICS_FILE, JSON.stringify(defaultAnalytics, null, 2), "utf-8");
  }
}

function recalculateSummary(events: AnalyticsEvent[]): AnalyticsData["summary"] {
  const modalShown = events.filter((e) => e.type === "modal_shown").length;
  const modalClosed = events.filter((e) => e.type === "modal_closed").length;
  const claimClicked = events.filter((e) => e.type === "claim_clicked").length;
  const checkoutCompleted = events.filter((e) => e.type === "checkout_completed").length;
  const timerExpired = events.filter((e) => e.type === "timer_expired").length;

  return {
    totalModalShown: modalShown,
    totalModalClosed: modalClosed,
    totalClaimClicked: claimClicked,
    totalCheckoutCompleted: checkoutCompleted,
    totalTimerExpired: timerExpired,
    conversionRate: modalShown > 0 ? (claimClicked / modalShown) * 100 : 0,
    checkoutRate: claimClicked > 0 ? (checkoutCompleted / claimClicked) * 100 : 0,
    revenueRecovered: 0, // TODO: Calculate from actual transactions
  };
}

// GET - Retrieve analytics data
export async function GET(request: NextRequest) {
  try {
    await ensureAnalyticsFile();
    const analyticsData = await readFile(ANALYTICS_FILE, "utf-8");
    const analytics = JSON.parse(analyticsData) as AnalyticsData;

    // Recalculate summary
    analytics.summary = recalculateSummary(analytics.events);

    // Optional: Filter by date range
    const { searchParams } = new URL(request.url);
    const days = searchParams.get("days");
    if (days) {
      const cutoffDate = Date.now() - parseInt(days) * 24 * 60 * 60 * 1000;
      analytics.events = analytics.events.filter((e) => e.timestamp >= cutoffDate);
      analytics.summary = recalculateSummary(analytics.events);
    }

    return NextResponse.json(analytics);
  } catch (error: unknown) {
    console.error("Error reading analytics:", error);
    return NextResponse.json(defaultAnalytics);
  }
}

// POST - Record an analytics event
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Omit<AnalyticsEvent, "id" | "timestamp">;

    await ensureAnalyticsFile();
    const analyticsData = await readFile(ANALYTICS_FILE, "utf-8");
    const analytics = JSON.parse(analyticsData) as AnalyticsData;

    // Add new event
    const event: AnalyticsEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      ...body,
    };

    analytics.events.push(event);

    // Keep only last 10,000 events to prevent file from growing too large
    if (analytics.events.length > 10000) {
      analytics.events = analytics.events.slice(-10000);
    }

    // Recalculate summary
    analytics.summary = recalculateSummary(analytics.events);

    // Save updated analytics
    await writeFile(ANALYTICS_FILE, JSON.stringify(analytics, null, 2), "utf-8");

    return NextResponse.json({ success: true, event });
  } catch (error: unknown) {
    console.error("Error recording analytics event:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
