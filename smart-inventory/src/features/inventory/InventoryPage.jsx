import { useMemo, useState } from 'react';
import { Plus, Search, X, Boxes } from 'lucide-react';
import { useInventory } from '@/context/InventoryContext';
import { CATEGORIES } from '@/config/constants';
import Button from '@/components/ui/Button';
import Input, { Select } from '@/components/ui/Input';
import { SectionHeading, EmptyState, Card } from '@/components/ui/Primitives';
import ItemRow from './ItemRow';
import ItemFormModal from './ItemFormModal';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import { cn } from '@/lib/helpers';

function FilterChip({ label, icon: Icon, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full border transition-colors font-medium',
        active
          ? 'bg-accent-50 border-accent-700 text-accent-800'
          : 'bg-white border-cream-200 text-ink-600 hover:border-cream-400'
      )}
    >
      {Icon && <Icon className="w-3 h-3" />}
      {label}
    </button>
  );
}

export default function InventoryPage() {
  const { items, rooms, roomById, removeItem } = useInventory();

  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterCondition, setFilterCondition] = useState('All');
  const [filterRoom, setFilterRoom] = useState('All');

  const [itemModal, setItemModal] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((i) => {
      if (filterCategory !== 'All' && i.category !== filterCategory) return false;
      if (filterCondition !== 'All' && (i.condition || 'Unspecified') !== filterCondition)
        return false;
      if (filterRoom !== 'All') {
        if (filterRoom === '__unassigned__' && i.roomId) return false;
        if (filterRoom !== '__unassigned__' && i.roomId !== filterRoom) return false;
      }
      if (!q) return true;
      return [i.brand, i.model, i.specifications]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [items, search, filterCategory, filterCondition, filterRoom]);

  return (
    <div className="space-y-8 animate-fade-up">
      <SectionHeading
        kicker="Inventory · Records"
        title="All hardware"
        action={
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-ink-500 num-tab">
              {filtered.length}
              <span className="text-ink-300 mx-1">/</span>
              {items.length}
            </span>
            <Button icon={Plus} onClick={() => setItemModal({ mode: 'add' })}>
              Add item
            </Button>
          </div>
        }
      />

      <Card className="p-4 md:p-5 space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 text-ink-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by brand, model, or specifications…"
            className="pl-10"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <FilterChip
            label="All"
            active={filterCategory === 'All'}
            onClick={() => setFilterCategory('All')}
          />
          {CATEGORIES.map((c) => {
            const Ico = c.icon;
            return (
              <FilterChip
                key={c.id}
                label={c.id}
                icon={Ico}
                active={filterCategory === c.id}
                onClick={() => setFilterCategory(c.id)}
              />
            );
          })}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <Select
            value={filterCondition}
            onChange={(e) => setFilterCondition(e.target.value)}
          >
            <option value="All">All conditions</option>
            <option value="Working">Working</option>
            <option value="Faulty">Faulty</option>
            <option value="Repair">Repair</option>
            <option value="Unspecified">Unspecified</option>
          </Select>
          <Select value={filterRoom} onChange={(e) => setFilterRoom(e.target.value)}>
            <option value="All">All rooms</option>
            <option value="__unassigned__">Unassigned</option>
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Boxes}
          title={items.length === 0 ? 'No items yet' : 'No items match your filters'}
          body={
            items.length === 0
              ? 'Add your first piece of hardware to start your register.'
              : 'Try clearing filters or adjusting your search.'
          }
          action={
            items.length === 0 && (
              <Button icon={Plus} onClick={() => setItemModal({ mode: 'add' })}>
                Add item
              </Button>
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
              isLast={idx === filtered.length - 1}
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
