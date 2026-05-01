import { Nav } from "@/components/sections/nav";
import { Hero } from "@/components/sections/hero";
import { DataSourcesStrip } from "@/components/sections/data-sources-strip";
import { Problems } from "@/components/sections/problems";
import { WatchItThink } from "@/components/sections/watch-it-think";
import { HowItWorks } from "@/components/sections/how-it-works";
import { Features } from "@/components/sections/features";
import { Comparison } from "@/components/sections/comparison";
import { PdfPreview } from "@/components/sections/pdf-preview";
import { EarlyAccess } from "@/components/sections/early-access";
import { Demo } from "@/components/sections/demo";
import { Pricing } from "@/components/sections/pricing";
import { Faq } from "@/components/sections/faq";
import { FinalCta } from "@/components/sections/cta";
import { Footer } from "@/components/sections/footer";
import { WhyBuilt } from "@/components/sections/why-built";
import { SectionBridge } from "@/components/section-bridge";
import { ReportTopBar, ReportAppendixDivider } from "@/components/report-chrome";
import { LiveAuditMargin } from "@/components/live-audit-margin";

export default function Home() {
  return (
    <>
      <ReportTopBar />
      <Nav />
      <LiveAuditMargin />
      <main>
        <Hero />
        <DataSourcesStrip />
        <Problems />
        <SectionBridge />
        <WatchItThink />
        <HowItWorks />
        <SectionBridge />
        <Features />
        <Comparison />
        <PdfPreview />
        <SectionBridge />
        <WhyBuilt />
        <SectionBridge />
        <EarlyAccess />
        <Demo />
        <SectionBridge />
        <Pricing />
        <Faq />
        <FinalCta />
        <ReportAppendixDivider section="Appendix A · methodology" />
      </main>
      <Footer />
    </>
  );
}
