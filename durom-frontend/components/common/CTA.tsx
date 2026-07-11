import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui';

export function CTA() {
  return (
    <section className="bg-black py-16 md:py-24">
      <div className="container-brand max-w-4xl mx-auto flex flex-col items-center text-center">
        
        <h2 className="text-[32px] sm:text-[40px] md:text-[48px] md:leading-14.5 font-medium tracking-[-0.02em] text-white">
          Ready to Get Started?
        </h2>

      
        <p className="mt-4 text-base md:text-[18px] md:leading-7 text-zinc-400 font-medium max-w-2xl">
          Join thousands of patients who have switched to simpler, transparent healthcare. One registration. Zero subscriptions.
        </p>

    
        <div className="mt-8">
          <Link href="#register">
            <Button variant="primary" size="md" className="min-w-38.5 shadow-sm">
              Register Now
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
