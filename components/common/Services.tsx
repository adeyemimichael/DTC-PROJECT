import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function Services() {
  const serviceList = [
    {
      title: 'General Consultation',
      description: 'Comprehensive health assessments, preventive care, and treatment for common illnesses. No commitment, book when you need it.',
      image: '/images/serviceimage1.jpg',
      link: '#general-consultation',
    },
    {
      title: 'Specialist Care',
      description: 'Expert diagnosis and treatment from board-certified specialists. Advanced care on demand, only pay when you visit.',
      image: '/images/serviceimage.jpg',
      link: '#specialist-care',
    },
    {
      title: 'Telemedicine',
      description: 'Virtual consultations from anywhere. Secure video calls with digital prescriptions. The most affordable way to connect with our doctors.',
      image: '/images/serviceimage2.jpg',
      link: '#telemedicine',
    },
  ];

  return (
    <section className="bg-secondary-white py-16 md:py-24">
      <div className="container-brand">
        {/* Header Block */}
        <div className="text-center max-w-3xl mx-auto flex flex-col items-center">
          <span className="text-[14px] font-semibold text-primary-red uppercase tracking-wider">
            Our Services
          </span>
          <h2 className="mt-3 text-[32px] sm:text-[40px] md:text-[48px] md:leading-14.5 font-sans tracking-[-0.02em] text-black">
            Care For Every Stage of Life
          </h2>
          <p className="mt-4 text-base md:text-[18px] md:leading-7 text-primary-gray font-medium max-w-2xl">
            From routine check-ups to specialist consultations. Book when you need us, pay only for what you use.
          </p>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 md:mt-16">
          {serviceList.map((service, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100/50 hover:shadow-md transition-shadow duration-300 flex flex-col"
            >
              {/* Card Image */}
              <div className="relative h-55 w-full overflow-hidden">
                <Image
                  src={service.image}
                  alt={service.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>

              {/* Card Content */}
              <div className="p-6 md:p-8 flex flex-col flex-1">
                <h3 className="text-xl font-bold text-primary-deepblue leading-snug">
                  {service.title}
                </h3>
                <p className="mt-3 text-primary-gray text-[14px] md:text-[15px] leading-relaxed flex-1">
                  {service.description}
                </p>
                <div className="mt-6 pt-2">
                  <Link
                    href={service.link}
                    className="inline-flex items-center gap-2 text-primary-red! font-semibold text-sm md:text-base group hover:text-primary-red/80! transition-colors duration-200"
                  >
                    <span>Book This Service</span>
                    <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
