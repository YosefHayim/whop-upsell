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
    cardVariation: "minimal" | "bold" | "gradient" | "card" | "modern" | "classic";
    backgroundColor?: string; // Modal background color
    textColor?: string; // Main text color
    accentColor?: string; // Accent highlights
    useGradient?: boolean; // Use gradient backgrounds
    borderStyle?: "none" | "solid" | "dashed" | "shadow"; // Border style
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
    cardVariation: "modern", // Default to modern style
    backgroundColor: "#ffffff", // White background
    textColor: "#111827", // Gray-900
    accentColor: "#f59e0b", // Amber-500 for highlights
    useGradient: false,
    borderStyle: "shadow",
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
    design: {
      ...defaultConfig.design,
      ...partial.design,
      // Ensure all design fields have defaults
      primaryColor: partial.design?.primaryColor || defaultConfig.design.primaryColor,
      secondaryColor: partial.design?.secondaryColor || defaultConfig.design.secondaryColor,
      modalSize: partial.design?.modalSize || defaultConfig.design.modalSize,
      cardVariation: partial.design?.cardVariation || defaultConfig.design.cardVariation,
      backgroundColor: partial.design?.backgroundColor || defaultConfig.design.backgroundColor,
      textColor: partial.design?.textColor || defaultConfig.design.textColor,
      accentColor: partial.design?.accentColor || defaultConfig.design.accentColor,
      useGradient: partial.design?.useGradient ?? defaultConfig.design.useGradient,
      borderStyle: partial.design?.borderStyle || defaultConfig.design.borderStyle,
    },
    productSelection: { ...defaultConfig.productSelection, ...partial.productSelection },
  };
}
