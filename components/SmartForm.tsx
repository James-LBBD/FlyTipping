'use client';

import { useState } from 'react';
import type {
  FieldExtractionResult,
  WasteType,
  WasteSize,
  LandOwnership,
  KnowsWhoTipped
} from '@/types';
import ConfidenceIndicator from './ConfidenceIndicator';

interface SmartFormProps {
  extractedFields: FieldExtractionResult;
  onSubmit: (formData: Record<string, unknown>) => void;
  loading?: boolean;
}

const wasteTypeLabels: Record<WasteType, string> = {
  furniture_general: 'Furniture / general household items',
  business_construction: 'Business or construction waste',
  hazardous: 'Hazardous waste (chemicals, asbestos, etc.)',
  household: 'Household waste',
  garden: 'Garden waste',
  electrical: 'Electrical items / appliances',
  tyres: 'Tyres',
  other: 'Other'
};

const wasteSizeLabels: Record<WasteSize, string> = {
  single_black_bag: 'Single black bag',
  other_single_item: 'Other single item',
  car_boot_load: 'Car boot load or less',
  small_van_load: 'Small van load',
  transit_van_load: 'Transit van load',
  tipper_lorry_load: 'Tipper lorry load',
  significant_multiple_loads: 'Significant / multiple loads'
};

const landOwnershipLabels: Record<LandOwnership, string> = {
  public: 'Public land',
  private: 'Private land',
  council_estate: 'Council housing estate',
  unknown: "I don't know"
};

export default function SmartForm({
  extractedFields,
  onSubmit,
  loading
}: SmartFormProps) {
  const [formData, setFormData] = useState({
    wasteType: extractedFields.wasteType,
    wasteSize: extractedFields.wasteSize,
    hazardous: extractedFields.hazardous,
    description: extractedFields.description,
    landOwnership: 'unknown' as LandOwnership,
    knowsWhoTipped: 'no' as KnowsWhoTipped,
    tipperDetails: '',
    contactFirstName: '',
    contactLastName: '',
    contactEmail: '',
    contactPhone: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      aiSummary: extractedFields.summary,
      severityRating: extractedFields.severityRating
    });
  };

  const update = (key: string, value: unknown) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  return (
    <form onSubmit={handleSubmit} className='space-y-5 sm:space-y-6'>
      {/* AI Summary Banner */}
      <div className='bg-gray-100 border border-gray-300 rounded-lg p-3 sm:p-4'>
        <div className='flex items-start gap-2 sm:gap-3'>
          <span className='ai-badge text-xs mt-0.5 shrink-0'>AI</span>
          <div className='flex-1 min-w-0'>
            <h3 className='font-semibold text-gray-900 mb-1 text-sm'>
              AI Analysis Summary
            </h3>
            <p className='text-sm text-gray-700'>{extractedFields.summary}</p>
            <div className='mt-2 text-xs text-gray-500'>
              Severity: {extractedFields.severityRating}/10
            </div>
          </div>
        </div>
      </div>

      {/* Land Ownership */}
      <fieldset>
        <legend className='lbbd-label'>
          Is the fly-tip on public or private land?
        </legend>
        <div className='space-y-1'>
          {(Object.keys(landOwnershipLabels) as LandOwnership[]).map((val) => (
            <label
              key={val}
              className='flex items-center gap-3 cursor-pointer py-2 px-1 -mx-1 rounded-md hover:bg-gray-50 active:bg-gray-100 transition-colors'
            >
              <input
                type='radio'
                name='landOwnership'
                value={val}
                checked={formData.landOwnership === val}
                onChange={() => update('landOwnership', val)}
                className='w-5 h-5 text-[#00703c] focus:ring-[#00703c] shrink-0'
              />
              <span className='text-sm text-gray-800'>
                {landOwnershipLabels[val]}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Waste Type */}
      <div>
        <label htmlFor='wasteType' className='lbbd-label'>
          What type of waste has been fly-tipped?
          <span className='ml-1 ai-badge text-[10px]'>AI-suggested</span>
        </label>
        <select
          id='wasteType'
          value={formData.wasteType}
          onChange={(e) => update('wasteType', e.target.value)}
          className='lbbd-select'
          required
        >
          {(Object.keys(wasteTypeLabels) as WasteType[]).map((type) => (
            <option key={type} value={type}>
              {wasteTypeLabels[type]}
            </option>
          ))}
        </select>
        <ConfidenceIndicator
          label='AI Confidence'
          value={extractedFields.confidence.wasteType}
          className='mt-1'
        />
      </div>

      {/* Waste Size */}
      <div>
        <label htmlFor='wasteSize' className='lbbd-label'>
          How much waste is there?
          <span className='ml-1 ai-badge text-[10px]'>AI-suggested</span>
        </label>
        <select
          id='wasteSize'
          value={formData.wasteSize}
          onChange={(e) => update('wasteSize', e.target.value)}
          className='lbbd-select'
          required
        >
          {(Object.keys(wasteSizeLabels) as WasteSize[]).map((size) => (
            <option key={size} value={size}>
              {wasteSizeLabels[size]}
            </option>
          ))}
        </select>
        <ConfidenceIndicator
          label='AI Confidence'
          value={extractedFields.confidence.wasteSize}
          className='mt-1'
        />
      </div>

      {/* Hazardous */}
      <div>
        <label className='flex items-center gap-3 cursor-pointer py-2 px-1 -mx-1 rounded-md hover:bg-gray-50 active:bg-gray-100 transition-colors'>
          <input
            type='checkbox'
            checked={formData.hazardous}
            onChange={(e) => update('hazardous', e.target.checked)}
            className='w-5 h-5 text-[#00703c] focus:ring-[#00703c] rounded shrink-0'
          />
          <span className='text-sm font-medium text-gray-800'>
            Contains hazardous materials
          </span>
        </label>
        <ConfidenceIndicator
          label='AI Confidence'
          value={extractedFields.confidence.hazardous}
          className='mt-1 ml-7'
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor='description' className='lbbd-label'>
          Description
          <span className='ml-1 ai-badge text-[10px]'>AI-generated</span>
        </label>
        <textarea
          id='description'
          value={formData.description}
          onChange={(e) => update('description', e.target.value)}
          rows={3}
          className='lbbd-input'
          required
        />
        <ConfidenceIndicator
          label='AI Confidence'
          value={extractedFields.confidence.description}
          className='mt-1'
        />
      </div>

      {/* Knows Who Tipped */}
      <fieldset>
        <legend className='lbbd-label'>
          Do you know who fly-tipped the waste?
        </legend>
        <div className='flex gap-4 sm:gap-6'>
          {(['yes', 'no'] as KnowsWhoTipped[]).map((val) => (
            <label
              key={val}
              className='flex items-center gap-2 cursor-pointer py-2 px-2 -mx-1 rounded-md hover:bg-gray-50 active:bg-gray-100 transition-colors'
            >
              <input
                type='radio'
                name='knowsWhoTipped'
                value={val}
                checked={formData.knowsWhoTipped === val}
                onChange={() => update('knowsWhoTipped', val)}
                className='w-5 h-5 text-[#00703c] focus:ring-[#00703c]'
              />
              <span className='text-sm text-gray-800 capitalize'>{val}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {formData.knowsWhoTipped === 'yes' && (
        <div>
          <label htmlFor='tipperDetails' className='lbbd-label'>
            Please provide details of who fly-tipped
          </label>
          <textarea
            id='tipperDetails'
            value={formData.tipperDetails}
            onChange={(e) => update('tipperDetails', e.target.value)}
            rows={2}
            className='lbbd-input'
          />
        </div>
      )}

      {/* Contact Info */}
      <div className='border-t border-gray-200 pt-5 sm:pt-6'>
        <h3 className='text-base font-semibold text-gray-900 mb-1'>
          Your Details
        </h3>
        <p className='text-xs text-gray-500 mb-4'>
          Optional. Used only if we need to follow up on your report.
        </p>

        <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4'>
          <div>
            <label htmlFor='firstName' className='lbbd-label'>
              First name
            </label>
            <input
              id='firstName'
              type='text'
              value={formData.contactFirstName}
              onChange={(e) => update('contactFirstName', e.target.value)}
              className='lbbd-input'
            />
          </div>
          <div>
            <label htmlFor='lastName' className='lbbd-label'>
              Last name
            </label>
            <input
              id='lastName'
              type='text'
              value={formData.contactLastName}
              onChange={(e) => update('contactLastName', e.target.value)}
              className='lbbd-input'
            />
          </div>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-3 sm:mt-4'>
          <div>
            <label htmlFor='email' className='lbbd-label'>
              Email address
            </label>
            <input
              id='email'
              type='email'
              value={formData.contactEmail}
              onChange={(e) => update('contactEmail', e.target.value)}
              className='lbbd-input'
            />
          </div>
          <div>
            <label htmlFor='phone' className='lbbd-label'>
              Telephone number
            </label>
            <input
              id='phone'
              type='tel'
              value={formData.contactPhone}
              onChange={(e) => update('contactPhone', e.target.value)}
              className='lbbd-input'
            />
          </div>
        </div>
      </div>

      {/* Overall Confidence */}
      <div className='bg-gray-50 border border-gray-200 rounded-lg p-4'>
        <ConfidenceIndicator
          label='Overall AI Confidence'
          value={extractedFields.confidence.overall}
        />
      </div>

      {/* Submit */}
      <button
        type='submit'
        disabled={loading}
        className='lbbd-btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed'
      >
        {loading ? 'Submitting...' : 'Submit Report'}
      </button>
    </form>
  );
}
