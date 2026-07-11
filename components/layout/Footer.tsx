import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Mail, Phone, MapPin } from 'lucide-react';
import { FaLinkedinIn, FaInstagram, FaWhatsapp } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const platformLinks = [
    { label: 'About', href: '#about' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Services', href: '#services' },
    { label: 'FAQs', href: '#faqs' },
  ];

  const legalLinks = [
    { label: 'Privacy Policy', href: '#privacy-policy' },
    { label: 'Terms of Service', href: '#terms-of-service' },
    { label: 'HIPAA Compliance', href: '#hipaa-compliance' },
    { label: 'Refund Policy', href: '#refund-policy' },
  ];

  const contactInfo = [
    {
      icon: Mail,
      text: 'hello@duroms.com',
      href: 'mailto:hello@duroms.com',
    },
    {
      icon: Phone,
      text: '(555) 123-4567',
      href: 'tel:+15551234567',
    },
    {
      icon: MapPin,
      text: 'Lagos, Nigeria',
      href: '#location',
    },
  ];

  const socials = [
    { icon: FaXTwitter, href: 'https://twitter.com' },
    { icon: FaLinkedinIn, href: 'https://linkedin.com' },
    { icon: FaInstagram, href: 'https://instagram.com' },
    { icon: FaWhatsapp, href: 'https://whatsapp.com' },
  ];

  return (
    <footer className="bg-white border-t border-slate-100 pt-16 pb-8">
      <div className="container-brand">
       
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 pb-12">
          
        
          <div className="flex flex-col items-start">
            {/* Logo */}
            <div className="relative w-37.5 h-10">
              <Image
                src="/images/logo.png"
                alt="Durom's Touch Clinic Logo"
                fill
                sizes="150px"
                className="object-contain object-left"
              />
            </div>
           
            <p className="mt-4 text-[14px] leading-relaxed text-primary-gray max-w-70">
              Modern healthcare with transparent pricing. Register once, pay per visit. Board-certified doctors, zero subscriptions.
            </p>
          
            <div className="flex gap-3 mt-6">
              {socials.map((social, idx) => {
                const IconComponent = social.icon;
                return (
                  <a
                    key={idx}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg bg-black text-white! flex items-center justify-center hover:opacity-85 transition-opacity duration-200"
                  >
                    <IconComponent className="w-4 h-4 text-white!" />
                  </a>
                );
              })}
            </div>
          </div>

          
          <div className="flex flex-col">
            <h4 className="text-base font-bold text-primary-deepblue select-none">
              Platform
            </h4>
            <ul className="mt-4 flex flex-col gap-3">
              {platformLinks.map((link, idx) => (
                <li key={idx}>
                  <Link
                    href={link.href}
                    className="text-sm font-medium text-primary-gray! hover:text-primary-blue! transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 - Legal Links */}
          <div className="flex flex-col">
            <h4 className="text-base font-bold text-primary-deepblue select-none">
              Legal
            </h4>
            <ul className="mt-4 flex flex-col gap-3">
              {legalLinks.map((link, idx) => (
                <li key={idx}>
                  <Link
                    href={link.href}
                    className="text-sm font-medium text-primary-gray! hover:text-primary-blue! transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="flex flex-col">
            <h4 className="text-base font-bold text-black select-none">
              Contact
            </h4>
            <ul className="mt-4 flex flex-col gap-4">
              {contactInfo.map((info, idx) => {
                const IconComponent = info.icon;
                return (
                  <li key={idx}>
                    <a
                      href={info.href}
                      className="flex items-center gap-3 text-sm font-medium text-primary-gray! hover:text-primary-blue! transition-colors duration-200"
                    >
                      <IconComponent className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <span>{info.text}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

        </div>

        {/* Bottom Area - Copyright */}
        <div className="border-t border-slate-100/80 pt-6 mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs md:text-sm font-medium text-primary-gray">
            © {currentYear} DTC. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
