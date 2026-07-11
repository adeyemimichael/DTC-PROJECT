"use client";

import * as React from 'react';
import { ChevronDown } from 'lucide-react';

export function FAQ() {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);

  const faqList = [
    {
      question: 'How does the pay-as-you-go model work?',
      answer:
        'With our pay-as-you-go model, you only pay for the consultations you book. There are no recurring monthly charges or subscription plans. You pay the standard rate for each visit ($75 for General, $150 for Specialist, and $50 for Telemedicine) at the time of booking.',
    },
    {
      question: 'What is included in the one-time registration fee?',
      answer:
        'The one-time registration fee of $49 gives you lifetime access to our platform. This includes your secure patient dashboard, online appointment booking, medical records storage, prescription history, priority scheduling, and direct telemedicine access. No renewals or annual fees are ever required.',
    },
    {
      question: 'How do I book an appointment?',
      answer:
        "Booking an appointment is simple: log in to your patient dashboard, click 'Book Appointment', select your consultation type (General, Specialist, or Telemedicine), choose a convenient date and time, upload any medical files if needed, and confirm your booking by completing the consultation payment.",
    },
    {
      question: 'Is my medical information secure?',
      answer:
        'Yes, security is our top priority. Our platform is fully HIPAA and NDPR compliant. All patient records and video consultations are secured with end-to-end encryption. Your medical history and data are never sold or shared with third parties without your explicit consent.',
    },
  ];

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="bg-secondary-white py-16 md:py-24">
      <div className="container-brand">
        {/* Header Block */}
        <div className="text-center max-w-3xl mx-auto flex flex-col items-center">
          <span className="text-[14px] font-bold text-primary-red uppercase tracking-wider">
            Common Questions
          </span>
          <h2 className="mt-3 text-[32px] sm:text-[40px] md:text-[48px] md:leading-[58px] font-semibold tracking-[-0.02em] text-primary-deepblue">
            Everything You Need to Know
          </h2>
          <p className="mt-4 text-base md:text-[18px] md:leading-[28px] text-primary-gray font-medium max-w-2xl">
            Have questions? We have answers. If you can't find what you're looking for, feel free to contact us.
          </p>
        </div>

        {/* Collapsible FAQ List */}
        <div className="mt-12 max-w-3xl mx-auto w-full flex flex-col gap-4">
          {faqList.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                onClick={() => handleToggle(idx)}
                className="bg-white border border-slate-200/60 rounded-2xl p-6 cursor-pointer select-none transition-all duration-200 hover:border-slate-300 flex flex-col shadow-sm"
              >
                {/* Header Row */}
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-[15px] md:text-lg font-medium text-primary-deepblue leading-snug">
                    {item.question}
                  </h3>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 flex-shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180 text-primary-blue' : ''
                    }`}
                  />
                </div>

                {/* Smooth Expansion Answer Container */}
                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    isOpen ? 'grid-rows-[1fr] opacity-100 mt-4' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="text-primary-gray text-sm md:text-[15px] leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
