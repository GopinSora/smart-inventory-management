import { cn } from '@/lib/helpers';

export function Label({ children, required, className }) {
  return (
    <div className={cn('text-[10px] uppercase tracking-[0.2em] font-mono text-ink-500', className)}>
      {children}
      {required && <span className="text-accent-700 ml-1">*</span>}
    </div>
  );
}

export function Field({ label, required, children, hint, error }) {
  return (
    <label className="block">
      <div className="flex items-center justify-between mb-1.5">
        <Label required={required}>{label}</Label>
        {(hint || error) && (
          <span
            className={cn(
              'text-[10px] font-mono',
              error ? 'text-rose-600' : 'text-ink-400'
            )}
          >
            {error || hint}
          </span>
        )}
      </div>
      {children}
    </label>
  );
}

export function Pill({ children, className, icon: Icon }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] uppercase tracking-widest font-mono border rounded-full',
        className
      )}
    >
      {Icon && <Icon className="w-2.5 h-2.5" />}
      {children}
    </span>
  );
}

export function SectionHeading({ kicker, title, action, className }) {
  return (
    <div className={cn('flex items-end justify-between gap-4 mb-5', className)}>
      <div>
        <Label className="mb-1.5">{kicker}</Label>
        <h2 className="font-display text-2xl md:text-3xl text-ink-900 leading-tight">
          {title}
        </h2>
      </div>
      {action}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, body, action }) {
  return (
    <div className="border border-dashed border-cream-300 bg-cream-50/50 rounded-2xl py-14 px-6 flex flex-col items-center text-center">
      {Icon && <Icon className="w-9 h-9 text-cream-400 mb-4" strokeWidth={1.5} />}
      <div className="font-display text-xl text-ink-800 mb-1">{title}</div>
      {body && <p className="text-sm text-ink-500 max-w-md mb-5 text-balance">{body}</p>}
      {action}
    </div>
  );
}

export function Card({ children, className, ...props }) {
  return (
    <div
      className={cn(
        'bg-white border border-cream-200 rounded-2xl shadow-soft',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
