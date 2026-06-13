'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';

export interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  const navLinks = [
    { name: 'About', href: '#about' },
    { name: 'Service', href: '#service' },
    { name: 'Our Doctor', href: '#doctor' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'FAQ', href: '#faq' },
  ];

  return (
    <header className={cn("sticky top-0 z-50 w-full  bg-white backdrop-blur-md", className)}>
      <div className="container-brand flex h-20 items-center justify-between">
    
        <Link href="/" className="flex items-center">
          <Image
            src="/images/logo.png"
            alt="Durom's Touch Clinic Logo"
            width={160}
            height={40}
            className="h-10 w-auto object-contain"
            priority
          />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-base font-small text-secondary-gray transition-colors duration-200 hover:text-primary-gray dark:text-zinc-300 "
            >
              {link.name}
            </Link>
          ))}
        </nav>

      
        <div className="hidden items-center gap-4 md:flex">
          <Link href="#login">
            <Button variant="outline" size="md">
              Log In
            </Button>
          </Link>
          <Link href="#register">
            <Button variant="primary" size="md">
              Register Now
            </Button>
          </Link>
        </div>

        
        <button
          onClick={toggleMobileMenu}
          className="flex h-10 w-10 items-center justify-center rounded-lg  text-primary-deepblue hover:bg-secondary-50 md:hidden  "
          aria-label="Toggle navigation menu"
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? (
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16m-7 6h7"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Menu Panel */}
      {isMobileMenuOpen && (
        <div className="absolute top-20 left-0 w-full  bg-white/80 px-6 py-6 shadow-md transition-all duration-300 md:hidden 5 backdrop-blur-md ">
          <nav className="flex flex-col gap-5">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-lg font-medium text-primary-deepblue transition-colors duration-200 hover:text-primary-blue dark:text-zinc-300 dark:hover:text-primary-blue"
              >
                {link.name}
              </Link>
            ))}
            
         
            
            {/* Mobile Actions */}
            <div className="flex flex-col gap-4">
              <Link href="#login" onClick={() => setIsMobileMenuOpen(false)} className="w-full">
                <Button variant="outline" className="w-full">
                  Log In
                </Button>
              </Link>
              <Link href="#register" onClick={() => setIsMobileMenuOpen(false)} className="w-full">
                <Button variant="primary" className="w-full">
                  Register Now
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
