import type { Metadata } from "next";
import TermsContent from "./TermsContent";

export const metadata: Metadata = {
  title: "Terms of Service — Delegare",
  description:
    "Delegare Terms of Service. Rules governing use of spending delegates, merchant accounts, and the Delegare payment infrastructure.",
  alternates: {
    canonical: "https://delegare.dev/legal/terms/",
  },
};

export default function TermsPage() {
  return <TermsContent />;
}
