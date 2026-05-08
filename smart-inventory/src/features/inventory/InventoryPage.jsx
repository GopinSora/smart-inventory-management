import { useMemo, useState, useRef, useCallback } from 'react';
import { Plus, Search, X, Boxes, Download, FileText, AlertTriangle } from 'lucide-react';
import { useInventory } from '@/context/InventoryContext';
import { CATEGORIES } from '@/config/constants';
import Button from '@/components/ui/Button';
import Input, { Select } from '@/components/ui/Input';
import { SectionHeading, EmptyState, Card } from '@/components/ui/Primitives';
import ItemRow from './ItemRow';
import ItemFormModal from './ItemFormModal';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import { cn } from '@/lib/helpers';
import { exportInventoryCSV } from '@/lib/exportCsv';
import { exportInventoryPDF, exportItemPDF } from '@/lib/exportPdf';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

const LOW_STOCK_THRESHOLD = 3;

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'name_az', label: 'Name A→Z' },
  { value: 'name_za', label: 'Name Z→A' },
  { value: 'qty_asc', label: 'Qty: low → high' },
  { value: 'qty_desc', label: 'Qty: high → low' },
];

function FilterChip({ label, icon: Icon, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full border transition-colors font-medium',
        active
          ? 'bg-accent-50 dark:bg-orange-950/40 border-accent-700 dark:border-orange-600 text-accent-800 dark:text-orange-300'
          : 'bg-white dark:bg-[#1e1d1a] border-cream-200 dark:border-[#2a2925] text-ink-600 dark:text-[#7a7870] hover:border-cream-400 dark:hover:border-[#6b6655]'
      )}
    >
      {Icon && <Icon className="w-3 h-3" />}
      {label}
    </button>
  );
}

function StatPill({ label, value, variant = 'default' }) {
  const colors = {
    default: 'text-ink-700 dark:text-[#b5b0a5]',
    danger: 'text-rose-700 dark:text-rose-400',
    warning: 'text-amber-700 dark:text-amber-400',
    success: 'text-emerald-700 dark:text-emerald-400',
  };
  return (
    <div className="flex items-center gap-2">
      <span className={cn('font-mono text-sm font-semibold num-tab', colors[variant])}>{value}</span>
      <span className="text-xs text-ink-400 dark:text-[#7a7870]">{label}</span>
    </div>
  );
}

export default function InventoryPage() {
  const { items, rooms, roomById, removeItem, editItem } = useInventory();

  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterCondition, setFilterCondition] = useState('All');
  const [filterRoom, setFilterRoom] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  const [itemModal, setItemModal] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const searchRef = useRef(null);

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: 'n',
      action: () => setItemModal({ mode: 'add' }),
      description: 'Add new item',
    },
    {
      key: '/',
      action: () => searchRef.current?.focus(),
      description: 'Focus search',
    },
  ]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let result = items.filter((i) => {
      if (filterCategory !== 'All' && i.category !== filterCategory) return false;
      if (filterCondition !== 'All' && (i.condition || 'Unspecified') !== filterCondition) return false;
      if (filterRoom !== 'All') {
        if (filterRoom === '__unassigned__' && i.roomId) return false;
        if (filterRoom !== '__unassigned__' && i.roomId !== filterRoom) return false;
      }
      if (!q) return true;
      return [i.brand, i.model, i.specifications]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });

    // Sort
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'name_az': return `${a.brand} ${a.model}`.localeCompare(`${b.brand} ${b.model}`);
        case 'name_za': return `${b.brand} ${b.model}`.localeCompare(`${a.brand} ${a.model}`);
        case 'qty_asc': return Number(a.quantity || 0) - Number(b.quantity || 0);
        case 'qty_desc': return Number(b.quantity || 0) - Number(a.quantity || 0);
        case 'oldest': {
          const aT = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
          const bT = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
          return aT - bT;
        }
        default: { // newest
          const aT = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
          const bT = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
          return bT - aT;
        }
      }
    });

    return result;
  }, [items, search, filterCategory, filterCondition, filterRoom, sortBy]);

  // Stats for filtered list
  const stats = useMemo(() => {
    const total = filtered.reduce((s, i) => s + Number(i.quantity || 0), 0);
    const faulty = filtered.filter((i) => i.condition === 'Faulty').reduce((s, i) => s + Number(i.quantity || 0), 0);
    const repair = filtered.filter((i) => i.condition === 'Repair').reduce((s, i) => s + Number(i.quantity || 0), 0);
    const lowStock = filtered.filter((i) => Number(i.quantity || 0) <= LOW_STOCK_THRESHOLD && Number(i.quantity || 0) >= 0);
    return { total, faulty, repair, lowStock: lowStock.length };
  }, [filtered]);

  const handleExport = useCallback(() => {
    const filename = `inventory-${new Date().toISOString().slice(0, 10)}.csv`;
    exportInventoryCSV(filtered, roomById, filename);
  }, [filtered, roomById]);

  const hasActiveFilters = filterCategory !== 'All' || filterCondition !== 'All' || filterRoom !== 'All' || search;

  const clearFilters = () => {
    setSearch('');
    setFilterCategory('All');
    setFilterCondition('All');
    setFilterRoom('All');
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <SectionHeading
        kicker="Inventory · Records"
        title="All hardware"
        action={
          <div className="flex items-center gap-2 md:gap-3">
            <span className="text-xs font-mono text-ink-500 dark:text-[#7a7870] num-tab hidden sm:inline">
              {filtered.length}<span className="text-ink-300 dark:text-[#38362f] mx-1">/</span>{items.length}
            </span>
            <button
              onClick={() => exportInventoryPDF(filtered, roomById, {
                category: filterCategory, condition: filterCondition, room: filterRoom,
              })}
              disabled={filtered.length === 0}
              title="Export to PDF"
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium border rounded-lg transition-colors text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100 dark:hover:bg-rose-950/40 disabled:opacity-40"
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export PDF</span>
            </button>
            <button
              onClick={() => {
                const filename = `inventory-${new Date().toISOString().slice(0, 10)}.csv`;
                exportInventoryCSV(filtered, roomById, filename);
              }}
              disabled={filtered.length === 0}
              title="Export to CSV"
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium border rounded-lg transition-colors text-ink-600 dark:text-[#b5b0a5] border-cream-200 dark:border-[#2a2925] bg-white dark:bg-[#1e1d1a] hover:bg-cream-50 dark:hover:bg-[#2a2925] disabled:opacity-40"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">CSV</span>
            </button>
            <Button icon={Plus} onClick={() => setItemModal({ mode: 'add' })}>
              <span className="hidden sm:inline">Add item</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>
        }
      />

      {/* Filter & search card */}
      <Card className="p-4 md:p-5 space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-ink-400 dark:text-[#7a7870] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <Input
              ref={searchRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search brand, model, specs… (press / to focus)"
              className="pl-10"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 dark:text-[#7a7870] hover:text-ink-700 dark:hover:text-[#f0ede6]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {/* Sort */}
          <div className="shrink-0">
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs py-2.5 pr-8 pl-3"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </Select>
          </div>
        </div>

        {/* Category chips */}
        <div className="flex flex-wrap gap-2">
          <FilterChip label="All" active={filterCategory === 'All'} onClick={() => setFilterCategory('All')} />
          {CATEGORIES.map((c) => {
            const Ico = c.icon;
            return (
              <FilterChip key={c.id} label={c.id} icon={Ico} active={filterCategory === c.id} onClick={() => setFilterCategory(c.id)} />
            );
          })}
        </div>

        {/* Condition + Room selects */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <Select value={filterCondition} onChange={(e) => setFilterCondition(e.target.value)}>
            <option value="All">All conditions</option>
            <option value="Working">✅ Working</option>
            <option value="Faulty">⚠️ Faulty</option>
            <option value="Repair">🔧 Repair</option>
            <option value="Unspecified">— Unspecified</option>
          </Select>
          <Select value={filterRoom} onChange={(e) => setFilterRoom(e.target.value)}>
            <option value="All">All rooms</option>
            <option value="__unassigned__">Unassigned</option>
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </Select>
        </div>

        {/* Clear filters */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-xs text-accent-700 dark:text-orange-400 hover:underline font-mono uppercase tracking-widest"
          >
            ✕ Clear all filters
          </button>
        )}
      </Card>

      {/* Stats bar */}
      {filtered.length > 0 && (
        <div className="flex flex-wrap items-center gap-4 px-1">
          <StatPill label="units in view" value={stats.total} />
          {stats.faulty > 0 && <StatPill label="faulty" value={stats.faulty} variant="danger" />}
          {stats.repair > 0 && <StatPill label="in repair" value={stats.repair} variant="warning" />}
          {stats.lowStock > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium">
              <AlertTriangle className="w-3.5 h-3.5" />
              {stats.lowStock} low-stock record{stats.lowStock !== 1 ? 's' : ''}
            </div>
          )}
          <span className="text-xs text-ink-300 dark:text-[#38362f] font-mono">
            Press <kbd className="px-1 py-0.5 bg-cream-100 dark:bg-[#2a2925] border border-cream-200 dark:border-[#38362f] rounded text-[10px]">N</kbd> to add
          </span>
        </div>
      )}

      {/* Item list */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Boxes}
          title={items.length === 0 ? 'No items yet' : 'No items match your filters'}
          body={
            items.length === 0
              ? 'Add your first piece of hardware to start your register. Press N anytime.'
              : 'Try clearing filters or adjusting your search.'
          }
          action={
            items.length === 0 ? (
              <Button icon={Plus} onClick={() => setItemModal({ mode: 'add' })}>Add item</Button>
            ) : (
              <Button variant="ghost" onClick={clearFilters}>Clear filters</Button>
            )
          }
        />
      ) : (
        <Card className="overflow-hidden">
          {filtered.map((it, idx) => (
            <ItemRow
              key={it.id}
              item={it}
              room={it.roomId ? roomById[it.roomId] : null}
              onEdit={() => setItemModal({ mode: 'edit', item: it })}
              onDelete={() => setConfirm({ type: 'item', target: it })}
              onPdf={() => exportItemPDF(it, it.roomId && roomById[it.roomId] ? roomById[it.roomId].name : 'Unassigned')}
              onQuantityChange={(delta) => {
                const newQty = Math.max(0, Number(it.quantity || 0) + delta);
                editItem(it.id, { ...it, quantity: newQty });
              }}
              isLast={idx === filtered.length - 1}
              lowStockThreshold={LOW_STOCK_THRESHOLD}
            />
          ))}
        </Card>
      )}

      {itemModal && (
        <ItemFormModal
          mode={itemModal.mode}
          initial={itemModal.item}
          onClose={() => setItemModal(null)}
          onRequestDelete={() => {
            setConfirm({ type: 'item', target: itemModal.item });
            setItemModal(null);
          }}
        />
      )}

      {confirm && (
        <ConfirmDeleteModal
          type={confirm.type}
          target={confirm.target}
          onClose={() => setConfirm(null)}
          onConfirmed={async () => {
            await removeItem(confirm.target.id);
            setConfirm(null);
          }}
        />
      )}
    </div>
  );
}
