import {
  Keyboard, Mouse, Monitor, Cpu,
  CheckCircle2, AlertTriangle, Wrench, HelpCircle,
} from 'lucide-react';

export const CATEGORIES = [
  { id: 'Keyboard', icon: Keyboard },
  { id: 'Mouse', icon: Mouse },
  { id: 'Monitor', icon: Monitor },
  { id: 'CPU', icon: Cpu },
];

export const CATEGORY_IDS = CATEGORIES.map((c) => c.id);

export const CONDITION_META = {
  Working: {
    icon: CheckCircle2,
    text: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
  },
  Faulty: {
    icon: AlertTriangle,
    text: 'text-rose-700',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    dot: 'bg-rose-500',
  },
  Repair: {
    icon: Wrench,
    text: 'text-amber-800',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
  },
  Unspecified: {
    icon: HelpCircle,
    text: 'text-ink-500',
    bg: 'bg-ink-50',
    border: 'border-ink-200',
    dot: 'bg-ink-400',
  },
};

export const CONDITION_OPTIONS = ['Working', 'Faulty', 'Repair'];
