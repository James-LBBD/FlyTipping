'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';

interface ImageUploadProps {
  onImageSelected: (imageData: string, file: File) => void;
  disabled?: boolean;
}

export default function ImageUpload({
  onImageSelected,
  disabled
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreview(result);
      onImageSelected(result, file);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const handleGalleryClick = () => {
    galleryInputRef.current?.click();
  };

  return (
    <div className='w-full'>
      {/* Camera input (capture=environment for rear camera on mobile) */}
      <input
        ref={fileInputRef}
        type='file'
        accept='image/*'
        capture='environment'
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelect(file);
        }}
        className='hidden'
        disabled={disabled}
      />
      {/* Gallery input (no capture — opens photo picker) */}
      <input
        ref={galleryInputRef}
        type='file'
        accept='image/*'
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelect(file);
        }}
        className='hidden'
        disabled={disabled}
      />

      {!preview ? (
        <div className='space-y-3'>
          {/* Primary action: Take a photo (most prominent on mobile) */}
          <button
            type='button'
            onClick={handleCameraClick}
            disabled={disabled}
            className={`w-full border-2 border-dashed rounded-lg p-6 sm:p-10 text-center cursor-pointer
              transition-all active:scale-[0.98]
              ${isDragging ? 'border-[#0b0c0c] bg-gray-50' : 'border-gray-300 hover:border-gray-500'}
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <div className='text-5xl sm:text-5xl mb-2 sm:mb-3'>📸</div>
            <h3 className='text-base font-semibold text-gray-900 mb-1'>
              Take a photo of the fly-tip
            </h3>
            <p className='text-sm text-gray-600 mb-2 sm:mb-3'>
              Tap to open your camera
            </p>
            <p className='text-xs text-gray-400 hidden sm:block'>
              Max 5 MB &middot; JPG, PNG or GIF &middot; Drag and drop supported
            </p>
          </button>

          {/* Secondary action: Choose from gallery */}
          <button
            type='button'
            onClick={handleGalleryClick}
            disabled={disabled}
            className='w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 active:bg-gray-300
                       text-sm font-medium text-gray-700 rounded-lg transition-colors 
                       disabled:opacity-50 min-h-[48px] flex items-center justify-center gap-2'
          >
            <svg
              className='w-5 h-5 text-gray-500'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
              strokeWidth={1.5}
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z'
              />
            </svg>
            Choose from gallery
          </button>
        </div>
      ) : (
        <div className='space-y-3'>
          <div className='relative w-full aspect-[4/3] sm:h-64 rounded-lg overflow-hidden border-2 border-gray-300'>
            <Image
              src={preview}
              alt='Preview'
              fill
              className='object-cover'
              unoptimized
            />
          </div>
          <button
            onClick={handleCameraClick}
            disabled={disabled}
            className='w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-sm font-medium 
                       text-gray-700 rounded-lg transition-colors disabled:opacity-50 min-h-[48px]'
          >
            Choose a different photo
          </button>
        </div>
      )}
    </div>
  );
}
