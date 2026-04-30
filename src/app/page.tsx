import { Nav } from "@/components/sections/nav";
import { Hero } from "@/components/sections/hero";
import { LogoStrip } from "@/components/sections/logo-strip";
import { Problems } from "@/components/sections/problems";
import { WatchItThink } from "@/components/sections/watch-it-think";
import { HowItWorks } from "@/components/sections/how-it-works";
import { Features } from "@/components/sections/features";
import { Comparison } from "@/components/sections/comparison";
import { PdfPreview } from "@/components/sections/pdf-preview";
import { CaseStudy } from "@/components/sections/case-study";
import { Demo } from "@/components/sections/demo";
import { Testimonials } from "@/components/sections/testimonials";
import { Pricing } from "@/components/sections/pricing";
import { Faq } from "@/components/sections/faq";
import { FinalCta } from "@/components/sections/cta";
import { Footer } from "@/components/sections/footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <LogoStrip />
        <Problems />
        <WatchItThink />
        <HowItWorks />
        <Features />
        <Comparison />
        <PdfPreview />
        <CaseStudy />
        <Demo />
        <Testimonials />
        <Pricing />
        <Faq />
        <div className="hairline" />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
