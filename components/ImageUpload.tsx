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

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className='w-full'>
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

      {!preview ? (
        <div
          onClick={handleClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            border-2 border-dashed rounded-lg p-10 text-center cursor-pointer
            transition-all
            ${isDragging ? 'border-[#00473E] bg-[#00473E]/5' : 'border-gray-300 hover:border-[#00473E]/50'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <div className='text-5xl mb-3'>📸</div>
          <h3 className='text-base font-semibold text-gray-900 mb-1'>
            Upload a photo of the fly-tip
          </h3>
          <p className='text-sm text-gray-600 mb-3'>
            Click to take a photo or choose from your device
          </p>
          <p className='text-xs text-gray-400'>
            Max 5 MB &middot; JPG, PNG or GIF &middot; Drag and drop supported
          </p>
        </div>
      ) : (
        <div className='space-y-4'>
          <div className='relative w-full h-64 rounded-lg overflow-hidden border-2 border-gray-300'>
            <Image
              src={preview}
              alt='Preview'
              fill
              className='object-cover'
              unoptimized
            />
          </div>
          <button
            onClick={handleClick}
            disabled={disabled}
            className='w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-sm font-medium text-gray-700 rounded transition-colors disabled:opacity-50'
          >
            Choose a different photo
          </button>
        </div>
      )}
    </div>
  );
}
