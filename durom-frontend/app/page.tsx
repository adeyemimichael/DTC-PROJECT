import { Header } from '@/components/layout';
import { Hero, TrustBar, Services, HowItWorks, MeetDoctor } from '@/components/common';

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black">
      {/* Header component */}
      <Header />

      {/* Main content */}
      <main>
        <Hero />
        <TrustBar />
        <Services />
        <HowItWorks />
        <MeetDoctor />
      </main>
    </div>
  );
}
