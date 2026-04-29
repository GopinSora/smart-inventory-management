import { useState } from 'react';
import { Plus, Building2, ArrowUpRight, DoorOpen, Edit3, Trash2, Package } from 'lucide-react';
import Button from '@/components/ui/Button';
import { SectionHeading, EmptyState, Card, Label } from '@/components/ui/Primitives';
import { useInventory } from '@/context/InventoryContext';
import ItemRow from '@/features/inventory/ItemRow';
import ItemFormModal from '@/features/inventory/ItemFormModal';
import ConfirmDeleteModal from '@/features/inventory/ConfirmDeleteModal';
import RoomFormModal from './RoomFormModal';
import { cn } from '@/lib/helpers';

export default function RoomsPage() {
  const { rooms, items, removeRoom, removeItem } = useInventory();
  const [activeRoomId, setActiveRoomId] = useState(null);
  const [roomModal, setRoomModal] = useState(null);
  const [itemModal, setItemModal] = useState(null);
  const [confirm, setConfirm] = useState(null);

  if (activeRoomId) {
    const room = rooms.find((r) => r.id === activeRoomId);
    if (!room) {
      setActiveRoomId(null);
      return null;
    }
    const roomItems = items.filter((i) => i.roomId === activeRoomId);
    const total = roomItems.reduce((s, i) => s + Number(i.quantity || 0), 0);

    return (
      <div className="space-y-6 animate-fade-up">
        <button
          onClick={() => setActiveRoomId(null)}
          className="text-accent-700 hover:text-accent-800 text-xs uppercase tracking-widest font-mono"
        >
          ← All rooms
        </button>

        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <Label className="mb-2">
              Room · {roomItems.length} records · {total} units
            </Label>
            <h1 className="font-display text-3xl md:text-5xl text-ink-900 leading-tight">
              {room.name}
            </h1>
            {room.description && (
              <p className="text-ink-500 mt-2 text-sm max-w-xl">{room.description}</p>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" icon={Edit3} onClick={() => setRoomModal({ mode: 'edit', room })}>
              Edit
            </Button>
            <Button
              variant="danger-ghost"
              icon={Trash2}
              onClick={() => setConfirm({ type: 'room', target: room })}
            >
              Delete
            </Button>
          </div>
        </div>

        {roomItems.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No items in this room"
            body="Assign items to this room from the inventory view, or edit an item to set its room."
          />
        ) : (
          <Card className="overflow-hidden">
            {roomItems.map((it, idx) => (
              <ItemRow
                key={it.id}
                item={it}
                room={room}
                onEdit={() => setItemModal({ mode: 'edit', item: it })}
                onDelete={() => setConfirm({ type: 'item', target: it })}
                isLast={idx === roomItems.length - 1}
                hideRoom
              />
            ))}
          </Card>
        )}

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

      {rooms.length === 0 ? (
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
          {rooms.map((r, i) => {
            const roomItems = items.filter((it) => it.roomId === r.id);
            const total = roomItems.reduce((s, it) => s + Number(it.quantity || 0), 0);
            return (
              <button
                key={r.id}
                onClick={() => setActiveRoomId(r.id)}
                className={cn(
                  'animate-fade-up group text-left bg-white border border-cream-200 hover:border-accent-700 rounded-2xl p-5 shadow-soft transition-all'
                )}
                style={{ animationDelay: `${Math.min(i, 5) * 40}ms` }}
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="w-10 h-10 bg-cream-100 border border-cream-200 rounded-lg flex items-center justify-center group-hover:bg-accent-50 group-hover:border-accent-200 transition-colors">
                    <Building2
                      className="w-5 h-5 text-ink-700 group-hover:text-accent-700 transition-colors"
                      strokeWidth={1.75}
                    />
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-ink-300 group-hover:text-accent-700 transition-colors" />
                </div>
                <div className="font-display text-2xl text-ink-900 mb-1 truncate">{r.name}</div>
                {r.description && (
                  <div className="text-xs text-ink-500 line-clamp-2 mb-4">{r.description}</div>
                )}
                <div className="flex items-baseline gap-3 font-mono text-[11px] uppercase tracking-widest">
                  <span className="text-ink-700 num-tab">
                    {total} <span className="text-ink-400">units</span>
                  </span>
                  <span className="text-ink-300">·</span>
                  <span className="text-ink-500 num-tab">
                    {roomItems.length} <span className="text-ink-400">records</span>
                  </span>
                </div>
              </button>
            );
          })}
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
