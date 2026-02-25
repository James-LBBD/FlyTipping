import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0b0c0c'
};

export const metadata: Metadata = {
  title: 'Report Fly-Tipping | London Borough of Barking and Dagenham',
  description:
    'AI-assisted fly-tipping incident reporting for the London Borough of Barking and Dagenham',
  manifest: '/manifest.json',
  icons: {
    apple: '/icons/icon-192x192.png'
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Report Fly-Tipping'
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <head>
        <link
          href='https://fonts.googleapis.com/css2?family=Heebo:wght@400;700&display=swap'
          rel='stylesheet'
        />
      </head>
      <body className='min-h-screen flex flex-col'>
        {/* LBBD Council Header — white bg, logo only (matches lbbd.gov.uk) */}
        <header className='bg-white border-b border-gray-200'>
          <div className='max-w-5xl mx-auto px-4 sm:px-6'>
            <div className='flex items-center justify-between h-16'>
              <a href='/' className='hover:opacity-80 transition-opacity'>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src='/icons/lbbd-logo.svg'
                  alt='London Borough of Barking and Dagenham'
                  className='h-10 w-auto'
                />
              </a>
              <nav className='flex items-center gap-4 text-sm font-semibold text-[#0b0c0c]'>
                <a href='/' className='hover:text-[#a50032] transition-colors'>
                  Home
                </a>
                <a
                  href='/report'
                  className='hover:text-[#a50032] transition-colors'
                >
                  Report
                </a>
                <a
                  href='/admin'
                  className='text-gray-500 hover:text-[#a50032] transition-colors'
                >
                  Admin
                </a>
              </nav>
            </div>
          </div>
          {/* AI PoC banner */}
          <div className='bg-[#0b0c0c] text-white text-center py-1.5 text-xs font-medium tracking-wide'>
            AI-Assisted Reporting — Proof of Concept
          </div>
        </header>

        {/* Main Content */}
        <main className='flex-1'>{children}</main>

        {/* LBBD Council Footer — dark bg (matches eforms.lbbd.gov.uk) */}
        <footer className='bg-[#0b0c0c] text-white mt-auto'>
          {/* Social media bar */}
          <div className='border-b border-white/20'>
            <div className='max-w-5xl mx-auto px-4 sm:px-6 py-4'>
              <div className='flex items-center justify-center gap-6'>
                <a
                  href='http://www.facebook.com/barkinganddagenham'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-white/70 hover:text-white transition-colors'
                  aria-label='Follow us on Facebook'
                >
                  <svg
                    className='w-6 h-6'
                    fill='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path d='M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' />
                  </svg>
                </a>
                <a
                  href='https://twitter.com/lbbdcouncil'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-white/70 hover:text-white transition-colors'
                  aria-label='Follow us on Twitter'
                >
                  <svg
                    className='w-6 h-6'
                    fill='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path d='M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z' />
                  </svg>
                </a>
                <a
                  href='https://www.youtube.com/user/LBBarkingandDagenham'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-white/70 hover:text-white transition-colors'
                  aria-label='Follow us on YouTube'
                >
                  <svg
                    className='w-6 h-6'
                    fill='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path d='M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z' />
                  </svg>
                </a>
                <a
                  href='https://www.linkedin.com/company/lbbdcouncil/'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-white/70 hover:text-white transition-colors'
                  aria-label='Follow us on LinkedIn'
                >
                  <svg
                    className='w-6 h-6'
                    fill='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path d='M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Logos and links */}
          <div className='max-w-5xl mx-auto px-4 sm:px-6 py-6'>
            <div className='flex flex-col sm:flex-row items-center justify-between gap-6'>
              {/* Logos */}
              <div className='flex items-center gap-6'>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src='/icons/lbbd-logo.png'
                  alt='London Borough of Barking and Dagenham'
                  className='h-12 w-auto brightness-0 invert'
                />
                <a
                  href='https://www.gov.uk'
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src='/icons/govuk-logo.png'
                    alt='GOV.UK'
                    className='h-10 w-auto'
                  />
                </a>
              </div>

              {/* Footer links */}
              <div className='flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-white/70'>
                <a
                  href='https://www.lbbd.gov.uk/council-and-democracy/privacy-notices/general-privacy-notice'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='hover:text-white underline'
                >
                  Privacy Notice
                </a>
                <span className='text-white/30'>|</span>
                <a
                  href='https://www.lbbd.gov.uk/council-and-democracy/statistics-and-data'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='hover:text-white underline'
                >
                  Data Protection
                </a>
                <span className='text-white/30'>|</span>
                <a
                  href='https://www.lbbd.gov.uk/accessibility'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='hover:text-white underline'
                >
                  Accessibility
                </a>
                <span className='text-white/30'>|</span>
                <a
                  href='https://www.lbbd.gov.uk/contact-us'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='hover:text-white underline'
                >
                  Contact Us
                </a>
              </div>
            </div>

            {/* Copyright */}
            <div className='border-t border-white/20 mt-6 pt-4 text-xs text-white/50 text-center'>
              &copy; {new Date().getFullYear()} — London Borough of Barking and
              Dagenham. All rights reserved.
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
