import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TTB Label Verification',
  description: 'AI-powered alcohol label compliance checker',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-100 min-h-screen antialiased">
        <header className="bg-blue-900 text-white shadow-md">
          <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-4">
            <div className="text-2xl">🏛️</div>
            <div>
              <h1 className="text-xl font-bold leading-tight">TTB Label Verification</h1>
              <p className="text-blue-300 text-sm">Alcohol and Tobacco Tax and Trade Bureau — Label Compliance Tool</p>
            </div>
          </div>
        </header>
        <main className="max-w-5xl mx-auto px-6 py-10">{children}</main>
        <footer className="text-center text-xs text-gray-400 py-6">
          Prototype only — not for production regulatory use
        </footer>
      </body>
    </html>
  );
}
