import { CONDITION_META } from '@/config/constants';
import { cn } from '@/lib/helpers';

export default function ConditionBadge({ condition, className }) {
  const meta = CONDITION_META[condition || 'Unspecified'];
  const Ico = meta.icon;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] uppercase tracking-widest font-mono border rounded-full',
        meta.bg,
        meta.border,
        meta.text,
        className
      )}
    >
      <Ico className="w-2.5 h-2.5" />
      {condition || 'Unspecified'}
    </span>
  );
}
