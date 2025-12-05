// Configuration types and default values
export interface DownsellConfig {
  // Exit Intent Settings
  exitIntent: {
    inactivityDelay: number; // milliseconds
    mouseThreshold: number; // pixels from top
    enabled: boolean;
  };

  // Modal Content
  modal: {
    headline: string;
    description: string;
    ctaText: string;
    noThanksText: string;
  };

  // Discount Settings
  discount: {
    percentage: number;
    promoCode: string;
    expiration?: number; // timestamp
  };

  // Timer Settings
  timer: {
    duration: number; // seconds
    enabled: boolean;
  };

  // Display Rules
  displayRules: {
    showOncePerSession: boolean;
    showOncePerDay: boolean;
    frequencyCap?: number; // max times per user lifetime
  };

  // Design Customization
  design: {
    primaryColor: string;
    secondaryColor: string;
    modalSize: "sm" | "md" | "lg";
  };

  // Product/Plan Selection
  productSelection: {
    defaultProductId?: string;
    defaultPlanId?: string;
    productMapping?: Record<string, string>; // entry product -> downsell product
  };
}

export const defaultConfig: DownsellConfig = {
  exitIntent: {
    inactivityDelay: 20000, // 20 seconds
    mouseThreshold: 50, // 50px
    enabled: true,
  },
  modal: {
    headline: "Wait! You forgot this...",
    description: "Complete your order in the next {time} and get {discount} OFF.",
    ctaText: "Claim {discount} Discount Now",
    noThanksText: "No, thanks",
  },
  discount: {
    percentage: 10,
    promoCode: "SAVE10",
  },
  timer: {
    duration: 300, // 5 minutes
    enabled: true,
  },
  displayRules: {
    showOncePerSession: true,
    showOncePerDay: false,
  },
  design: {
    primaryColor: "#2563eb", // blue-600
    secondaryColor: "#10b981", // green-500
    modalSize: "md",
  },
  productSelection: {},
};

// Helper function to merge config with defaults
export function mergeConfig(partial: Partial<DownsellConfig>): DownsellConfig {
  return {
    ...defaultConfig,
    ...partial,
    exitIntent: { ...defaultConfig.exitIntent, ...partial.exitIntent },
    modal: { ...defaultConfig.modal, ...partial.modal },
    discount: { ...defaultConfig.discount, ...partial.discount },
    timer: { ...defaultConfig.timer, ...partial.timer },
    displayRules: { ...defaultConfig.displayRules, ...partial.displayRules },
    design: { ...defaultConfig.design, ...partial.design },
    productSelection: { ...defaultConfig.productSelection, ...partial.productSelection },
  };
}
