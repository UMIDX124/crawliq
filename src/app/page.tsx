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
        <SectionBridge num="01" total="06" label="problem stated" />
        <div className="bg-[color:var(--color-bg-2)]/40">
          <WatchItThink />
          <HowItWorks />
        </div>
        <SectionBridge num="02" total="06" label="mechanism shown" />
        <Features />
        <Comparison />
        <PdfPreview />
        <SectionBridge num="03" total="06" label="comparisons drawn" />
        <div className="bg-[color:var(--color-bg-2)]/40">
          <WhyBuilt />
        </div>
        <SectionBridge num="04" total="06" label="founder note" />
        <EarlyAccess />
        <Demo />
        <SectionBridge num="05" total="06" label="report sample" />
        <Pricing />
        <Faq />
        <FinalCta />
        <ReportAppendixDivider section="Appendix A · methodology" />
      </main>
      <Footer />
    </>
  );
}
