'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import type { Report } from '@/types';

const wasteTypeLabels: Record<string, string> = {
  furniture_general: 'Furniture / general',
  business_construction: 'Business / construction',
  hazardous: 'Hazardous',
  household: 'Household',
  garden: 'Garden',
  electrical: 'Electrical',
  tyres: 'Tyres',
  other: 'Other'
};

const wasteSizeLabels: Record<string, string> = {
  single_black_bag: 'Single black bag',
  other_single_item: 'Other single item',
  car_boot_load: 'Car boot load',
  small_van_load: 'Small van load',
  transit_van_load: 'Transit van load',
  tipper_lorry_load: 'Tipper lorry load',
  significant_multiple_loads: 'Significant / multiple loads'
};

const landOwnershipLabels: Record<string, string> = {
  public: 'Public land',
  private: 'Private land',
  council_estate: 'Council estate',
  unknown: 'Unknown'
};

const statusColors: Record<string, string> = {
  submitted: 'bg-blue-100 text-blue-800',
  validated: 'bg-green-100 text-green-800',
  duplicate: 'bg-yellow-100 text-yellow-800',
  rejected: 'bg-red-100 text-red-800',
  draft: 'bg-gray-100 text-gray-700'
};

function ConfidenceBar({
  label,
  value
}: Readonly<{ label: string; value: number }>) {
  const pct = Math.round(value * 100);
  return (
    <div className='flex items-center gap-3'>
      <span className='text-xs text-gray-500 w-24 shrink-0'>{label}</span>
      <div className='flex-1 bg-gray-200 rounded-full h-2'>
        <div
          className='h-2 rounded-full bg-[#00703c]'
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className='text-xs font-medium text-gray-700 w-10 text-right'>
        {pct}%
      </span>
    </div>
  );
}

function DetailRow({
  label,
  value,
  mono
}: Readonly<{
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}>) {
  return (
    <div className='py-3 sm:grid sm:grid-cols-3 sm:gap-4 border-b border-gray-100 last:border-0'>
      <dt className='text-sm font-medium text-gray-500'>{label}</dt>
      <dd
        className={`mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0 ${mono ? 'font-mono' : ''}`}
      >
        {value || <span className='text-gray-400'>—</span>}
      </dd>
    </div>
  );
}

export default function ReportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [report, setReport] = useState<Omit<Report, 'embedding'> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageExpanded, setImageExpanded] = useState(false);

  useEffect(() => {
    async function loadReport() {
      try {
        const res = await fetch(`/api/reports/${id}`);
        if (!res.ok) {
          setError(
            res.status === 404 ? 'Report not found' : 'Failed to load report'
          );
          return;
        }
        const data = await res.json();
        setReport(data.report);
      } catch {
        setError('Failed to load report');
      } finally {
        setLoading(false);
      }
    }
    if (id) loadReport();
  }, [id]);

  if (loading) {
    return (
      <div className='bg-gray-50 min-h-[calc(100vh-12rem)]'>
        <div className='max-w-4xl mx-auto px-4 sm:px-6 py-12 text-center'>
          <div className='spinner mx-auto mb-3' />
          <p className='text-sm text-gray-500'>Loading report...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className='bg-gray-50 min-h-[calc(100vh-12rem)]'>
        <div className='max-w-4xl mx-auto px-4 sm:px-6 py-12 text-center'>
          <p className='text-red-600 font-medium mb-4'>
            {error || 'Report not found'}
          </p>
          <Link href='/admin' className='lbbd-btn-secondary text-sm'>
            &larr; Back to Reports
          </Link>
        </div>
      </div>
    );
  }

  const imageUrl = `/api/images/${report.image.id}`;
  const conf = report.aiMetadata?.confidence;

  return (
    <div className='bg-gray-50 min-h-[calc(100vh-12rem)]'>
      <div className='max-w-4xl mx-auto px-4 sm:px-6 py-8'>
        {/* Header */}
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6'>
          <div>
            <Link
              href='/admin'
              className='text-sm text-[#a50032] hover:underline inline-flex items-center gap-1 mb-2'
            >
              &larr; All Reports
            </Link>
            <h1 className='text-xl font-bold text-gray-900 break-all'>
              {report.id}
            </h1>
            <div className='flex items-center gap-3 mt-2'>
              <span
                className={`inline-block px-2.5 py-0.5 rounded text-xs font-medium capitalize ${statusColors[report.status] || 'bg-gray-100 text-gray-700'}`}
              >
                {report.status}
              </span>
              <span className='text-xs text-gray-500'>
                {new Date(report.createdAt).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric'
                })}{' '}
                at{' '}
                {new Date(report.createdAt).toLocaleTimeString('en-GB', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-5 gap-6'>
          {/* LEFT: Image */}
          <div className='lg:col-span-2'>
            <div className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden'>
              <div className='px-4 py-3 border-b border-gray-100'>
                <h2 className='text-sm font-semibold text-gray-900'>
                  Uploaded Image
                </h2>
              </div>
              <div className='p-3'>
                <button
                  type='button'
                  onClick={() => setImageExpanded(!imageExpanded)}
                  className='w-full cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ffdd00] rounded'
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageUrl}
                    alt='Fly-tipping report'
                    className='w-full rounded object-cover'
                    style={{ maxHeight: imageExpanded ? 'none' : '320px' }}
                  />
                </button>
                <div className='mt-2 text-xs text-gray-500 space-y-0.5'>
                  <p>
                    <span className='font-medium'>File:</span>{' '}
                    {report.image.filename}
                  </p>
                  <p>
                    <span className='font-medium'>Size:</span>{' '}
                    {(report.image.size / 1024).toFixed(0)} KB
                  </p>
                  <p>
                    <span className='font-medium'>Uploaded:</span>{' '}
                    {new Date(report.image.uploadedAt).toLocaleString('en-GB')}
                  </p>
                </div>
              </div>
            </div>

            {/* AI Confidence */}
            {conf && (
              <div className='bg-white rounded-lg shadow-sm border border-gray-200 mt-4 overflow-hidden'>
                <div className='px-4 py-3 border-b border-gray-100'>
                  <h2 className='text-sm font-semibold text-gray-900'>
                    AI Confidence
                  </h2>
                </div>
                <div className='p-4 space-y-3'>
                  <ConfidenceBar label='Overall' value={conf.overall} />
                  <ConfidenceBar label='Waste Type' value={conf.wasteType} />
                  <ConfidenceBar label='Waste Size' value={conf.wasteSize} />
                  <ConfidenceBar label='Hazardous' value={conf.hazardous} />
                  <ConfidenceBar label='Description' value={conf.description} />
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Details */}
          <div className='lg:col-span-3 space-y-4'>
            {/* Waste Details */}
            <div className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden'>
              <div className='px-4 py-3 border-b border-gray-100'>
                <h2 className='text-sm font-semibold text-gray-900'>
                  Waste Details
                </h2>
              </div>
              <dl className='px-4'>
                <DetailRow
                  label='Waste Type'
                  value={wasteTypeLabels[report.wasteType] || report.wasteType}
                />
                <DetailRow
                  label='Waste Size'
                  value={wasteSizeLabels[report.wasteSize] || report.wasteSize}
                />
                <DetailRow
                  label='Hazardous'
                  value={
                    report.hazardous ? (
                      <span className='text-red-600 font-medium'>Yes</span>
                    ) : (
                      'No'
                    )
                  }
                />
                <DetailRow label='Description' value={report.description} />
                {report.aiSummary && (
                  <DetailRow label='AI Summary' value={report.aiSummary} />
                )}
                {report.severityRating != null && (
                  <DetailRow
                    label='Severity'
                    value={
                      <span className='inline-flex items-center gap-1.5'>
                        <span className='font-semibold'>
                          {report.severityRating}
                        </span>
                        <span className='text-gray-400'>/ 10</span>
                      </span>
                    }
                  />
                )}
              </dl>
            </div>

            {/* Location */}
            <div className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden'>
              <div className='px-4 py-3 border-b border-gray-100'>
                <h2 className='text-sm font-semibold text-gray-900'>
                  Location
                </h2>
              </div>
              <dl className='px-4'>
                <DetailRow label='Address' value={report.location?.address} />
                <DetailRow
                  label='Coordinates'
                  value={
                    report.location?.coordinates
                      ? `${report.location.coordinates.latitude.toFixed(6)}, ${report.location.coordinates.longitude.toFixed(6)}`
                      : null
                  }
                  mono
                />
                <DetailRow
                  label='Source'
                  value={
                    <span className='capitalize'>
                      {report.location?.source}
                    </span>
                  }
                />
                <DetailRow
                  label='Within Boundary'
                  value={
                    report.location?.withinBoundary ? (
                      <span className='text-green-700'>Yes</span>
                    ) : (
                      <span className='text-red-600'>No</span>
                    )
                  }
                />
                {report.locationDetails && (
                  <DetailRow
                    label='Additional Details'
                    value={report.locationDetails}
                  />
                )}
                <DetailRow
                  label='Land Ownership'
                  value={
                    landOwnershipLabels[report.landOwnership] ||
                    report.landOwnership
                  }
                />
              </dl>
            </div>

            {/* Reporter Info */}
            <div className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden'>
              <div className='px-4 py-3 border-b border-gray-100'>
                <h2 className='text-sm font-semibold text-gray-900'>
                  Reporter
                </h2>
              </div>
              <dl className='px-4'>
                <DetailRow
                  label='Name'
                  value={
                    report.contactFirstName || report.contactLastName
                      ? `${report.contactFirstName || ''} ${report.contactLastName || ''}`.trim()
                      : null
                  }
                />
                <DetailRow label='Email' value={report.contactEmail} />
                <DetailRow label='Phone' value={report.contactPhone} />
                <DetailRow
                  label='Knows Who Tipped'
                  value={
                    <span className='capitalize'>{report.knowsWhoTipped}</span>
                  }
                />
                {report.tipperDetails && (
                  <DetailRow
                    label='Tipper Details'
                    value={report.tipperDetails}
                  />
                )}
              </dl>
            </div>

            {/* AI Metadata */}
            <div className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden'>
              <div className='px-4 py-3 border-b border-gray-100'>
                <h2 className='text-sm font-semibold text-gray-900'>
                  AI Analysis
                </h2>
              </div>
              <dl className='px-4'>
                <DetailRow
                  label='Model'
                  value={report.aiMetadata?.modelUsed}
                  mono
                />
                <DetailRow
                  label='Validation'
                  value={
                    report.aiMetadata?.validationPassed ? (
                      <span className='text-green-700 font-medium'>Passed</span>
                    ) : (
                      <span className='text-red-600 font-medium'>Failed</span>
                    )
                  }
                />
                <DetailRow
                  label='Contains Fly-Tipping'
                  value={
                    report.aiMetadata?.safetyCheck?.containsFlyTipping ? (
                      <span className='text-green-700'>Yes</span>
                    ) : (
                      <span className='text-red-600'>No</span>
                    )
                  }
                />
                <DetailRow
                  label='Image Safe'
                  value={
                    report.aiMetadata?.safetyCheck?.isSafe ? (
                      <span className='text-green-700'>Yes</span>
                    ) : (
                      <span className='text-red-600'>No</span>
                    )
                  }
                />
                {report.aiMetadata?.safetyCheck?.reason && (
                  <DetailRow
                    label='Reason'
                    value={report.aiMetadata.safetyCheck.reason}
                  />
                )}
              </dl>
            </div>

            {/* Submission Metadata */}
            <div className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden'>
              <div className='px-4 py-3 border-b border-gray-100'>
                <h2 className='text-sm font-semibold text-gray-900'>
                  Submission Info
                </h2>
              </div>
              <dl className='px-4'>
                <DetailRow label='Report ID' value={report.id} mono />
                <DetailRow
                  label='Submitted Via'
                  value={
                    <span className='capitalize'>
                      {report.submittedVia?.replaceAll('-', ' ')}
                    </span>
                  }
                />
                <DetailRow
                  label='Created'
                  value={new Date(report.createdAt).toLocaleString('en-GB')}
                />
                <DetailRow
                  label='Updated'
                  value={new Date(report.updatedAt).toLocaleString('en-GB')}
                />
                {report.possibleDuplicates?.length > 0 && (
                  <DetailRow
                    label='Possible Duplicates'
                    value={
                      <ul className='space-y-1'>
                        {report.possibleDuplicates.map((dup) => (
                          <li key={dup.reportId} className='text-xs'>
                            <Link
                              href={`/admin/report/${dup.reportId}`}
                              className='text-[#a50032] hover:underline font-mono'
                            >
                              {dup.reportId.slice(0, 16)}...
                            </Link>
                            <span className='text-gray-400 ml-2'>
                              {Math.round(dup.similarity * 100)}% similar ·{' '}
                              {Math.round(dup.distance)}m away
                            </span>
                          </li>
                        ))}
                      </ul>
                    }
                  />
                )}
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
