'use client';

import { useState } from 'react';

/**
 * Simple utility page to upload and save test images for the fly-tipping POC.
 * Images are saved to the server's images/test-fixtures/ directory.
 * Access at: http://localhost:3000/test-upload
 */
export default function TestUploadPage() {
  const [uploads, setUploads] = useState<
    { name: string; status: string; size: string }[]
  >([]);
  const [saving, setSaving] = useState(false);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setSaving(true);

    for (const file of Array.from(files)) {
      const reader = new FileReader();
      const dataUrl: string = await new Promise((resolve) => {
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });

      try {
        const res = await fetch('/api/save-test-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: file.name,
            dataUrl
          })
        });
        const result = await res.json();
        setUploads((prev) => [
          ...prev,
          {
            name: file.name,
            status: result.success ? `✅ Saved as ${result.savedAs}` : `❌ ${result.error}`,
            size: `${Math.round(file.size / 1024)} KB`
          }
        ]);
      } catch (err) {
        setUploads((prev) => [
          ...prev,
          { name: file.name, status: `❌ ${String(err)}`, size: `${Math.round(file.size / 1024)} KB` }
        ]);
      }
    }
    setSaving(false);
  };

  return (
    <div className='max-w-2xl mx-auto px-4 py-12'>
      <h1 className='text-2xl font-bold mb-2'>Upload Test Images</h1>
      <p className='text-gray-600 mb-6 text-sm'>
        Upload fly-tipping images here. They&apos;ll be saved to{' '}
        <code className='bg-gray-100 px-1 rounded'>images/test-fixtures/</code>{' '}
        for use in automated API tests.
      </p>

      <label className='block border-2 border-dashed border-gray-300 rounded-lg p-10 text-center cursor-pointer hover:border-gray-500 transition-colors'>
        <input
          type='file'
          accept='image/*'
          multiple
          className='hidden'
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className='text-4xl mb-2'>📸</div>
        <p className='font-semibold'>Click to select images or drag & drop</p>
        <p className='text-sm text-gray-400 mt-1'>JPG, PNG, GIF — multiple files supported</p>
      </label>

      {saving && (
        <div className='mt-4 text-center text-gray-500'>Saving...</div>
      )}

      {uploads.length > 0 && (
        <div className='mt-6 space-y-2'>
          <h2 className='font-semibold text-lg'>Uploaded Files</h2>
          {uploads.map((u, i) => (
            <div
              key={i}
              className='flex items-center justify-between bg-gray-50 rounded px-4 py-2 text-sm'
            >
              <span className='font-medium'>{u.name}</span>
              <span className='text-gray-500'>{u.size}</span>
              <span>{u.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
