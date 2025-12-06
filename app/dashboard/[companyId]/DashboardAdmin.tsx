"use client";

import { useEffect, useState } from "react";

import type { DownsellConfig } from "@/lib/config";
import { defaultConfig } from "@/lib/config";

interface DashboardAdminProps {
  companyId: string;
  userId: string;
}

export default function DashboardAdmin({ companyId, userId }: DashboardAdminProps) {
  const [config, setConfig] = useState<DownsellConfig>(defaultConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    loadConfig();
    loadAnalytics();
  }, []);

  const loadConfig = async () => {
    try {
      const response = await fetch(`/api/config?companyId=${companyId}`);
      if (response.ok) {
        const data = (await response.json()) as DownsellConfig;
        setConfig(data);
      }
    } catch (error) {
      console.error("Error loading config:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      const response = await fetch("/api/analytics?days=30");
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error("Error loading analytics:", error);
    }
  };

  const saveConfig = async () => {
    setSaving(true);
    setSaveMessage(null);
    try {
      const response = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          config,
          companyId,
        }),
      });

      if (response.ok) {
        setSaveMessage("Configuration saved successfully!");
        setTimeout(() => setSaveMessage(null), 3000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save configuration");
      }
    } catch (error) {
      setSaveMessage("Error saving configuration. Please try again.");
      console.error("Error saving config:", error);
    } finally {
      setSaving(false);
    }
  };

  const updateConfig = <K extends keyof DownsellConfig>(key: K, value: DownsellConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const updateNestedConfig = <K extends keyof DownsellConfig, SK extends keyof DownsellConfig[K]>(key: K, subKey: SK, value: DownsellConfig[K][SK]) => {
    setConfig((prev) => ({
      ...prev,
      [key]: { ...prev[key], [subKey]: value },
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-lg">Loading configuration...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Downsell Configuration Dashboard</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Company ID: <code className="font-mono">{companyId}</code>
            </p>
          </div>

          {saveMessage && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                saveMessage.includes("Error")
                  ? "bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200"
                  : "bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200"
              }`}
            >
              {saveMessage}
            </div>
          )}

          {/* Exit Intent Settings */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Exit Intent Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Inactivity Delay (milliseconds)</label>
                <input
                  type="number"
                  value={config.exitIntent.inactivityDelay}
                  onChange={(e) => updateNestedConfig("exitIntent", "inactivityDelay", parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Mouse Threshold (pixels from top)</label>
                <input
                  type="number"
                  value={config.exitIntent.mouseThreshold}
                  onChange={(e) => updateNestedConfig("exitIntent", "mouseThreshold", parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.exitIntent.enabled}
                  onChange={(e) => updateNestedConfig("exitIntent", "enabled", e.target.checked)}
                  className="mr-2"
                />
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Enable Exit Intent Detection</label>
              </div>
            </div>
          </section>

          {/* Modal Content */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Modal Content</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Headline</label>
                <input
                  type="text"
                  value={config.modal.headline}
                  onChange={(e) => updateNestedConfig("modal", "headline", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description (use {"{time}"} and {"{discount}"} as placeholders)
                </label>
                <textarea
                  value={config.modal.description}
                  onChange={(e) => updateNestedConfig("modal", "description", e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">CTA Button Text (use {"{discount}"} as placeholder)</label>
                <input
                  type="text"
                  value={config.modal.ctaText}
                  onChange={(e) => updateNestedConfig("modal", "ctaText", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">"No Thanks" Text</label>
                <input
                  type="text"
                  value={config.modal.noThanksText}
                  onChange={(e) => updateNestedConfig("modal", "noThanksText", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </section>

          {/* Discount Settings */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Discount Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Discount Percentage</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={config.discount.percentage}
                  onChange={(e) => updateNestedConfig("discount", "percentage", parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Promo Code</label>
                <input
                  type="text"
                  value={config.discount.promoCode}
                  onChange={(e) => updateNestedConfig("discount", "promoCode", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </section>

          {/* Timer Settings */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Timer Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Timer Duration (seconds)</label>
                <input
                  type="number"
                  min="0"
                  value={config.timer.duration}
                  onChange={(e) => updateNestedConfig("timer", "duration", parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.timer.enabled}
                  onChange={(e) => updateNestedConfig("timer", "enabled", e.target.checked)}
                  className="mr-2"
                />
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Enable Countdown Timer</label>
              </div>
            </div>
          </section>

          {/* Display Rules */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Display Rules</h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.displayRules.showOncePerSession}
                  onChange={(e) => updateNestedConfig("displayRules", "showOncePerSession", e.target.checked)}
                  className="mr-2"
                />
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Show Once Per Session</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.displayRules.showOncePerDay}
                  onChange={(e) => updateNestedConfig("displayRules", "showOncePerDay", e.target.checked)}
                  className="mr-2"
                />
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Show Once Per Day</label>
              </div>
            </div>
          </section>

          {/* Design Customization */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Design Customization</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Primary Color (hex)</label>
                <input
                  type="color"
                  value={config.design.primaryColor}
                  onChange={(e) => updateNestedConfig("design", "primaryColor", e.target.value)}
                  className="w-full h-12 border border-gray-300 dark:border-gray-600 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Secondary Color (hex)</label>
                <input
                  type="color"
                  value={config.design.secondaryColor}
                  onChange={(e) => updateNestedConfig("design", "secondaryColor", e.target.value)}
                  className="w-full h-12 border border-gray-300 dark:border-gray-600 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Modal Size</label>
                <select
                  value={config.design.modalSize}
                  onChange={(e) => updateNestedConfig("design", "modalSize", e.target.value as "sm" | "md" | "lg")}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="sm">Small</option>
                  <option value="md">Medium</option>
                  <option value="lg">Large</option>
                </select>
              </div>
            </div>
          </section>

          {/* Analytics Summary */}
          {analytics && (
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Analytics (Last 30 Days)</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <div className="text-sm text-blue-600 dark:text-blue-400">Modal Shown</div>
                  <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{analytics.summary.totalModalShown}</div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <div className="text-sm text-green-600 dark:text-green-400">Claim Clicked</div>
                  <div className="text-2xl font-bold text-green-900 dark:text-green-100">{analytics.summary.totalClaimClicked}</div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                  <div className="text-sm text-purple-600 dark:text-purple-400">Conversion Rate</div>
                  <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">{analytics.summary.conversionRate.toFixed(1)}%</div>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                  <div className="text-sm text-orange-600 dark:text-orange-400">Checkout Rate</div>
                  <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">{analytics.summary.checkoutRate.toFixed(1)}%</div>
                </div>
              </div>
            </section>
          )}

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={saveConfig}
              disabled={saving}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors"
            >
              {saving ? "Saving..." : "Save Configuration"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
