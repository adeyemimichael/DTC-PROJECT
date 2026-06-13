import { Header, Footer } from '@/components/layout';
import { Hero, TrustBar, Services, HowItWorks, MeetDoctor, Pricing, FAQ, CTA } from '@/components/common';

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black animate-page-fade">
      {/* Header component */}
      <Header />

      {/* Main content */}
      <main>
        <Hero />
        <TrustBar />
        <Services />
        <HowItWorks />
        <MeetDoctor />
        <Pricing />
        <FAQ />
        <CTA />
      </main>

      {/* Footer component */}
      <Footer />
    </div>
  );
}
