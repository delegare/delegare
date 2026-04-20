import type { Metadata } from "next";
import PrivacyContent from "./PrivacyContent";

export const metadata: Metadata = {
  title: "Privacy Policy — Delegare",
  description:
    "Learn how Delegare collects, uses, and protects your data. We never store card numbers or wallet seeds — only masked summaries.",
  alternates: {
    canonical: "https://delegare.dev/legal/privacy/",
  },
};

export default function PrivacyPage() {
  return <PrivacyContent />;
}
