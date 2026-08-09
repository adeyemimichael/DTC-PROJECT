import * as React from 'react';
import { Check, Stethoscope } from 'lucide-react';

export function Pricing() {
  const step1Features = [
    'Secure patient dashboard',
    'Online appointment booking',
    'Medical records storage',
    'Prescription history',
    'Priority scheduling',
    'Telemedicine access',
  ];

  const step2Consultations = [
    {
      title: 'General Consultation',
      duration: '30 minutes',
      price: '$75',
      accent: false,
    },
    {
      title: 'Specialist Care',
      duration: '45 minutes',
      price: '$150',
      accent: true,
    },
    {
      title: 'Telemedicine',
      duration: '20 minutes',
      price: '$50',
      accent: false,
    },
  ];

  return (
    <section className="bg-white py-16 md:py-24">
      <div className="container-brand">
        {/* Header Block */}
        <div className="text-center max-w-3xl mx-auto flex flex-col items-center">
          <span className="text-[14px] font-bold text-primary-red uppercase tracking-wider">
            Transparent Pricing
          </span>
          <h2 className="mt-3 text-[32px] sm:text-[40px] md:text-[48px] md:leading-14.5 font-medium tracking-[-0.02em] text-primary-black">
            Pay Once. Then Pay Per Visit.
          </h2>
          <p className="mt-4 text-base md:text-[18px] md:leading-7 text-primary-gray font-medium max-w-2xl">
            No monthly subscriptions. No surprise bills. Just a simple one-time registration fee to join the platform, then pay only for the consultations you book.
          </p>
        </div>

      
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 md:mt-16 max-w-5xl mx-auto w-full">
          
         
          <div className="bg-black rounded-3xl p-8 md:p-10 flex flex-col text-white shadow-md relative overflow-hidden">
          
            <span className="bg-zinc-800 text-zinc-300 text-xs font-bold py-1.5 px-3.5 rounded-full inline-block self-start select-none">
              Step 1
            </span>

            {/* Title & Desc */}
            <h3 className="mt-6 text-2xl md:text-3xl font-semibold tracking-tight">
              Account Registration
            </h3>
            <p className="mt-2 text-sm text-zinc-400 font-medium">
              Unlock lifetime access to our platform
            </p>

            {/* Price */}
            <div className="mt-8 flex items-baseline gap-2">
              <span className="text-4xl md:text-5xl font-medium tracking-tight">
                $49
              </span>
              <span className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
                one-time fee
              </span>
            </div>

            {/* Features List */}
            <ul className="mt-5 flex flex-col gap-4  pt-8">
              {step1Features.map((feat, idx) => (
                <li key={idx} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary-red flex items-center justify-center text-white shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3.5]" />
                  </div>
                  <span className="text-sm md:text-base font-semibold text-zinc-200">
                    {feat}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          
          <div className="bg-white rounded-3xl p-8 md:p-10 flex flex-col border border-slate-200/60 shadow-md">
            {/* Step Tag */}
            <span className="bg-secondary-blue text-primary-blue text-xs font-bold py-1.5 px-3.5 rounded-full inline-block self-start select-none">
              Step 2
            </span>

       
            <h3 className="mt-6 text-2xl md:text-3xl font-semibold tracking-tight text-primary-black">
              Per Consultation
            </h3>
            <p className="mt-2 text-sm text-primary-gray font-medium">
              Only pay when you book an appointment. No recurring charges.
            </p>

          
            <div className="mt-8 flex flex-col gap-4 border-t border-slate-100 pt-8">
              {step2Consultations.map((option, idx) => (
                <div
                  key={idx}
                  className={`p-4 md:p-5 flex items-center justify-between border rounded-2xl transition-all duration-200 hover:shadow-sm ${
                    option.accent
                      ? 'border-primary-red/35 bg-white'
                      : 'border-slate-200/60 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Stethoscope Icon Container */}
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        option.accent
                          ? 'bg-[#FFDFDF] text-primary-red'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <Stethoscope className="w-5 h-5" />
                    </div>
                    {/* Text Details */}
                    <div>
                      <h4 className="font-bold text-primary-deepblue text-[15px] md:text-base leading-snug">
                        {option.title}
                      </h4>
                      <p className="text-xs md:text-sm text-primary-gray font-medium mt-0.5">
                        {option.duration}
                      </p>
                    </div>
                  </div>

                  {/* Price */}
                  <span className="font-medium text-md md:text-lg text-primary-deepblue">
                    {option.price}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
