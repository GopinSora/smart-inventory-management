import { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/helpers';

export default function Modal({ children, onClose, size = 'md' }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
      <div className="absolute inset-0 bg-ink-950/40 backdrop-blur-sm" onClick={onClose} />
      <div
        className={cn(
          'relative bg-cream-50 border border-cream-200 rounded-t-2xl sm:rounded-2xl w-full max-h-[92vh] overflow-y-auto shadow-lifted animate-scale-in',
          sizes[size]
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function ModalHeader({ kicker, title, onClose }) {
  return (
    <div className="flex items-start justify-between gap-4 p-6 pb-4">
      <div>
        {kicker && (
          <div className="text-[10px] uppercase tracking-[0.22em] font-mono text-ink-500 mb-1.5">
            {kicker}
          </div>
        )}
        <h3 className="font-display text-2xl text-ink-900 leading-tight">{title}</h3>
      </div>
      <button
        onClick={onClose}
        className="text-ink-500 hover:text-ink-900 p-1 rounded-md hover:bg-cream-100 transition-colors"
        aria-label="Close"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}

export function ModalBody({ children, className }) {
  return <div className={cn('px-6', className)}>{children}</div>;
}

export function ModalFooter({ children, className }) {
  return (
    <div className={cn('flex items-center justify-end gap-2 p-6 pt-5 mt-2 border-t border-cream-200', className)}>
      {children}
    </div>
  );
}
