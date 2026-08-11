'use client';

import { useState } from 'react';
import UploadForm from './UploadForm';
import ComplianceReport from './ComplianceReport';
import type { ApplicationData, VerifyResponse } from '@/types/label';

export default function VerificationApp() {
  const [result, setResult] = useState<VerifyResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(image: File, appData: ApplicationData) {
    setIsLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('image', image);
    formData.append('appData', JSON.stringify(appData));

    try {
      const response = await fetch('/api/verify', { method: 'POST', body: formData });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? 'Verification failed');
      setResult(data as VerifyResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-10">
      <UploadForm onSubmit={handleSubmit} isLoading={isLoading} />

      {isLoading && (
        <div className="flex flex-col items-center gap-4 py-12">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-700 rounded-full animate-spin" />
          <p className="text-lg text-gray-600 font-medium">Analyzing label with GPT-4o…</p>
          <p className="text-sm text-gray-400">Usually completes in 3–6 seconds</p>
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-5">
          <p className="font-semibold text-red-800 text-lg mb-1">Verification Error</p>
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {result && !isLoading && (
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-5">Compliance Report</h2>
          <ComplianceReport report={result.report} extracted={result.extracted} />
        </div>
      )}
    </div>
  );
}
