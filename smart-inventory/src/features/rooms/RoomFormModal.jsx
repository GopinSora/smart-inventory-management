import { useState } from 'react';
import toast from 'react-hot-toast';
import {
  FlaskConical, Server, Archive, Monitor, BookOpen,
  Briefcase, HardDrive, Cpu, Coffee, Layers, Building2, Wrench,
  DoorOpen, Wifi, Shield, Printer, Package,
} from 'lucide-react';
import Modal, { ModalHeader, ModalBody, ModalFooter } from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Field, Label } from '@/components/ui/Primitives';
import { useInventory } from '@/context/InventoryContext';
import { cn } from '@/lib/helpers';

export const ROOM_ICONS = [
  { id: 'lab',      icon: FlaskConical, label: 'Lab'         },
  { id: 'server',   icon: Server,       label: 'Server'      },
  { id: 'storage',  icon: Archive,      label: 'Storage'     },
  { id: 'monitor',  icon: Monitor,      label: 'Display'     },
  { id: 'library',  icon: BookOpen,     label: 'Library'     },
  { id: 'office',   icon: Briefcase,    label: 'Office'      },
  { id: 'hdd',      icon: HardDrive,    label: 'Data'        },
  { id: 'cpu',      icon: Cpu,          label: 'Compute'     },
  { id: 'lounge',   icon: Coffee,       label: 'Lounge'      },
  { id: 'floor',    icon: Layers,       label: 'Floor'       },
  { id: 'building', icon: Building2,    label: 'Building'    },
  { id: 'workshop', icon: Wrench,       label: 'Workshop'    },
  { id: 'room',     icon: DoorOpen,     label: 'Room'        },
  { id: 'network',  icon: Wifi,         label: 'Network'     },
  { id: 'security', icon: Shield,       label: 'Security'    },
  { id: 'print',    icon: Printer,      label: 'Print'       },
];

export function getRoomIcon(iconId) {
  return ROOM_ICONS.find((r) => r.id === iconId)?.icon ?? Package;
}

export default function RoomFormModal({ mode, initial, onClose }) {
  const { addRoom, editRoom } = useInventory();

  const [name, setName] = useState(initial?.name || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [iconId, setIconId] = useState(initial?.icon || 'lab');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!name.trim()) {
      setError('Room name required');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      if (mode === 'edit') {
        await editRoom(initial.id, { name, description, icon: iconId });
        toast.success('Room updated');
      } else {
        await addRoom({ name, description, icon: iconId });
        toast.success('Room added');
      }
      onClose();
    } catch (err) {
      toast.error('Could not save room');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const SelectedIcon = getRoomIcon(iconId);

  return (
    <Modal onClose={onClose} size="sm">
      <ModalHeader
        kicker={mode === 'add' ? 'Create location' : 'Edit location'}
        title={mode === 'add' ? 'New room' : initial?.name}
        onClose={onClose}
      />
      <ModalBody>
        <div className="space-y-5">
          {/* Icon picker */}
          <div>
            <Label className="mb-3">Room type icon</Label>
            <div className="grid grid-cols-8 gap-1.5">
              {ROOM_ICONS.map((r) => {
                const Ico = r.icon;
                const active = iconId === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    title={r.label}
                    onClick={() => setIconId(r.id)}
                    className={cn(
                      'group flex flex-col items-center gap-1 p-2 rounded-lg border transition-all',
                      active
                        ? 'bg-accent-50 dark:bg-orange-950/40 border-accent-700 dark:border-orange-600 text-accent-800 dark:text-orange-300 shadow-soft'
                        : 'bg-white dark:bg-[#1e1d1a] border-cream-200 dark:border-[#38362f] text-ink-500 dark:text-[#7a7870] hover:border-cream-400 dark:hover:border-[#6b6655] hover:text-ink-800 dark:hover:text-[#f0ede6]'
                    )}
                  >
                    <Ico className="w-4 h-4" strokeWidth={1.75} />
                    <span className="text-[8px] font-mono uppercase tracking-wider leading-none hidden sm:block">{r.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Live preview */}
          <div className="flex items-center gap-3 px-4 py-3 bg-cream-50 dark:bg-[#252420] border border-cream-200 dark:border-[#2a2925] rounded-xl">
            <div className="w-10 h-10 bg-white dark:bg-[#1e1d1a] border border-cream-200 dark:border-[#38362f] rounded-lg flex items-center justify-center shrink-0">
              <SelectedIcon className="w-5 h-5 text-accent-700 dark:text-orange-400" strokeWidth={1.75} />
            </div>
            <div>
              <div className="font-display text-base text-ink-900 dark:text-[#f0ede6] leading-tight">
                {name || 'Room name…'}
              </div>
              {description && (
                <div className="text-xs text-ink-500 dark:text-[#7a7870] mt-0.5 truncate">{description}</div>
              )}
            </div>
          </div>

          <Field label="Name" required error={error}>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Lab A-201"
              autoFocus
              error={!!error}
            />
          </Field>

          <Field label="Description" hint="Optional">
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this room for?"
            />
          </Field>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="ghost" onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button onClick={submit} disabled={submitting}>
          {submitting ? 'Saving…' : mode === 'add' ? 'Add room' : 'Save'}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
