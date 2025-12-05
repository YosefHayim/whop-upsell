"use client";

import { useEffect, useState } from "react";

interface DownsellModalProps {
  onClose: () => void;
  onClaim: () => void;
  initialTime?: number; // seconds, default 300 (5 minutes)
}

export default function DownsellModal({ onClose, onClaim, initialTime = 300 }: DownsellModalProps) {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isClaiming, setIsClaiming] = useState(false);

  useEffect(() => {
    if (timeLeft <= 0) {
      onClose();
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
  }, [timeLeft, onClose]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleClaim = async () => {
    setIsClaiming(true);
    try {
      await onClaim();
    } catch (error) {
      console.error("Error claiming discount:", error);
      setIsClaiming(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with blur */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-8 transform transition-all">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          aria-label="Close modal"
        >
          <svg className="w-6 h-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 text-center">Wait! You forgot this...</h2>

        {/* Body */}
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 text-center">
          Complete your order in the next <span className="font-semibold text-blue-600 dark:text-blue-400">{formatTime(timeLeft)}</span> and get{" "}
          <span className="font-bold text-green-600 dark:text-green-400">10% OFF</span>.
        </p>

        {/* Countdown Timer */}
        <div className="flex justify-center mb-6">
          <div className="relative w-32 h-32">
            <svg className="transform -rotate-90 w-32 h-32">
              <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="none" className="text-gray-200 dark:text-gray-700" />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 56}`}
                strokeDashoffset={`${2 * Math.PI * 56 * (1 - timeLeft / initialTime)}`}
                className="text-blue-600 dark:text-blue-400 transition-all duration-1000"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">{formatTime(timeLeft)}</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleClaim}
          disabled={isClaiming || timeLeft <= 0}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed shadow-lg"
        >
          {isClaiming ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Processing...
            </span>
          ) : (
            "Claim 10% Discount Now"
          )}
        </button>

        {/* No thanks link */}
        <button
          onClick={onClose}
          className="w-full mt-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-sm transition-colors"
        >
          No, thanks
        </button>
      </div>
    </div>
  );
}
