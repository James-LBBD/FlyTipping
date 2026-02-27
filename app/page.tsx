import Link from 'next/link';

export default function HomePage() {
  return (
    <div className='bg-gray-50 min-h-[calc(100vh-8rem)]'>
      {/* Hero */}
      <section className='bg-[#0b0c0c] text-white py-8 sm:py-16'>
        <div className='max-w-3xl mx-auto px-4 sm:px-6 text-center'>
          <h1 className='text-2xl sm:text-4xl font-bold mb-3 sm:mb-4'>
            Report Fly-Tipping
          </h1>
          <p className='text-base sm:text-lg text-white/80 mb-6 sm:mb-8 max-w-xl mx-auto'>
            Help keep Barking and Dagenham clean. Report illegally dumped waste
            and our AI will help fill in the details.
          </p>
          <Link
            href='/report'
            className='inline-block bg-[#00703c] hover:bg-[#005a30] active:bg-[#004825] text-white font-semibold
                       px-8 py-3.5 rounded transition-colors text-lg shadow-lg min-h-[48px]'
          >
            Start a Report
          </Link>
        </div>
      </section>

      {/* How It Works */}
      <section className='max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12'>
        <h2 className='text-xl sm:text-2xl font-bold text-gray-900 text-center mb-6 sm:mb-8'>
          How It Works
        </h2>
        <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6'>
          {[
            {
              step: '1',
              title: 'Take a Photo',
              desc: 'Upload or capture a photo of the fly-tip. Our AI checks it automatically.'
            },
            {
              step: '2',
              title: 'Confirm Location',
              desc: 'We detect the GPS location from the photo or use your device. Place it on the map.'
            },
            {
              step: '3',
              title: 'Review & Submit',
              desc: 'AI pre-fills the waste type and size. Check the details, add your contact info, and submit.'
            }
          ].map((item) => (
            <div
              key={item.step}
              className='bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 text-center'
            >
              <div className='w-10 h-10 bg-[#0b0c0c] text-white rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-4'>
                {item.step}
              </div>
              <h3 className='font-semibold text-gray-900 mb-2'>{item.title}</h3>
              <p className='text-sm text-gray-600'>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* AI Features Banner */}
      <section className='bg-white border-y border-gray-200'>
        <div className='max-w-4xl mx-auto px-4 sm:px-6 py-10'>
          <h2 className='text-xl font-bold text-gray-900 mb-6 text-center'>
            AI-Powered Features
          </h2>
          <div className='grid grid-cols-2 sm:grid-cols-4 gap-4 text-center text-sm'>
            {[
              { icon: '🔍', label: 'Image Validation' },
              { icon: '📝', label: 'Smart Auto-Fill' },
              { icon: '📍', label: 'Location Check' },
              { icon: '🔁', label: 'Duplicate Detection' }
            ].map((f) => (
              <div key={f.label} className='py-3'>
                <div className='text-2xl mb-1'>{f.icon}</div>
                <div className='text-gray-700 font-medium'>{f.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PWA Install Hint */}
      <section className='max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10 text-center'>
        <div className='bg-gray-100 border border-gray-300 rounded-lg p-4 sm:p-6'>
          <p className='text-sm text-gray-700'>
            <span className='font-semibold'>Works offline.</span> Install this
            app to your home screen for quick access — no app store needed.
          </p>
        </div>
      </section>
    </div>
  );
}
