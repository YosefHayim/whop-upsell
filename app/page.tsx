"use client";

import { useEffect, useState } from "react";

import DownsellModal from "./components/DownsellModal";
import { useExitIntent } from "./hooks/useExitIntent";
import type { DownsellConfig } from "@/lib/config";
import { defaultConfig } from "@/lib/config";

const STORAGE_KEY = "whop-downsell-shown";
const STORAGE_KEY_DAILY = "whop-downsell-shown-daily";

export default function Home() {
  const [showModal, setShowModal] = useState(false);
  const [productId, setProductId] = useState<string | null>(null);
  const [planId, setPlanId] = useState<string | null>(null);
  const [config, setConfig] = useState<DownsellConfig>(defaultConfig);
  const [triggerType, setTriggerType] = useState<"exit_intent" | "inactivity">("exit_intent");

  useEffect(() => {
    // Load configuration
    const loadConfig = async () => {
      try {
        const response = await fetch("/api/config");
        if (response.ok) {
          const data = (await response.json()) as DownsellConfig;
          setConfig(data);
        }
      } catch (error) {
        console.error("Error loading config:", error);
      }
    };
    loadConfig();

    // Get product/plan ID from URL params or Whop SDK context
    const params = new URLSearchParams(window.location.search);
    const prodId = params.get("productId");
    const plId = params.get("planId");
    if (prodId) {
      setProductId(prodId);
    }
    if (plId) {
      setPlanId(plId);
    }

    // Check display rules
    if (config.displayRules.showOncePerSession) {
      const hasShown = sessionStorage.getItem(STORAGE_KEY);
      if (hasShown === "true") {
        return; // Don't show again this session
      }
    }

    if (config.displayRules.showOncePerDay) {
      const lastShown = localStorage.getItem(STORAGE_KEY_DAILY);
      const today = new Date().toDateString();
      if (lastShown === today) {
        return; // Don't show again today
      }
    }
  }, [config.displayRules.showOncePerSession, config.displayRules.showOncePerDay]);

  const handleExitIntent = (type: "exit_intent" | "inactivity" = "exit_intent") => {
    if (!config.exitIntent.enabled) {
      return;
    }

    // Check display rules
    if (config.displayRules.showOncePerSession) {
      const hasShown = sessionStorage.getItem(STORAGE_KEY);
      if (hasShown === "true") {
        return;
      }
    }

    if (config.displayRules.showOncePerDay) {
      const lastShown = localStorage.getItem(STORAGE_KEY_DAILY);
      const today = new Date().toDateString();
      if (lastShown === today) {
        return;
      }
    }

    if (!showModal) {
      setTriggerType(type);
      setShowModal(true);
      
      if (config.displayRules.showOncePerSession) {
        sessionStorage.setItem(STORAGE_KEY, "true");
      }
      if (config.displayRules.showOncePerDay) {
        localStorage.setItem(STORAGE_KEY_DAILY, new Date().toDateString());
      }
    }
  };

  // Use the exit intent hook with dynamic config
  useExitIntent({
    onTrigger: () => handleExitIntent("exit_intent"),
    inactivityDelay: config.exitIntent.inactivityDelay,
    mouseThreshold: config.exitIntent.mouseThreshold,
  });

  const handleClose = () => {
    setShowModal(false);
  };

  const handleClaim = async () => {
    try {
      // Use planId if available, otherwise productId
      const checkoutId = planId || productId;
      if (!checkoutId) {
        throw new Error("Product ID or Plan ID is required");
      }

      const response = await fetch("/api/claim-discount", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          planId,
          promoCode: config.discount.promoCode,
        }),
      });

      if (!response.ok) {
        const errorData = (await response.json()) as { error?: string };
        throw new Error(errorData.error || "Failed to claim discount");
      }

      const data = (await response.json()) as {
        success: boolean;
        checkoutUrl?: string;
        promoCode?: string;
        planId?: string;
      };

      // Track checkout completion
      try {
        await fetch("/api/analytics", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "checkout_completed",
            metadata: {
              productId,
              planId,
              promoCode: config.discount.promoCode,
            },
          }),
        });
      } catch (error) {
        console.error("Error tracking checkout:", error);
      }

      // Redirect to the checkout URL
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error: unknown) {
      console.error("Error claiming discount:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      alert(
        `There was an error processing your discount: ${errorMessage}. Please try again or contact support.`
      );
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8 text-center">Welcome to Our Store</h1>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              This is your storefront content. The exit-intent downsell modal will appear when you move your mouse toward the top of the page or after 20
              seconds of inactivity.
            </p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-2">Current Product ID</h2>
            <p className="text-blue-700 dark:text-blue-300 font-mono">{productId || "Not set"}</p>
            <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
              Add <code className="bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded">?productId=YOUR_PRODUCT_ID</code> to the URL to test with a specific product.
            </p>
          </div>
        </div>
      </div>

      {showModal && (
        <DownsellModal
          onClose={handleClose}
          onClaim={handleClaim}
          config={config}
          productId={productId}
          planId={planId}
          triggerType={triggerType}
        />
      )}
    </main>
  );
}
