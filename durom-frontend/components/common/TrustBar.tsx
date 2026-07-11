import * as React from 'react';
import { Lock, Shield, Ban, Check, Tag } from 'lucide-react';

export function TrustBar() {
  const badges = [
    {
      icon: Lock,
      text: 'End-to-end encrypted',
    },
    {
      icon: Shield,
      text: 'NDPR compliant',
    },
    {
      icon: Ban,
      text: 'Data never sold',
    },
    {
      icon: Check,
      text: 'Licensed by NMC',
    },
    {
      icon: Tag,
      text: 'Transparent pricing',
    },
  ];

  return (
    <section className="bg-secondary-blue py-8 ">
      <div className="container-brand flex flex-wrap items-center justify-center gap-y-4 gap-x-8 md:gap-x-12 lg:gap-x-16">
        {badges.map((badge, idx) => {
          const IconComponent = badge.icon;
          return (
            <div
              key={idx}
              className="flex items-center gap-2 text-primary-blue font-semibold text-[14px] md:text-base leading-none transition-colors duration-200 hover:text-primary-deepblue "
            >
              <IconComponent className="w-5 h-5 shrink-0  font-sans" strokeWidth={2.2} />
              <span>{badge.text}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
