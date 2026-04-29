import { Package } from 'lucide-react';

export default function LoadingScreen({ label = 'Loading' }) {
  return (
    <div className="min-h-screen bg-cream-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 bg-accent-700 text-cream-50 rounded-xl flex items-center justify-center shadow-soft animate-pulse-soft">
          <Package className="w-6 h-6" strokeWidth={2.25} />
        </div>
        <div className="text-xs font-mono uppercase tracking-[0.2em] text-ink-500">
          {label}
        </div>
      </div>
    </div>
  );
}
