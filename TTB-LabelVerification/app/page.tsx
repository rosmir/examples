import VerificationApp from '@/components/VerificationApp';

export default function Home() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Label Compliance Check</h2>
        <p className="text-gray-500 mt-1">
          Upload a label image and enter the application data to verify compliance against TTB requirements.
        </p>
      </div>
      <VerificationApp />
    </div>
  );
}
