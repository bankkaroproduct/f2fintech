import type { Metadata } from "next";
import CardGeniusCategory from "@/views/CardGeniusCategory";

export const metadata: Metadata = {
  robots: 'noindex, follow',
  alternates: { canonical: 'https://f2fintech.com/cg-360' },
};

export default function CardGeniusCategoryPage() {
  return <CardGeniusCategory />;
}
