import { useState, useMemo } from 'react';
import { Boxes, Building2, Plus, Sparkles, ArrowUpRight, AlertTriangle, Wrench, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useInventory } from '@/context/InventoryContext';
import { useAuth } from '@/context/AuthContext';
import { CATEGORIES, CONDITION_META } from '@/config/constants';
import Button from '@/components/ui/Button';
import { SectionHeading, EmptyState, Card, Label } from '@/components/ui/Primitives';
import ItemRow from '@/features/inventory/ItemRow';
import ItemFormModal from '@/features/inventory/ItemFormModal';
import ConfirmDeleteModal from '@/features/inventory/ConfirmDeleteModal';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { exportInventoryCSV } from '@/lib/exportCsv';

const LOW_STOCK_THRESHOLD = 3;

export default function DashboardPage() {
  const { user } = useAuth();
  const { items, rooms, stats, roomById, seedDemo, removeItem, editItem } = useInventory();
  const navigate = useNavigate();

  const [itemModal, setItemModal] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [seeding, setSeeding] = useState(false);

  useKeyboardShortcuts([
    { key: 'n', action: () => setItemModal({ mode: 'add' }), description: 'Add item' },
  ]);

  const recent = useMemo(
    () =>
      [...items]
        .sort((a, b) => {
          const aT = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
          const bT = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
          return bT - aT;
        })
        .slice(0, 5),
    [items]
  );

  const lowStockItems = useMemo(
    () => items.filter((i) => Number(i.quantity || 0) <= LOW_STOCK_THRESHOLD && Number(i.quantity || 0) >= 0),
    [items]
  );

  const faultyCount = stats.byCond['Faulty'] || 0;
  const repairCount = stats.byCond['Repair'] || 0;
  const hasAlerts = faultyCount > 0 || repairCount > 0 || lowStockItems.length > 0;

  const condTotal = Object.values(stats.byCond).reduce((a, b) => a + b, 0) || 1;
  const firstName = (user?.displayName || user?.email?.split('@')[0] || '').split(' ')[0];

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await seedDemo();
      toast.success('Demo data loaded');
    } catch (err) {
      toast.error('Could not load demo data');
      console.error(err);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="space-y-10 animate-fade-up">
      {/* Alert banner */}
      {hasAlerts && items.length > 0 && (
        <div className="flex flex-wrap gap-2 md:gap-3 p-4 rounded-xl border border-amber-200 dark:border-amber-800/40 bg-amber-50/80 dark:bg-amber-950/20">
          {faultyCount > 0 && (
            <button
              onClick={() => navigate('/inventory')}
              className="flex items-center gap-2 text-sm text-amber-800 dark:text-amber-300 font-medium hover:underline"
            >
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              {faultyCount} unit{faultyCount !== 1 ? 's' : ''} marked Faulty
            </button>
          )}
          {repairCount > 0 && (
            <>
              {faultyCount > 0 && <span className="text-amber-400">·</span>}
              <button
                onClick={() => navigate('/inventory')}
                className="flex items-center gap-2 text-sm text-amber-800 dark:text-amber-300 font-medium hover:underline"
              >
                <Wrench className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                {repairCount} unit{repairCount !== 1 ? 's' : ''} in Repair
              </button>
            </>
          )}
          {lowStockItems.length > 0 && (
            <>
              {(faultyCount > 0 || repairCount > 0) && <span className="text-amber-400">·</span>}
              <button
                onClick={() => navigate('/inventory')}
                className="flex items-center gap-2 text-sm text-rose-700 dark:text-rose-400 font-medium hover:underline"
              >
                <AlertTriangle className="w-4 h-4" />
                {lowStockItems.length} low-stock item{lowStockItems.length !== 1 ? 's' : ''} (≤ {LOW_STOCK_THRESHOLD} units)
              </button>
            </>
          )}
          <span className="ml-auto text-[11px] font-mono text-amber-600 dark:text-amber-500 uppercase tracking-widest self-center">
            Action required
          </span>
        </div>
      )}

      {/* Hero */}
      <section>
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <Label className="mb-3">001 / Overview {firstName && `· Welcome, ${firstName}`}</Label>
            <h1 className="font-display text-4xl md:text-6xl text-ink-900 dark:text-[#f0ede6] leading-[0.98] text-balance">
              <span className="italic text-accent-700 dark:text-orange-400">{stats.total}</span> units
              <span className="text-ink-400 dark:text-[#7a7870]"> across </span>
              <span className="italic">{stats.lineCount}</span> records
            </h1>
            <p className="mt-4 text-ink-600 dark:text-[#7a7870] max-w-xl text-sm leading-relaxed text-balance">
              A live ledger of every keyboard, mouse, monitor, and CPU under your watch.
              Track condition, route hardware to rooms, and keep counts honest without spreadsheets.
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {items.length > 0 && (
              <button
                onClick={() => exportInventoryCSV(items, roomById)}
                className="inline-flex items-center gap-2 px-4 py-2.5 border border-cream-200 dark:border-[#2a2925] bg-white dark:bg-[#1e1d1a] hover:bg-cream-50 dark:hover:bg-[#2a2925] text-ink-700 dark:text-[#b5b0a5] rounded-lg text-sm transition-colors shrink-0 font-medium"
              >
                <Download className="w-4 h-4" />
                Export all
              </button>
            )}
            {items.length === 0 && rooms.length === 0 && (
              <button
                onClick={handleSeed}
                disabled={seeding}
                className="inline-flex items-center gap-2 px-4 py-2.5 border border-accent-200 dark:border-orange-800/50 bg-accent-50 dark:bg-orange-950/30 hover:bg-accent-100 dark:hover:bg-orange-950/50 text-accent-800 dark:text-orange-300 rounded-lg text-sm transition-colors shrink-0 font-medium disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                {seeding ? 'Loading…' : 'Load demo data'}
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Category cards */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {CATEGORIES.map((c, i) => {
          const Ico = c.icon;
          const count = stats.byCat[c.id] || 0;
          const records = items.filter((it) => it.category === c.id).length;
          const catLow = items.filter(
            (it) => it.category === c.id && Number(it.quantity || 0) <= LOW_STOCK_THRESHOLD
          ).length;
          return (
            <Card
              key={c.id}
              className="group relative p-5 hover:border-accent-200 dark:hover:border-orange-800/50 transition-colors animate-fade-up cursor-pointer"
              style={{ animationDelay: `${i * 50}ms` }}
              onClick={() => navigate('/inventory')}
            >
              <div className="flex items-start justify-between mb-6">
                <div className="w-9 h-9 bg-cream-100 dark:bg-[#2a2925] border border-cream-200 dark:border-[#38362f] rounded-lg flex items-center justify-center group-hover:bg-accent-50 dark:group-hover:bg-orange-950/40 group-hover:border-accent-200 dark:group-hover:border-orange-800/50 transition-colors">
                  <Ico className="w-4 h-4 text-ink-700 dark:text-[#b5b0a5] group-hover:text-accent-700 dark:group-hover:text-orange-400 transition-colors" strokeWidth={1.75} />
                </div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-ink-400 dark:text-[#7a7870]">
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>
              <div className="font-display text-4xl md:text-5xl italic text-ink-900 dark:text-[#f0ede6] num-tab leading-none">
                {count}
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <div className="text-sm text-ink-700 dark:text-[#b5b0a5]">{c.id}</div>
                <div className="flex items-center gap-2">
                  {catLow > 0 && (
                    <span className="text-[9px] font-bold uppercase tracking-widest text-rose-600 dark:text-rose-400">LOW</span>
                  )}
                  <div className="font-mono text-[10px] uppercase tracking-widest text-ink-400 dark:text-[#7a7870]">
                    {records} rec
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </section>

      {/* Condition + Rooms summary */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6">
          <SectionHeading kicker="002 / Condition" title="By operating status" />
          <div className="space-y-3.5">
            {['Working', 'Repair', 'Faulty', 'Unspecified'].map((k) => {
              const meta = CONDITION_META[k];
              const v = stats.byCond[k] || 0;
              const pct = condTotal > 0 ? (v / condTotal) * 100 : 0;
              return (
                <div key={k}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                      <span className="text-sm text-ink-700 dark:text-[#b5b0a5]">{k}</span>
                    </div>
                    <div className="font-mono text-xs text-ink-600 dark:text-[#7a7870] num-tab">
                      {v} <span className="text-ink-300 dark:text-[#38362f]">·</span> {pct.toFixed(0)}%
                    </div>
                  </div>
                  <div className="h-1.5 bg-cream-100 dark:bg-[#2a2925] rounded-full overflow-hidden">
                    <div
                      className={`h-full ${meta.dot} transition-all duration-700`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-6">
          <SectionHeading kicker="003 / Locations" title="Rooms" />
          {rooms.length === 0 ? (
            <div className="text-sm text-ink-500 dark:text-[#7a7870]">
              No rooms yet.
              <button
                onClick={() => navigate('/rooms')}
                className="block mt-2 text-accent-700 dark:text-orange-400 hover:text-accent-800 dark:hover:text-orange-300 font-mono text-xs uppercase tracking-widest"
              >
                Add a room →
              </button>
            </div>
          ) : (
            <ul className="space-y-3">
              {rooms.slice(0, 5).map((r) => {
                const count = items
                  .filter((i) => i.roomId === r.id)
                  .reduce((s, i) => s + Number(i.quantity || 0), 0);
                return (
                  <li
                    key={r.id}
                    className="flex items-center justify-between gap-3 py-1 group cursor-pointer"
                    onClick={() => navigate('/rooms')}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Building2 className="w-3.5 h-3.5 text-ink-400 dark:text-[#7a7870] shrink-0" />
                      <span className="text-sm text-ink-700 dark:text-[#b5b0a5] truncate group-hover:text-accent-700 dark:group-hover:text-orange-400 transition-colors">
                        {r.name}
                      </span>
                    </div>
                    <span className="font-mono text-xs text-ink-500 dark:text-[#7a7870] num-tab shrink-0">{count}</span>
                  </li>
                );
              })}
              {rooms.length > 5 && (
                <li className="text-xs text-ink-400 dark:text-[#7a7870] font-mono text-center pt-1">
                  +{rooms.length - 5} more
                </li>
              )}
            </ul>
          )}
        </Card>
      </section>

      {/* Recent items */}
      <section>
        <SectionHeading
          kicker="004 / Latest"
          title="Recently added"
          action={
            items.length > 0 && (
              <button
                onClick={() => navigate('/inventory')}
                className="text-accent-700 dark:text-orange-400 hover:text-accent-800 dark:hover:text-orange-300 text-xs uppercase tracking-widest font-mono inline-flex items-center gap-1"
              >
                View all <ArrowUpRight className="w-3 h-3" />
              </button>
            )
          }
        />
        {recent.length === 0 ? (
          <EmptyState
            icon={Boxes}
            title="No items yet"
            body="Add your first piece of hardware to start building your inventory. Press N anytime."
            action={
              <Button icon={Plus} onClick={() => setItemModal({ mode: 'add' })}>Add first item</Button>
            }
          />
        ) : (
          <Card className="overflow-hidden">
            {recent.map((it, idx) => (
              <ItemRow
                key={it.id}
                item={it}
                room={it.roomId ? roomById[it.roomId] : null}
                onEdit={() => setItemModal({ mode: 'edit', item: it })}
                onDelete={() => setConfirm({ type: 'item', target: it })}
                onQuantityChange={(delta) => {
                  const newQty = Math.max(0, Number(it.quantity || 0) + delta);
                  editItem(it.id, { ...it, quantity: newQty });
                }}
                isLast={idx === recent.length - 1}
                lowStockThreshold={LOW_STOCK_THRESHOLD}
              />
            ))}
          </Card>
        )}
      </section>

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
