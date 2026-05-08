import { useState, useMemo } from 'react';
import { Plus, ArrowUpRight, DoorOpen, Edit3, Trash2, Package, Inbox, FileText, Search } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { SectionHeading, EmptyState, Card, Label } from '@/components/ui/Primitives';
import { useInventory } from '@/context/InventoryContext';
import ItemRow from '@/features/inventory/ItemRow';
import ItemFormModal from '@/features/inventory/ItemFormModal';
import ConfirmDeleteModal from '@/features/inventory/ConfirmDeleteModal';
import RoomFormModal, { getRoomIcon } from './RoomFormModal';
import { cn } from '@/lib/helpers';
import { exportInventoryPDF, exportItemPDF } from '@/lib/exportPdf';

export default function RoomsPage() {
  const { rooms, items, loading, removeRoom, removeItem, editItem } = useInventory();
  const [activeRoomId, setActiveRoomId] = useState(null); // 'unassigned' is a valid virtual ID
  const [roomModal, setRoomModal] = useState(null);
  const [itemModal, setItemModal] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // ── ALL hooks must be declared before any conditional return ──────────────
  const unassignedItems = useMemo(
    () => items.filter((i) => !i.roomId),
    [items]
  );

  const filteredRooms = useMemo(() => {
    if (!searchQuery.trim()) return rooms;
    const q = searchQuery.toLowerCase();
    return rooms.filter(
      (r) =>
        (r.name || '').toLowerCase().includes(q) ||
        (r.description || '').toLowerCase().includes(q)
    );
  }, [rooms, searchQuery]);

  // Derived values for room detail view (computed unconditionally)
  const isUnassigned = activeRoomId === 'unassigned';
  const activeRoom = activeRoomId && !isUnassigned
    ? rooms.find((r) => r.id === activeRoomId) ?? null
    : null;
  const activeRoomItems = useMemo(() => {
    if (!activeRoomId) return [];
    if (isUnassigned) return unassignedItems;
    return items.filter((i) => i.roomId === activeRoomId);
  }, [activeRoomId, isUnassigned, unassignedItems, items]);

  // ── Room detail view ──────────────────────────────────────────────────────
  if (activeRoomId) {
    const total = activeRoomItems.reduce((s, i) => s + Number(i.quantity || 0), 0);
    const RoomIco = isUnassigned ? Inbox : getRoomIcon(activeRoom?.icon);

    // Still loading from Firestore — don't flash "Room not found" prematurely
    if (loading) {
      return (
        <div className="flex items-center justify-center py-24">
          <div className="flex flex-col items-center gap-3">
            <div className="w-7 h-7 border-2 border-accent-700 dark:border-orange-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-mono text-ink-500 dark:text-[#7a7870] uppercase tracking-widest">Loading room…</span>
          </div>
        </div>
      );
    }

    if (!isUnassigned && !activeRoom) {
      return (
        <div className="space-y-6 animate-fade-up">
          <EmptyState
            icon={DoorOpen}
            title="Room not found"
            body="This room may have been deleted."
            action={
              <Button onClick={() => setActiveRoomId(null)}>
                ← Back to all rooms
              </Button>
            }
          />
        </div>
      );
    }

    return (
      <div className="space-y-6 animate-fade-up">
        <button
          onClick={() => setActiveRoomId(null)}
          className="text-accent-700 dark:text-orange-400 hover:text-accent-800 dark:hover:text-orange-300 text-xs uppercase tracking-widest font-mono transition-colors"
        >
          ← All rooms
        </button>

        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <Label className="mb-2">
              {isUnassigned ? 'Virtual · Unassigned' : 'Room'} · {activeRoomItems.length} records · {total} units
            </Label>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-cream-100 dark:bg-[#2a2925] border border-cream-200 dark:border-[#38362f] rounded-lg flex items-center justify-center">
                <RoomIco className="w-5 h-5 text-ink-700 dark:text-[#b5b0a5]" strokeWidth={1.75} />
              </div>
              <h1 className="font-display text-3xl md:text-5xl text-ink-900 dark:text-[#f0ede6] leading-tight">
                {isUnassigned ? 'Unassigned Items' : activeRoom.name}
              </h1>
            </div>
            {!isUnassigned && activeRoom.description && (
              <p className="text-ink-500 dark:text-[#7a7870] mt-2 text-sm max-w-xl">{activeRoom.description}</p>
            )}
            {isUnassigned && (
              <p className="text-ink-500 dark:text-[#7a7870] mt-2 text-sm max-w-xl">
                Items not yet assigned to any room. Edit them to assign a location.
              </p>
            )}
          </div>
          {!isUnassigned && (
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => exportInventoryPDF(activeRoomItems, { [activeRoom.id]: activeRoom }, { room: activeRoom.name })}
                disabled={activeRoomItems.length === 0}
                title="Export Room to PDF"
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium border rounded-lg transition-colors text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100 dark:hover:bg-rose-950/40 disabled:opacity-40"
              >
                <FileText className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Export PDF</span>
              </button>
              <Button icon={Plus} onClick={() => setItemModal({ mode: 'add', item: { roomId: activeRoomId } })}>
                Add item
              </Button>
              <Button variant="ghost" icon={Edit3} onClick={() => setRoomModal({ mode: 'edit', room: activeRoom })}>
                Edit
              </Button>
              <Button
                variant="danger-ghost"
                icon={Trash2}
                onClick={() => setConfirm({ type: 'room', target: activeRoom })}
              >
                Delete
              </Button>
            </div>
          )}
          {isUnassigned && (
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => exportInventoryPDF(activeRoomItems, {}, { room: 'Unassigned' })}
                disabled={activeRoomItems.length === 0}
                title="Export Room to PDF"
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium border rounded-lg transition-colors text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100 dark:hover:bg-rose-950/40 disabled:opacity-40"
              >
                <FileText className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Export PDF</span>
              </button>
            </div>
          )}
        </div>

        {activeRoomItems.length === 0 ? (
          <EmptyState
            icon={Package}
            title={isUnassigned ? 'All items are assigned!' : 'No items in this room'}
            body={
              isUnassigned
                ? 'Great! Every item has been assigned to a room.'
                : 'Add your first item to this room using the button above.'
            }
            action={
              !isUnassigned && (
                <Button icon={Plus} onClick={() => setItemModal({ mode: 'add', item: { roomId: activeRoomId } })}>
                  Add item
                </Button>
              )
            }
          />
        ) : (
          <Card className="overflow-hidden">
            {activeRoomItems.map((it, idx) => (
              <ItemRow
                key={it.id}
                item={it}
                room={isUnassigned ? null : activeRoom}
                onEdit={() => setItemModal({ mode: 'edit', item: it })}
                onDelete={() => setConfirm({ type: 'item', target: it })}
                onPdf={() => exportItemPDF(it, isUnassigned ? 'Unassigned' : activeRoom.name)}
                onQuantityChange={(delta) => {
                  const newQty = Math.max(0, Number(it.quantity || 0) + delta);
                  editItem(it.id, { ...it, quantity: newQty });
                }}
                isLast={idx === activeRoomItems.length - 1}
                hideRoom={!isUnassigned}
              />
            ))}
          </Card>
        )}

        {/* Modals */}
        {roomModal && (
          <RoomFormModal
            mode={roomModal.mode}
            initial={roomModal.room}
            onClose={() => setRoomModal(null)}
          />
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
              if (confirm.type === 'item') await removeItem(confirm.target.id);
              if (confirm.type === 'room') {
                await removeRoom(confirm.target.id);
                setActiveRoomId(null);
              }
              setConfirm(null);
            }}
          />
        )}
      </div>
    );
  }

  // ── Room grid view ────────────────────────────────────────────────────────

  return (
    <div className="space-y-8 animate-fade-up">
      <SectionHeading
        kicker="Locations · Rooms"
        title="Where things live"
        action={
          <Button icon={Plus} onClick={() => setRoomModal({ mode: 'add' })}>
            New room
          </Button>
        }
      />

      {/* Filter & search card */}
      <Card className="p-4 md:p-5">
        <div className="relative">
          <Search className="w-4 h-4 text-ink-400 dark:text-[#7a7870] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search rooms by name or description..."
            className="pl-10"
          />
        </div>
      </Card>

      {filteredRooms.length === 0 && unassignedItems.length === 0 ? (
        <EmptyState
          icon={DoorOpen}
          title="No rooms defined"
          body="Create rooms to organize hardware by physical location — labs, storage, offices."
          action={
            <Button icon={Plus} onClick={() => setRoomModal({ mode: 'add' })}>
              Add first room
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Real rooms */}
          {filteredRooms.map((r, i) => {
            const roomItems = items.filter((it) => it.roomId === r.id);
            const total = roomItems.reduce((s, it) => s + Number(it.quantity || 0), 0);
            const RoomIco = getRoomIcon(r.icon);

            return (
              <button
                key={r.id}
                onClick={() => setActiveRoomId(r.id)}
                className={cn(
                  'animate-fade-up group text-left bg-white dark:bg-[#1e1d1a] border border-cream-200 dark:border-[#2a2925] hover:border-accent-700 dark:hover:border-orange-600 rounded-2xl p-5 shadow-soft transition-all'
                )}
                style={{ animationDelay: `${Math.min(i, 5) * 40}ms` }}
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="w-11 h-11 bg-cream-100 dark:bg-[#2a2925] border border-cream-200 dark:border-[#38362f] rounded-xl flex items-center justify-center group-hover:bg-accent-50 dark:group-hover:bg-orange-950/40 group-hover:border-accent-200 dark:group-hover:border-orange-800/50 transition-colors">
                    <RoomIco
                      className="w-5 h-5 text-ink-700 dark:text-[#b5b0a5] group-hover:text-accent-700 dark:group-hover:text-orange-400 transition-colors"
                      strokeWidth={1.75}
                    />
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-ink-300 dark:text-[#38362f] group-hover:text-accent-700 dark:group-hover:text-orange-400 transition-colors" />
                </div>
                <div className="font-display text-2xl text-ink-900 dark:text-[#f0ede6] mb-1 truncate">{r.name}</div>
                {r.description && (
                  <div className="text-xs text-ink-500 dark:text-[#7a7870] line-clamp-2 mb-4">{r.description}</div>
                )}
                <div className="flex items-baseline gap-3 font-mono text-[11px] uppercase tracking-widest">
                  <span className="text-ink-700 dark:text-[#b5b0a5] num-tab">
                    {total} <span className="text-ink-400 dark:text-[#7a7870]">units</span>
                  </span>
                  <span className="text-ink-300 dark:text-[#38362f]">·</span>
                  <span className="text-ink-500 dark:text-[#7a7870] num-tab">
                    {roomItems.length} <span className="text-ink-400 dark:text-[#7a7870]">records</span>
                  </span>
                </div>
              </button>
            );
          })}

          {/* Unassigned virtual room (always shown if items exist) */}
          {unassignedItems.length > 0 && (
            <button
              onClick={() => setActiveRoomId('unassigned')}
              className="animate-fade-up group text-left bg-white dark:bg-[#1e1d1a] border border-dashed border-cream-300 dark:border-[#38362f] hover:border-accent-700 dark:hover:border-orange-600 rounded-2xl p-5 shadow-soft transition-all"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="w-11 h-11 bg-cream-100 dark:bg-[#2a2925] border border-cream-200 dark:border-[#38362f] rounded-xl flex items-center justify-center group-hover:bg-amber-50 dark:group-hover:bg-amber-950/30 group-hover:border-amber-200 dark:group-hover:border-amber-800/50 transition-colors">
                  <Inbox
                    className="w-5 h-5 text-ink-500 dark:text-[#7a7870] group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors"
                    strokeWidth={1.75}
                  />
                </div>
                <ArrowUpRight className="w-4 h-4 text-ink-300 dark:text-[#38362f] group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors" />
              </div>
              <div className="font-display text-2xl text-ink-900 dark:text-[#f0ede6] mb-1">Unassigned</div>
              <div className="text-xs text-ink-500 dark:text-[#7a7870] mb-4">Items not yet in any room</div>
              <div className="flex items-baseline gap-3 font-mono text-[11px] uppercase tracking-widest">
                <span className="text-amber-700 dark:text-amber-400 num-tab">
                  {unassignedItems.reduce((s, i) => s + Number(i.quantity || 0), 0)}{' '}
                  <span className="text-ink-400 dark:text-[#7a7870]">units</span>
                </span>
                <span className="text-ink-300 dark:text-[#38362f]">·</span>
                <span className="text-ink-500 dark:text-[#7a7870] num-tab">
                  {unassignedItems.length} <span className="text-ink-400 dark:text-[#7a7870]">records</span>
                </span>
              </div>
            </button>
          )}
        </div>
      )}

      {roomModal && (
        <RoomFormModal
          mode={roomModal.mode}
          initial={roomModal.room}
          onClose={() => setRoomModal(null)}
        />
      )}
    </div>
  );
}
