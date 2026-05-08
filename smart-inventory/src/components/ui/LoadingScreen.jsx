import { Package } from 'lucide-react';

export default function LoadingScreen({ label = 'Loading' }) {
  return (
    <div className="min-h-screen bg-cream-50 dark:bg-[#141412] flex items-center justify-center transition-colors duration-300">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 bg-accent-700 dark:bg-orange-600 text-cream-50 rounded-xl flex items-center justify-center shadow-soft animate-pulse-soft">
          <Package className="w-6 h-6" strokeWidth={2.25} />
        </div>
        <div className="text-xs font-mono uppercase tracking-[0.2em] text-ink-500 dark:text-[#7a7870]">
          {label}
        </div>
      </div>
    </div>
  );
}
