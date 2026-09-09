import * as React from 'react';
import Image from 'next/image';
import { Quote } from 'lucide-react';

export function MeetDoctor() {
  const specializations = [
    'Family Medicine',
    'Primary Care',
  ];

  const credentials = [
    {
      label: 'Medical License',
      value: 'Medical and Dental Council of Nigeria (MDCN)',
    },
    {
      label: 'Postgraduate',
      value: 'FMCFM, MWACP',
    },
    {
      label: 'Experience',
      value: '15+ Years in Practice',
    },
    {
      label: 'Additional Training',
      value: 'Leadership & Management in Health',
    },
  ];

  return (
    <section className="bg-secondary-blue py-16 md:py-24">
      <div className="container-brand flex flex-col gap-12 lg:flex-row lg:items-start lg:gap-16">
        
        
        <div className="flex-1 w-full max-w-xl mx-auto lg:max-w-none">
        
          <div className="relative aspect-square w-full rounded-3xl overflow-hidden shadow-sm">
            <Image
              src="/images/stephen.jpg"
              alt="Dr. Stephen Oguntoye"
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
              Dr. Stephen Oguntoye
            </h2>
            <p className="mt-2 text-base md:text-lg text-primary-gray font-medium">
              MBBS, FMCFM, MWACP · Consultant Family Physician
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
            Dr. Stephen Oguntoye is a dedicated Consultant Family Physician with 15 years of medical practice. Having served diverse communities in both rural and urban areas, he understands the unique health challenges individuals face across different walks of life. Dr. Stephen is known for his excellent, compassionate care and clear communication, making patients feel heard, valued, and comfortable during every digital consultation. With additional training in Leadership and Management in Health from the University of Washington, he brings both clinical expertise and a patient-centered approach to healthcare delivery.
          </p>

          {/* Quote Block */}
          <div className="bg-primary-deepblue rounded-3xl p-6 md:p-8 mt-8 flex items-center justify-between gap-6 shadow-sm">
            <p className="text-white font-medium italic text-[14px] md:text-[15px] leading-relaxed flex-1">
              "Quality healthcare should be accessible to everyone, regardless of where they are. My goal is to ensure every patient feels heard, understood, and cared for."
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
