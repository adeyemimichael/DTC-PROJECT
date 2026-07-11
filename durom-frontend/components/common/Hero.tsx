import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui';

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-white py-12 md:py-20 lg:py-24 ">
      <div className="container-brand flex flex-col gap-12 lg:flex-row lg:items-center lg:justify-between lg:gap-16">
        {/* Left Column - Content */}
        <div className="flex flex-col flex-1 items-start text-left">
          {/* Brand Tag */}
          <span className="text-[14px] leading-5 font-semibold text-primary-red uppercase tracking-wider">
            No Subscriptions. No Hidden Fees.
          </span>
               <div>
                <h1 className="mt-4 text-4xl font-extrabold tracking-[-0.02em] text-black sm:text-5xl md:text-[56px] md:leading-17">
            Healthcare{' '}
         
            
          </h1>
                <h1 className="block text-primary-blue  mt-1 font-extrabold tracking-[-0.02em] sm:text-5xl md:text-[56px] md:leading-17">
              Without The Hassle
            </h1>
               </div>
          

          {/* Description Subheading */}
          <p className="mt-4 text-lg font-medium text-primary-gray sm:text-[20px] sm:leading-8 line-height-8 max-w-xl">
            Durom&apos;s Touch Clinic connects you with Dr. Stephen for consultations, prescriptions, and follow-ups — entirely from home. Quality care made truly accessible.
          </p>

          {/* Call-to-Actions (CTAs) */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link href="#register">
              <Button variant="primary" size="md" className="min-w-38.5 shadow-sm">
                Register Now
              </Button>
            </Link>
            <Link href="#pricing">
              <Button variant="outline" size="md" className="min-w-38.5">
                See Pricing
              </Button>
            </Link>
          </div>

          {/* Trust Badges List */}
          <div className="mt-6 w-full pt-4 ">
            <ul className="flex flex-wrap items-center gap-y-4 gap-x-6 text-sm font-medium text-primary-gray ">
           
              <li className="flex items-center gap-2">
               
                <span>Board Certified |</span>
              </li>
              
             

              {/* Trust Badge 2 */}
              <li className="flex items-center gap-2">
               
                <span>5,000+ Patients |</span>
              </li>

             

              {/* Trust Badge 3 */}
              <li className="flex items-center gap-2">
               
                <span>Top Rated Clinic |</span>
              </li>
              {/* Trust Badge 4 */}
              <li className="flex items-center gap-2">

                <span>HIPAA Compliant</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Column - Hero Image */}
        <div className="relative flex flex-1 items-center justify-center lg:justify-end">
          {/* Subtle background container graphic for depth */}
          <div className="absolute right-0 top-1/2 -z-10 h-[80%] w-[85%] -translate-y-1/2 rounded-4xl bg-linear-to-tr from-secondary-blue/50 to-secondary-blue/20 dark:from-zinc-900/50 dark:to-zinc-900/10"></div>
          
          <Image
            src="/images/Hero-Image(1).png"
            alt="Dr. Stephen Adeyemi at Durom's Touch Clinic"
            width={630}
            height={550}
            className="w-full max-w-157.5` h-auto object-contain"
            priority={true}
          />
        </div>
      </div>
    </section>
  );
}
