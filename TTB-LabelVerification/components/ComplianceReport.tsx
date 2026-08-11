'use client';

import { useState } from 'react';
import type { FieldResult, ValidationReport, ExtractedLabel } from '@/types/label';

interface Props {
  report: ValidationReport;
  extracted: ExtractedLabel;
}

const STATUS_STYLES: Record<string, string> = {
  PASS: 'bg-green-100 text-green-800',
  FAIL: 'bg-red-100 text-red-800',
  WARNING: 'bg-yellow-100 text-yellow-800',
};

const STATUS_ICONS: Record<string, string> = {
  PASS: '✓',
  FAIL: '✗',
  WARNING: '⚠',
};

export default function ComplianceReport({ report, extracted }: Props) {
  const [showRaw, setShowRaw] = useState(false);

  const passCount = report.fields.filter((f) => f.status === 'PASS').length;
  const failCount = report.fields.filter((f) => f.status === 'FAIL').length;
  const warnCount = report.fields.filter((f) => f.status === 'WARNING').length;

  return (
    <div className="space-y-6">
      {/* Overall verdict banner */}
      <div
        className={`rounded-xl p-6 flex items-center justify-between ${
          report.overallStatus === 'PASS'
            ? 'bg-green-600 text-white'
            : 'bg-red-600 text-white'
        }`}
      >
        <div>
          <div className="text-3xl font-bold">
            {report.overallStatus === 'PASS' ? '✓ COMPLIANT' : '✗ NON-COMPLIANT'}
          </div>
          <div className="mt-1 text-sm opacity-90">
            {passCount} passed · {failCount} failed
            {warnCount > 0 && ` · ${warnCount} warnings`}
          </div>
        </div>
        <div className="text-right text-sm opacity-80">
          <div>Processed in</div>
          <div className="text-xl font-semibold">{(report.processingTimeMs / 1000).toFixed(1)}s</div>
        </div>
      </div>

      {/* Field-by-field results table */}
      <div className="overflow-hidden rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="px-4 py-3 font-semibold text-gray-700 w-8"></th>
              <th className="px-4 py-3 font-semibold text-gray-700">Field</th>
              <th className="px-4 py-3 font-semibold text-gray-700">Application Says</th>
              <th className="px-4 py-3 font-semibold text-gray-700">Label Shows</th>
              <th className="px-4 py-3 font-semibold text-gray-700">Result</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {report.fields.map((field) => (
              <FieldRow key={field.field} field={field} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Extraction notes */}
      {extracted.extraction_notes && (
        <div className="rounded-lg bg-yellow-50 border border-yellow-200 px-4 py-3 text-sm text-yellow-800">
          <span className="font-semibold">AI Note: </span>
          {extracted.extraction_notes}
        </div>
      )}

      {/* Raw extraction details (collapsed by default) */}
      <div>
        <button
          onClick={() => setShowRaw(!showRaw)}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
        >
          <span>{showRaw ? '▾' : '▸'}</span>
          {showRaw ? 'Hide' : 'Show'} raw extracted data
        </button>
        {showRaw && (
          <pre className="mt-3 bg-gray-900 text-green-400 rounded-xl p-5 text-xs overflow-x-auto leading-relaxed">
            {JSON.stringify(extracted, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}

function FieldRow({ field }: { field: FieldResult }) {
  const isLong = (field.expected?.length ?? 0) > 80 || (field.extracted?.length ?? 0) > 80;

  return (
    <tr className="hover:bg-gray-50 align-top">
      <td className="px-4 py-3">
        <span
          className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold ${STATUS_STYLES[field.status]}`}
        >
          {STATUS_ICONS[field.status]}
        </span>
      </td>
      <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">{field.field}</td>
      <td className={`px-4 py-3 text-gray-600 ${isLong ? 'max-w-xs' : ''}`}>
        <TruncatedText text={field.expected} />
      </td>
      <td className={`px-4 py-3 ${isLong ? 'max-w-xs' : ''}`}>
        {field.extracted ? (
          <TruncatedText
            text={field.extracted}
            className={field.status === 'PASS' ? 'text-green-700' : field.status === 'WARNING' ? 'text-yellow-700' : 'text-red-700'}
          />
        ) : (
          <span className="text-red-500 italic">Not found</span>
        )}
      </td>
      <td className="px-4 py-3">
        <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${STATUS_STYLES[field.status]}`}>
          {field.status}
        </span>
        {field.note && (
          <p className="mt-1 text-xs text-gray-500">{field.note}</p>
        )}
      </td>
    </tr>
  );
}

function TruncatedText({ text, className = 'text-gray-600' }: { text: string; className?: string }) {
  const [expanded, setExpanded] = useState(false);
  const LIMIT = 100;

  if (text.length <= LIMIT) return <span className={className}>{text}</span>;

  return (
    <span className={className}>
      {expanded ? text : `${text.slice(0, LIMIT)}…`}{' '}
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-blue-500 hover:underline text-xs ml-1"
      >
        {expanded ? 'less' : 'more'}
      </button>
    </span>
  );
}
