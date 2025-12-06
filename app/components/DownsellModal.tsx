"use client";

import { useEffect, useState } from "react";
import type { DownsellConfig } from "@/lib/config";

interface DownsellModalProps {
  onClose: () => void;
  onClaim: () => void;
  config: DownsellConfig;
  productId?: string | null;
  planId?: string | null;
  triggerType?: "exit_intent" | "inactivity";
}

export default function DownsellModal({
  onClose,
  onClaim,
  config,
  productId,
  planId,
  triggerType,
}: DownsellModalProps) {
  const initialTime = config.timer.enabled ? config.timer.duration : 0;
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isClaiming, setIsClaiming] = useState(false);
  const [modalShownTime] = useState(Date.now());

  // Track modal shown event
  useEffect(() => {
    const trackEvent = async () => {
      try {
        await fetch("/api/analytics", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "modal_shown",
            metadata: {
              productId,
              planId,
              triggerType,
            },
          }),
        });
      } catch (error) {
        console.error("Error tracking modal shown:", error);
      }
    };
    trackEvent();
  }, [productId, planId, triggerType]);

  useEffect(() => {
    if (!config.timer.enabled || timeLeft <= 0) {
      if (timeLeft <= 0 && config.timer.enabled) {
        // Track timer expiration
        fetch("/api/analytics", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "timer_expired",
            metadata: { productId, planId },
          }),
        }).catch(console.error);
        onClose();
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev: number) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onClose, config.timer.enabled, productId, planId]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleClaim = async () => {
    setIsClaiming(true);
    
    // Track claim clicked event
    try {
      await fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "claim_clicked",
          metadata: {
            productId,
            planId,
            promoCode: config.discount.promoCode,
            timeSpent: Math.floor((Date.now() - modalShownTime) / 1000),
          },
        }),
      });
    } catch (error) {
      console.error("Error tracking claim click:", error);
    }

    try {
      await onClaim();
    } catch (error: unknown) {
      console.error("Error claiming discount:", error);
      setIsClaiming(false);
    }
  };

  const handleClose = () => {
    // Track modal closed event
    fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "modal_closed",
        metadata: {
          productId,
          planId,
          timeSpent: Math.floor((Date.now() - modalShownTime) / 1000),
        },
      }),
    }).catch(console.error);
    onClose();
  };

  // Format modal content with placeholders
  const formatDescription = (template: string): string => {
    return template
      .replace("{time}", formatTime(timeLeft))
      .replace("{discount}", `${config.discount.percentage}%`);
  };

  const formatCtaText = (template: string): string => {
    return template.replace("{discount}", `${config.discount.percentage}%`);
  };

  // Get card variation styles
  const getCardVariationStyles = () => {
    const variation = config.design.cardVariation || "modern";
    const primaryColor = config.design.primaryColor || "#2563eb";
    const secondaryColor = config.design.secondaryColor || "#10b981";
    const bgColor = config.design.backgroundColor || "#ffffff";
    const textColor = config.design.textColor || "#111827";
    const useGradient = config.design.useGradient || false;
    const borderStyle = config.design.borderStyle || "shadow";

    const baseStyles: React.CSSProperties = {
      color: textColor,
    };

    const borderClasses: Record<string, string> = {
      none: "",
      solid: "border-2",
      dashed: "border-2 border-dashed",
      shadow: "shadow-2xl",
    };

    const borderStyleObj: React.CSSProperties = {};
    if (borderStyle === "solid" || borderStyle === "dashed") {
      borderStyleObj.borderColor = primaryColor;
    }

    switch (variation) {
      case "minimal":
        return {
          container: `bg-white dark:bg-gray-50 ${borderClasses[borderStyle]} rounded-lg`,
          header: "text-2xl font-semibold",
          style: { ...baseStyles, backgroundColor: bgColor, ...borderStyleObj },
        };

      case "bold":
        return {
          container: `${borderClasses[borderStyle]} rounded-3xl`,
          header: "text-4xl font-black text-white",
          style: {
            background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
            ...borderStyleObj,
          },
        };

      case "gradient":
        return {
          container: `${borderClasses[borderStyle]} rounded-2xl`,
          header: `text-3xl font-bold ${useGradient ? "text-white" : ""}`,
          style: useGradient
            ? {
                background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor}, ${primaryColor})`,
                ...borderStyleObj,
              }
            : { ...baseStyles, backgroundColor: bgColor, ...borderStyleObj },
        };

      case "card":
        return {
          container: `bg-white dark:bg-gray-800 ${borderClasses[borderStyle]} rounded-xl ${borderStyle === "solid" || borderStyle === "dashed" ? "border-4" : ""}`,
          header: "text-3xl font-bold",
          style: { ...baseStyles, backgroundColor: bgColor, ...borderStyleObj },
        };

      case "modern":
        return {
          container: `bg-white dark:bg-gray-800 ${borderClasses[borderStyle]} rounded-2xl backdrop-blur-sm`,
          header: "text-3xl font-bold",
          style: { ...baseStyles, backgroundColor: bgColor, ...borderStyleObj },
        };

      case "classic":
        return {
          container: `bg-white dark:bg-gray-800 ${borderClasses[borderStyle]} rounded-lg border-2 border-gray-200`,
          header: "text-2xl font-bold",
          style: { ...baseStyles, backgroundColor: bgColor, ...borderStyleObj },
        };

      default:
        return {
          container: `bg-white dark:bg-gray-800 ${borderClasses[borderStyle]} rounded-2xl`,
          header: "text-3xl font-bold",
          style: { ...baseStyles, backgroundColor: bgColor, ...borderStyleObj },
        };
    }
  };

  const cardStyles = getCardVariationStyles();
  const modalSizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
  };

  // Get button style based on variation
  const getButtonStyle = () => {
    const variation = config.design.cardVariation || "modern";
    const primaryColor = config.design.primaryColor || "#2563eb";
    const secondaryColor = config.design.secondaryColor || "#10b981";

    if (variation === "bold") {
      return {
        background: "white",
        color: "#111827",
      };
    }

    if (variation === "gradient" && config.design.useGradient) {
      return {
        background: "white",
        color: "#111827",
      };
    }

    if (variation === "card") {
      return {
        background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`,
        color: "white",
      };
    }

    return {
      background: `linear-gradient(to right, ${primaryColor}, ${primaryColor}dd)`,
      color: "white",
    };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      {/* Backdrop with blur */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className={`relative ${cardStyles.container} ${modalSizeClasses[config.design.modalSize]} w-full p-8 transform transition-all animate-in zoom-in-95 duration-300`}
        style={cardStyles.style}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors z-10"
          aria-label="Close modal"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Discount Badge - Show prominently for checkout abandonment */}
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <div
            className="px-4 py-2 rounded-full text-white font-bold text-lg shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${config.design.primaryColor}, ${config.design.secondaryColor})`,
            }}
          >
            {config.discount.percentage}% OFF
          </div>
        </div>

        {/* Header */}
        <h2 className={`${cardStyles.header} mb-4 text-center mt-4`}>
          {config.modal.headline}
        </h2>

        {/* Body */}
        <p className={`text-lg mb-6 text-center ${config.design.cardVariation === "bold" || (config.design.cardVariation === "gradient" && config.design.useGradient) ? "text-white/90" : "text-gray-600 dark:text-gray-300"}`}>
          {formatDescription(config.modal.description)}
        </p>

        {/* Countdown Timer */}
        {config.timer.enabled && initialTime > 0 && (
          <div className="flex justify-center mb-6">
            <div className="relative w-32 h-32">
              <svg className="transform -rotate-90 w-32 h-32">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className={config.design.cardVariation === "bold" || (config.design.cardVariation === "gradient" && config.design.useGradient) ? "text-white/20" : "text-gray-200 dark:text-gray-700"}
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 56}`}
                  strokeDashoffset={`${2 * Math.PI * 56 * (1 - timeLeft / initialTime)}`}
                  style={{ color: config.design.primaryColor }}
                  className="transition-all duration-1000"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-2xl font-bold ${config.design.cardVariation === "bold" || (config.design.cardVariation === "gradient" && config.design.useGradient) ? "text-white" : "text-gray-900 dark:text-white"}`}>
                  {formatTime(timeLeft)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={handleClaim}
          disabled={isClaiming || (config.timer.enabled && timeLeft <= 0)}
          style={getButtonStyle()}
          className="w-full hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed font-bold py-4 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100 shadow-lg"
        >
          {isClaiming ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Processing...
            </span>
          ) : (
            formatCtaText(config.modal.ctaText)
          )}
        </button>

        {/* No thanks link */}
        <button
          onClick={handleClose}
          className={`w-full mt-4 text-sm transition-colors ${config.design.cardVariation === "bold" || (config.design.cardVariation === "gradient" && config.design.useGradient) ? "text-white/70 hover:text-white" : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"}`}
        >
          {config.modal.noThanksText}
        </button>
      </div>
    </div>
  );
}
