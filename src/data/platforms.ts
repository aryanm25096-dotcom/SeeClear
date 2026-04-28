export type PlatformKey =
  | "nykaa"
  | "amazon"
  | "flipkart"
  | "myntra"
  | "blinkit"
  | "firstcry"
  | "instamart";

export interface PlatformMeta {
  label: string;
  color: string;
  logo: string;
  deliveryPolicy: string;
  returnPolicy: string;
}

export const platforms: Record<PlatformKey, PlatformMeta> = {
  nykaa: {
    label: "Nykaa",
    color: "#FC2779",
    logo: "💄",
    deliveryPolicy: "Free above ₹500",
    returnPolicy: "15 days",
  },
  amazon: {
    label: "Amazon",
    color: "#FF9900",
    logo: "📦",
    deliveryPolicy: "Free with Prime",
    returnPolicy: "10 days",
  },
  flipkart: {
    label: "Flipkart",
    color: "#2874F0",
    logo: "🛒",
    deliveryPolicy: "Free above ₹500",
    returnPolicy: "7 days",
  },
  myntra: {
    label: "Myntra",
    color: "#FF3F6C",
    logo: "👗",
    deliveryPolicy: "Free above ₹799",
    returnPolicy: "30 days",
  },
  blinkit: {
    label: "Blinkit",
    color: "#F59E0B",
    logo: "⚡",
    deliveryPolicy: "₹20 flat",
    returnPolicy: "No returns",
  },
  firstcry: {
    label: "FirstCry",
    color: "#3B82F6",
    logo: "🧸",
    deliveryPolicy: "Free above ₹499",
    returnPolicy: "30 days",
  },
  instamart: {
    label: "Instamart",
    color: "#10B981",
    logo: "🛍️",
    deliveryPolicy: "₹25 flat",
    returnPolicy: "No returns",
  },
};
