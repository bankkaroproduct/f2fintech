import { Suspense } from "react";
import type { Metadata } from "next";
import HomeLanding from "@/views/HomeLanding";
import { brandConfig } from "@/config/brand.config";

export const metadata: Metadata = {
  title: `${brandConfig.name} — Smart Credit Card Advisor`,
  description: `${brandConfig.name} — AI-powered credit card recommendations. Find India's best cards for rewards, travel, cashback, and lifestyle.`,
  robots: "index, follow",
  alternates: { canonical: process.env.NEXT_PUBLIC_APP_URL || "https://f2fintech.com" },
};

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeLanding />
    </Suspense>
  );
}
