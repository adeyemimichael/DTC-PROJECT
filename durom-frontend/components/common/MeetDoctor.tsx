import * as React from 'react';
import Image from 'next/image';
import { Quote } from 'lucide-react';

export function MeetDoctor() {
  const specializations = [
    'Internal Medicine',
    'Chronic Disease Management',
  ];

  const credentials = [
    {
      label: 'Medical License',
      value: 'Lagos State Medical Board',
    },
    {
      label: 'Certification',
      value: 'Royal College of Physicians',
    },
    {
      label: 'Experience',
      value: '18+ Years in Practice',
    },
    {
      label: 'Patients Served',
      value: '5,000+',
    },
  ];

  return (
    <section className="bg-secondary-blue py-16 md:py-24">
      <div className="container-brand flex flex-col gap-12 lg:flex-row lg:items-start lg:gap-16">
        
        
        <div className="flex-1 w-full max-w-xl mx-auto lg:max-w-none">
        
          <div className="relative aspect-square w-full rounded-3xl overflow-hidden shadow-sm">
            <Image
              src="/images/stephen.jpg"
              alt="Dr. Stephen Adeyemi"
              fill
              sizes="(max-width: 1024px)  100vw, 50vw"
              className="object-cover object-top"
              priority
            />
          </div>

         
          <div className="bg-black rounded-3xl p-6 md:p-8 mt-6 shadow-sm">
            <span className="text-[12px] font-bold text-white uppercase tracking-wider">
              Areas of Specialization
            </span>
            <div className="flex flex-wrap gap-4 mt-6">
              {specializations.map((spec, idx) => (
                <span
                  key={idx}
                  className="bg-primary-red text-white text-xs md:text-[13px] font-bold py-2.5 px-6 rounded-full select-none"
                >
                  {spec}
                </span>
              ))}
            </div>
          </div>
        </div>

       
        <div className="flex-1 flex flex-col justify-start">
         
          <div>
            <span className="text-[14px] font-bold text-primary-red uppercase tracking-wider">
              Meet Your Doctor
            </span>
            <h2 className="mt-3 text-[32px] sm:text-[40px] md:text-[48px] md:leading-14.5 font-medium tracking-[-0.02em] text-primary-black">
              Dr. Stephen Adeyemi
            </h2>
            <p className="mt-2 text-base md:text-lg text-primary-gray font-medium">
              MD, Internal Medicine · Lead Physician & Founder
            </p>
          </div>

          {/* Credentials Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
            {credentials.map((cred, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100/30 flex flex-col justify-center"
              >
                <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                  {cred.label}
                </span>
                <span className="text-[15px] font-medium text-primary-deepblue mt-1">
                  {cred.value}
                </span>
              </div>
            ))}
          </div>

          {/* Bio Text */}
          <p className="mt-8 text-[15px] md:text-base leading-relaxed text-primary-gray">
            Dr. Stephen founded Durom's Touch Clinic with a clear vision: healthcare should be accessible, transparent, and built around the patient — not the system. With over 18 years of clinical experience across Lagos and London, he brings a rare combination of deep medical expertise and genuine human care. After completing his medical degree at the University of Lagos and specialist training at the Royal College of Physicians, Dr. Stephen returned home to build a clinic that strips away the complexity of traditional healthcare. No long wait times. No surprise bills. Just direct, personal care when you need it.
          </p>

          {/* Quote Block */}
          <div className="bg-primary-deepblue rounded-3xl p-6 md:p-8 mt-8 flex items-center justify-between gap-6 shadow-sm">
            <p className="text-white font-medium italic text-[14px] md:text-[15px] leading-relaxed flex-1">
              "My patients deserve to know exactly what they are paying for and why. Transparency is not a feature — it is the foundation of trust."
            </p>
            <div className="w-10 h-10 rounded-full bg-primary-red flex items-center justify-center text-white shrink-0  shadow-sm">
              <Quote className="w-5 h-5 fill-black text-black rotate-180" />
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
