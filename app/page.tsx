"use client";

import { useState, useEffect } from "react";
import DownsellModal from "./components/DownsellModal";
import { useExitIntent } from "./hooks/useExitIntent";

const STORAGE_KEY = "whop-downsell-shown";

export default function Home() {
  const [showModal, setShowModal] = useState(false);
  const [productId, setProductId] = useState<string | null>(null);

  useEffect(() => {
    // Get product ID from URL params or Whop SDK context
    // For now, we'll try to get it from URL search params
    const params = new URLSearchParams(window.location.search);
    const id = params.get("productId");
    setProductId(id || "default-product-id"); // Fallback for testing

    // Check if modal has already been shown this session
    const hasShown = sessionStorage.getItem(STORAGE_KEY);
    if (hasShown === "true") {
      return; // Don't show again this session
    }
  }, []);

  const handleExitIntent = () => {
    const hasShown = sessionStorage.getItem(STORAGE_KEY);
    if (hasShown !== "true" && !showModal) {
      setShowModal(true);
      sessionStorage.setItem(STORAGE_KEY, "true");
    }
  };

  // Use the exit intent hook
  useExitIntent({
    onTrigger: handleExitIntent,
    inactivityDelay: 20000, // 20 seconds
    mouseThreshold: 50, // 50px from top
  });

  const handleClose = () => {
    setShowModal(false);
  };

  const handleClaim = async () => {
    try {
      const response = await fetch("/api/claim-discount", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: productId || "default-product-id",
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to claim discount");
      }

      const data = await response.json();
      
      // Redirect to the checkout URL
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error) {
      console.error("Error claiming discount:", error);
      alert(
        "There was an error processing your discount. Please try again or contact support."
      );
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Welcome to Our Store
          </h1>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              This is your storefront content. The exit-intent downsell modal will
              appear when you move your mouse toward the top of the page or after
              20 seconds of inactivity.
            </p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Current Product ID
            </h2>
            <p className="text-blue-700 dark:text-blue-300 font-mono">
              {productId || "Not set"}
            </p>
            <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
              Add <code className="bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded">?productId=YOUR_PRODUCT_ID</code> to the URL to test with a specific product.
            </p>
          </div>
        </div>
      </div>

      {showModal && (
        <DownsellModal onClose={handleClose} onClaim={handleClaim} />
      )}
    </main>
  );
}

