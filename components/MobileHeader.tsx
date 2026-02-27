'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function MobileHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/report', label: 'Report' },
    { href: '/admin', label: 'Admin' }
  ];

  return (
    <header className='bg-white border-b border-gray-200 sticky top-0 z-40'>
      <div className='max-w-5xl mx-auto px-4 sm:px-6'>
        <div className='flex items-center justify-between h-14 sm:h-16'>
          <a href='/' className='hover:opacity-80 transition-opacity'>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src='/icons/lbbd-logo.svg'
              alt='London Borough of Barking and Dagenham'
              className='h-8 sm:h-10 w-auto'
            />
          </a>

          {/* Desktop nav */}
          <nav className='hidden sm:flex items-center gap-4 text-sm font-semibold text-[#0b0c0c]'>
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`hover:text-[#a50032] transition-colors py-2 ${
                  pathname === link.href ? 'text-[#a50032]' : ''
                } ${link.href === '/admin' ? 'text-gray-500' : ''}`}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Mobile hamburger */}
          <button
            type='button'
            onClick={() => setMenuOpen(!menuOpen)}
            className='sm:hidden flex items-center justify-center w-10 h-10 -mr-2 rounded-md 
                       text-[#0b0c0c] hover:bg-gray-100 transition-colors
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffdd00]'
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              <svg
                className='w-6 h-6'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
                strokeWidth={2}
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M6 18L18 6M6 6l12 12'
                />
              </svg>
            ) : (
              <svg
                className='w-6 h-6'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
                strokeWidth={2}
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M4 6h16M4 12h16M4 18h16'
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <>
          {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */}
          <div
            className='fixed inset-0 bg-black/30 z-40 sm:hidden'
            onClick={() => setMenuOpen(false)}
            role='presentation'
          />
          <nav className='absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-50 sm:hidden'>
            <div className='py-2'>
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className={`block px-6 py-3.5 text-base font-semibold transition-colors
                    ${
                      pathname === link.href
                        ? 'text-[#a50032] bg-gray-50'
                        : 'text-[#0b0c0c] hover:bg-gray-50 hover:text-[#a50032]'
                    }`}
                >
                  {link.label}
                </a>
              ))}
              <div className='border-t border-gray-100 mt-1 pt-2 px-6 py-3'>
                <a
                  href='/report'
                  className='block w-full text-center bg-[#00703c] hover:bg-[#005a30] text-white 
                             font-semibold py-3 rounded transition-colors text-base'
                >
                  Start a Report
                </a>
              </div>
            </div>
          </nav>
        </>
      )}

      {/* AI PoC banner */}
      <div className='bg-[#0b0c0c] text-white text-center py-1 sm:py-1.5 text-[10px] sm:text-xs font-medium tracking-wide'>
        AI-Assisted Reporting — Proof of Concept
        {process.env.NEXT_PUBLIC_DEMO_MODE === 'true' && (
          <span className='ml-2 px-1.5 py-0.5 bg-amber-500 text-black rounded text-[10px] font-bold uppercase'>
            Demo
          </span>
        )}
      </div>
    </header>
  );
}
