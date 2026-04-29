import { Package, Boxes, Sparkles, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-cream-50">
      {/* Left: brand panel */}
      <aside className="relative hidden lg:flex lg:w-[44%] xl:w-[40%] flex-col justify-between p-12 xl:p-16 bg-cream-100 border-r border-cream-200 overflow-hidden">
        <div className="absolute inset-0 grid-paper opacity-50" />
        <div className="absolute inset-0 warm-glow opacity-90" />

        <div className="relative">
          <Link to="/" className="inline-flex items-center gap-3">
            <div className="w-10 h-10 bg-accent-700 text-cream-50 rounded-lg flex items-center justify-center shadow-soft">
              <Package className="w-5 h-5" strokeWidth={2.25} />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-ink-500">
                Asset Register
              </div>
              <div className="font-display text-lg text-ink-900 leading-tight">
                Smart Inventory
              </div>
            </div>
          </Link>
        </div>

        <div className="relative max-w-md">
          <h1 className="font-display text-5xl xl:text-6xl text-ink-900 leading-[0.98] mb-6">
            Hardware,
            <br />
            <span className="italic text-accent-700">accounted for.</span>
          </h1>
          <p className="text-ink-600 leading-relaxed mb-10 text-balance">
            A calm, organized way to track every keyboard, mouse, monitor, and CPU across your labs and rooms — with a built-in assistant to answer questions about your inventory.
          </p>

          <ul className="space-y-3.5">
            {[
              { icon: Boxes, text: 'Real-time CRUD with cloud sync' },
              { icon: ShieldCheck, text: 'Per-user secure access via Firebase' },
              { icon: Sparkles, text: 'Conversational assistant for instant answers' },
            ].map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm text-ink-700">
                <span className="w-7 h-7 rounded-full bg-cream-200 border border-cream-300 flex items-center justify-center shrink-0">
                  <Icon className="w-3.5 h-3.5 text-accent-700" strokeWidth={2} />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative text-[11px] font-mono uppercase tracking-[0.22em] text-ink-400">
          v1.0 · Gopin Sora · MCA · ADTU
        </div>
      </aside>

      {/* Right: form panel */}
      <main className="flex-1 flex flex-col">
        <div className="flex items-center justify-between p-6 lg:hidden border-b border-cream-200">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="w-9 h-9 bg-accent-700 text-cream-50 rounded-lg flex items-center justify-center">
              <Package className="w-4.5 h-4.5" strokeWidth={2.25} />
            </div>
            <span className="font-display text-base text-ink-900">Smart Inventory</span>
          </Link>
        </div>
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </main>
    </div>
  );
}
