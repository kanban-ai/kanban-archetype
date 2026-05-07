import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { Features } from "@/components/sections/Features";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { CTA } from "@/components/sections/CTA";
import { FAQ } from "@/components/sections/FAQ";
import { buildMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = buildMetadata({
  title: siteConfig.tagline,
  path: "/",
});

export default function HomePage() {
  return (
    <>
      <Header />
      <main id="main" tabIndex={-1}>
        <Hero />
        <Features />
        <HowItWorks />
        <CTA />
        <FAQ />
      </main>
      <Footer />
    </>
  );
}
