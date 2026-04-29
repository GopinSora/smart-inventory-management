import { Edit3, Trash2, Hash, Calendar, MapPin, Package } from 'lucide-react';
import { CATEGORIES } from '@/config/constants';
import { fmtDate, cn } from '@/lib/helpers';
import { Pill } from '@/components/ui/Primitives';
import ConditionBadge from '@/components/ui/ConditionBadge';

export default function ItemRow({ item, room, onEdit, onDelete, isLast, hideRoom }) {
  const cat = CATEGORIES.find((c) => c.id === item.category);
  const Ico = cat ? cat.icon : Package;
  return (
    <div
      className={cn(
        'group flex items-center gap-3 md:gap-5 px-4 md:px-5 py-4 hover:bg-cream-50 transition-colors',
        !isLast && 'border-b border-cream-200'
      )}
    >
      <div className="w-10 h-10 shrink-0 bg-cream-100 border border-cream-200 rounded-lg flex items-center justify-center">
        <Ico className="w-4 h-4 text-ink-700" strokeWidth={1.75} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-[10px] uppercase tracking-widest font-mono text-ink-500">
            {item.category}
          </span>
          <span className="text-cream-400">·</span>
          <span className="text-sm text-ink-900 font-medium truncate">
            {item.brand} {item.model}
          </span>
        </div>
        {item.specifications && (
          <div className="text-xs text-ink-500 mt-0.5 truncate">{item.specifications}</div>
        )}
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <Pill icon={Hash} className="border-cream-300 bg-cream-50 text-ink-700">
            {item.quantity}
          </Pill>
          <ConditionBadge condition={item.condition} />
          {item.purchaseDate && (
            <Pill icon={Calendar} className="border-cream-300 bg-cream-50 text-ink-600">
              {fmtDate(item.purchaseDate)}
            </Pill>
          )}
          {!hideRoom && room && (
            <Pill icon={MapPin} className="border-cream-300 bg-cream-50 text-ink-700">
              {room.name}
            </Pill>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={onEdit}
          className="p-2 text-ink-500 hover:text-accent-700 hover:bg-cream-100 rounded-md transition-colors"
          aria-label="Edit"
        >
          <Edit3 className="w-4 h-4" />
        </button>
        {onDelete && (
          <button
            onClick={onDelete}
            className="p-2 text-ink-500 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
            aria-label="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
