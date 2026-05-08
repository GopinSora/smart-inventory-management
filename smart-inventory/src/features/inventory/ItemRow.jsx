import { useState } from 'react';
import { Edit3, Trash2, Hash, Calendar, MapPin, Package, Minus, Plus, AlertTriangle, FileText, FileDown } from 'lucide-react';
import { CATEGORIES } from '@/config/constants';
import { fmtDate, cn } from '@/lib/helpers';
import { Pill } from '@/components/ui/Primitives';
import ConditionBadge from '@/components/ui/ConditionBadge';

export default function ItemRow({
  item,
  room,
  onEdit,
  onDelete,
  onPdf,
  onQuantityChange,
  isLast,
  hideRoom,
  lowStockThreshold = 3,
}) {
  const cat = CATEGORIES.find((c) => c.id === item.category);
  const Ico = cat ? cat.icon : Package;
  const qty = Number(item.quantity || 0);
  const isLow = qty <= lowStockThreshold;
  const [showSpec, setShowSpec] = useState(false);

  return (
    <div
      className={cn(
        'group flex items-center gap-3 md:gap-4 px-4 md:px-5 py-3.5 hover:bg-cream-50 dark:hover:bg-[#252420] transition-colors',
        !isLast && 'border-b border-cream-200 dark:border-[#2a2925]'
      )}
    >
      {/* Category icon */}
      <div className="w-10 h-10 shrink-0 bg-cream-100 dark:bg-[#2a2925] border border-cream-200 dark:border-[#38362f] rounded-lg flex items-center justify-center">
        <Ico className="w-4 h-4 text-ink-700 dark:text-[#b5b0a5]" strokeWidth={1.75} />
      </div>

      {/* Main info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-[10px] uppercase tracking-widest font-mono text-ink-500 dark:text-[#7a7870]">
            {item.category}
          </span>
          <span className="text-cream-400 dark:text-[#38362f]">·</span>
          <span className="text-sm text-ink-900 dark:text-[#f0ede6] font-medium truncate">
            {item.brand} {item.model}
          </span>
          {isLow && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest rounded bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
              <AlertTriangle className="w-2.5 h-2.5" />
              LOW
            </span>
          )}
        </div>

        {/* Specs tooltip toggle */}
        {item.specifications && (
          <button
            onClick={() => setShowSpec((s) => !s)}
            className="text-xs text-ink-500 dark:text-[#7a7870] mt-0.5 text-left hover:text-ink-700 dark:hover:text-[#f0ede6] transition-colors flex items-center gap-1 group/spec"
          >
            <FileText className="w-3 h-3 shrink-0 opacity-60 group-hover/spec:opacity-100" />
            <span className={cn(showSpec ? '' : 'truncate')}>{item.specifications}</span>
          </button>
        )}

        {/* Badges row */}
        <div className="flex flex-wrap items-center gap-2 mt-2">
          {/* Inline quantity control */}
          {onQuantityChange ? (
            <div className="flex items-center gap-1">
              <button
                onClick={() => onQuantityChange(-1)}
                disabled={qty <= 0}
                className="w-5 h-5 rounded border border-cream-300 dark:border-[#38362f] bg-cream-50 dark:bg-[#1e1d1a] flex items-center justify-center text-ink-500 dark:text-[#7a7870] hover:bg-cream-200 dark:hover:bg-[#2a2925] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                aria-label="Decrease quantity"
              >
                <Minus className="w-2.5 h-2.5" />
              </button>
              <span className={cn(
                'font-mono text-[11px] font-semibold num-tab min-w-[1.5rem] text-center',
                isLow ? 'text-rose-600 dark:text-rose-400' : 'text-ink-700 dark:text-[#b5b0a5]'
              )}>
                {qty}
              </span>
              <button
                onClick={() => onQuantityChange(1)}
                className="w-5 h-5 rounded border border-cream-300 dark:border-[#38362f] bg-cream-50 dark:bg-[#1e1d1a] flex items-center justify-center text-ink-500 dark:text-[#7a7870] hover:bg-cream-200 dark:hover:bg-[#2a2925] transition-colors"
                aria-label="Increase quantity"
              >
                <Plus className="w-2.5 h-2.5" />
              </button>
            </div>
          ) : (
            <Pill icon={Hash} className="border-cream-300 dark:border-[#38362f] bg-cream-50 dark:bg-[#1e1d1a] text-ink-700 dark:text-[#b5b0a5]">
              {qty}
            </Pill>
          )}

          <ConditionBadge condition={item.condition} />

          {item.purchaseDate && (
            <Pill icon={Calendar} className="border-cream-300 dark:border-[#38362f] bg-cream-50 dark:bg-[#1e1d1a] text-ink-600 dark:text-[#7a7870]">
              {fmtDate(item.purchaseDate)}
            </Pill>
          )}
          {!hideRoom && room && (
            <Pill icon={MapPin} className="border-cream-300 dark:border-[#38362f] bg-cream-50 dark:bg-[#1e1d1a] text-ink-700 dark:text-[#b5b0a5]">
              {room.name}
            </Pill>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        {onPdf && (
          <button
            onClick={onPdf}
            className="p-2 text-ink-500 dark:text-[#7a7870] hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-md transition-colors"
            aria-label="Download PDF"
            title="Download item PDF"
          >
            <FileDown className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={onEdit}
          className="p-2 text-ink-500 dark:text-[#7a7870] hover:text-accent-700 dark:hover:text-orange-400 hover:bg-cream-100 dark:hover:bg-[#2a2925] rounded-md transition-colors"
          aria-label="Edit"
        >
          <Edit3 className="w-4 h-4" />
        </button>
        {onDelete && (
          <button
            onClick={onDelete}
            className="p-2 text-ink-500 dark:text-[#7a7870] hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-md transition-colors"
            aria-label="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
