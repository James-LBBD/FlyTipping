'use client';

import { useEffect, useState } from 'react';
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

const statusColors: Record<string, string> = {
  submitted: 'bg-blue-100 text-blue-800',
  validated: 'bg-green-100 text-green-800',
  duplicate: 'bg-yellow-100 text-yellow-800',
  rejected: 'bg-red-100 text-red-800',
  draft: 'bg-gray-100 text-gray-700'
};

export default function AdminPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    async function loadReports() {
      try {
        const res = await fetch('/api/nearby-reports');
        if (res.ok) {
          const data = await res.json();
          setReports(data.reports || []);
        }
      } catch (err) {
        console.error('Failed to load reports:', err);
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, []);

  const filtered =
    filter === 'all' ? reports : reports.filter((r) => r.status === filter);

  const stats = {
    total: reports.length,
    submitted: reports.filter((r) => r.status === 'submitted').length,
    validated: reports.filter((r) => r.status === 'validated').length,
    duplicate: reports.filter((r) => r.status === 'duplicate').length
  };

  return (
    <div className='bg-gray-50 min-h-[calc(100vh-12rem)]'>
      <div className='max-w-6xl mx-auto px-4 sm:px-6 py-8'>
        {/* Header */}
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6'>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>
              Reports Dashboard
            </h1>
            <p className='text-sm text-gray-600 mt-1'>
              View and manage fly-tipping reports
            </p>
          </div>
          <Link href='/' className='lbbd-btn-secondary text-sm self-start'>
            &larr; Back to Home
          </Link>
        </div>

        {/* Stat Cards */}
        <div className='grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6'>
          {[
            {
              label: 'Total Reports',
              value: stats.total,
              color: 'border-[#0b0c0c]'
            },
            {
              label: 'Submitted',
              value: stats.submitted,
              color: 'border-blue-400'
            },
            {
              label: 'Validated',
              value: stats.validated,
              color: 'border-green-400'
            },
            {
              label: 'Duplicates',
              value: stats.duplicate,
              color: 'border-yellow-400'
            }
          ].map((s) => (
            <div
              key={s.label}
              className={`bg-white rounded-lg border-l-4 ${s.color} p-4 shadow-sm`}
            >
              <div className='text-2xl font-bold text-gray-900'>{s.value}</div>
              <div className='text-xs text-gray-500'>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div className='flex gap-2 mb-4 flex-wrap'>
          {['all', 'submitted', 'validated', 'duplicate', 'rejected'].map(
            (f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors capitalize
                  ${filter === f ? 'bg-[#0b0c0c] text-white' : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'}`}
              >
                {f}
              </button>
            )
          )}
        </div>

        {/* Reports Table */}
        {loading ? (
          <div className='lbbd-card text-center py-12'>
            <div className='spinner mx-auto mb-3' />
            <p className='text-sm text-gray-500'>Loading reports...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className='lbbd-card text-center py-12'>
            <p className='text-gray-500 mb-2'>
              {reports.length === 0
                ? 'No reports have been submitted yet.'
                : 'No reports match the current filter.'}
            </p>
            {reports.length === 0 && (
              <Link
                href='/report'
                className='text-[#a50032] font-medium text-sm hover:underline'
              >
                Submit the first report &rarr;
              </Link>
            )}
          </div>
        ) : (
          <div className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden'>
            <div className='overflow-x-auto'>
              <table className='w-full text-sm'>
                <thead className='bg-gray-50 text-left text-xs text-gray-500 uppercase tracking-wider'>
                  <tr>
                    <th className='px-4 py-3'>ID</th>
                    <th className='px-4 py-3'>Date</th>
                    <th className='px-4 py-3'>Status</th>
                    <th className='px-4 py-3'>Waste Type</th>
                    <th className='px-4 py-3'>Location Source</th>
                    <th className='px-4 py-3'>AI Confidence</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-100'>
                  {filtered.map((report) => (
                    <tr
                      key={report.id}
                      className='hover:bg-gray-50 transition-colors'
                    >
                      <td className='px-4 py-3 font-mono text-xs text-[#0b0c0c]'>
                        {report.id.slice(0, 12)}...
                      </td>
                      <td className='px-4 py-3 text-gray-600'>
                        <div>
                          {new Date(report.createdAt).toLocaleDateString(
                            'en-GB',
                            {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            }
                          )}
                        </div>
                        <div className='text-xs text-gray-400'>
                          {new Date(report.createdAt).toLocaleTimeString(
                            'en-GB',
                            {
                              hour: '2-digit',
                              minute: '2-digit'
                            }
                          )}
                        </div>
                      </td>
                      <td className='px-4 py-3'>
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-xs font-medium capitalize ${statusColors[report.status] || 'bg-gray-100 text-gray-700'}`}
                        >
                          {report.status}
                        </span>
                      </td>
                      <td className='px-4 py-3 text-gray-700'>
                        {wasteTypeLabels[report.wasteType] || report.wasteType}
                      </td>
                      <td className='px-4 py-3 text-gray-500 capitalize'>
                        {report.location?.source || '—'}
                      </td>
                      <td className='px-4 py-3'>
                        {report.aiMetadata?.confidence?.overall != null ? (
                          <div className='flex items-center gap-2'>
                            <div className='w-16 bg-gray-200 rounded-full h-1.5'>
                              <div
                                className='h-1.5 rounded-full bg-[#00703c]'
                                style={{
                                  width: `${Math.round(report.aiMetadata.confidence.overall * 100)}%`
                                }}
                              />
                            </div>
                            <span className='text-xs text-gray-500'>
                              {Math.round(
                                report.aiMetadata.confidence.overall * 100
                              )}
                              %
                            </span>
                          </div>
                        ) : (
                          '—'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
