import * as React from 'react';

export function HowItWorks() {
  const steps = [
    {
      number: '1',
      title: 'Register & pay setup fee',
      description: 'Create your secure patient account, complete your health profile, and pay the one-time registration fee. This is a single payment that gives you lifetime access to the platform.',
    },
    {
      number: '2',
      title: 'Book & pay per consultation',
      description: "Choose a date, pick your consultation type, and upload any relevant files. Pay only for the specific consultation you're booking — no subscription, no recurring charge.",
    },
    {
      number: '3',
      title: 'Receive care & documentation',
      description: 'Consult with Dr. Stephen and receive your diagnosis, prescriptions, and medical files directly to your secure patient dashboard — free of charge after consultation.',
    },
  ];

  return (
    <section className="bg-white py-16 md:py-24">
      <div className="container-brand">
        {/* Header Block */}
        <div className="text-center max-w-3xl mx-auto flex flex-col items-center">
          <span className="text-[14px] font-semibold text-primary-red uppercase tracking-wider">
            How It Works
          </span>
          <h2 className="mt-3 text-[32px] sm:text-[40px] md:text-[48px] md:leading-14.5 font-sans tracking-[-0.02em] text-black">
            Three steps to better health
          </h2>
          <p className="mt-4 text-base md:text-[18px] md:leading-7 text-primary-gray font-medium max-w-2xl">
            Getting quality care has never been simpler. Register once, then book and pay only when you need care.
          </p>
        </div>

      
        <div className="border border-slate-200/70   rounded-3xl grid grid-cols-1 divide-y divide-slate-200/70 md:grid-cols-3 md:divide-y-0 md:divide-x md:divide-slate-200/70 bg-white shadow-sm mt-12 md:mt-16 overflow-hidden">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="p-8 md:p-10 lg:p-12 flex flex-col items-start gap-2 hover:bg-slate-50/30 transition-colors duration-200"
            >
             
              <div className="w-10 h-10 rounded-full bg-secondary-blue flex items-center justify-center text-primary-blue font-bold text-base select-none">
                {step.number}
              </div>

             
              <h3 className="mt-6 text-lg md:text-xl font-semibold text-primary-deepblue leading-snug">
                {step.title}
              </h3>

              
              <p className="mt-4 text-primary-gray text-[14px] md:text-[15px] leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
