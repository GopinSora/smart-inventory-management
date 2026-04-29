import { useState } from 'react';
import { Boxes, Building2, Plus, Sparkles, ArrowUpRight } from 'lucide-react';
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

export default function DashboardPage() {
  const { user } = useAuth();
  const { items, rooms, stats, roomById, seedDemo, removeItem } = useInventory();
  const navigate = useNavigate();

  const [itemModal, setItemModal] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [seeding, setSeeding] = useState(false);

  const recent = [...items]
    .sort((a, b) => {
      const aT = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
      const bT = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
      return bT - aT;
    })
    .slice(0, 5);

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
    <div className="space-y-12 animate-fade-up">
      {/* Hero */}
      <section>
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <Label className="mb-3">001 / Overview {firstName && `· Welcome, ${firstName}`}</Label>
            <h1 className="font-display text-4xl md:text-6xl text-ink-900 leading-[0.98] text-balance">
              <span className="italic text-accent-700">{stats.total}</span> units
              <span className="text-ink-400"> across </span>
              <span className="italic">{stats.lineCount}</span> records
            </h1>
            <p className="mt-4 text-ink-600 max-w-xl text-sm leading-relaxed text-balance">
              A live ledger of every keyboard, mouse, monitor, and CPU under your watch.
              Track condition, route hardware to rooms, and keep counts honest without spreadsheets.
            </p>
          </div>
          {items.length === 0 && rooms.length === 0 && (
            <button
              onClick={handleSeed}
              disabled={seeding}
              className="inline-flex items-center gap-2 px-4 py-2.5 border border-accent-200 bg-accent-50 hover:bg-accent-100 text-accent-800 rounded-lg text-sm transition-colors shrink-0 font-medium disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              {seeding ? 'Loading…' : 'Load demo data'}
            </button>
          )}
        </div>
      </section>

      {/* Category cards */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {CATEGORIES.map((c, i) => {
          const Ico = c.icon;
          const count = stats.byCat[c.id] || 0;
          const records = items.filter((it) => it.category === c.id).length;
          return (
            <Card
              key={c.id}
              className="group relative p-5 hover:border-accent-200 transition-colors animate-fade-up"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="flex items-start justify-between mb-6">
                <div className="w-9 h-9 bg-cream-100 border border-cream-200 rounded-lg flex items-center justify-center group-hover:bg-accent-50 group-hover:border-accent-200 transition-colors">
                  <Ico className="w-4 h-4 text-ink-700 group-hover:text-accent-700 transition-colors" strokeWidth={1.75} />
                </div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-ink-400">
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>
              <div className="font-display text-4xl md:text-5xl italic text-ink-900 num-tab leading-none">
                {count}
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <div className="text-sm text-ink-700">{c.id}</div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-ink-400">
                  {records} rec
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
                      <span className="text-sm text-ink-700">{k}</span>
                    </div>
                    <div className="font-mono text-xs text-ink-600 num-tab">
                      {v} <span className="text-ink-300">·</span> {pct.toFixed(0)}%
                    </div>
                  </div>
                  <div className="h-1.5 bg-cream-100 rounded-full overflow-hidden">
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
            <div className="text-sm text-ink-500">
              No rooms yet.
              <button
                onClick={() => navigate('/rooms')}
                className="block mt-2 text-accent-700 hover:text-accent-800 font-mono text-xs uppercase tracking-widest"
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
                      <Building2 className="w-3.5 h-3.5 text-ink-400 shrink-0" />
                      <span className="text-sm text-ink-700 truncate group-hover:text-accent-700 transition-colors">
                        {r.name}
                      </span>
                    </div>
                    <span className="font-mono text-xs text-ink-500 num-tab shrink-0">{count}</span>
                  </li>
                );
              })}
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
                className="text-accent-700 hover:text-accent-800 text-xs uppercase tracking-widest font-mono inline-flex items-center gap-1"
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
            body="Add your first piece of hardware to start building your inventory."
            action={
              <Button icon={Plus} onClick={() => setItemModal({ mode: 'add' })}>
                Add first item
              </Button>
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
                isLast={idx === recent.length - 1}
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
