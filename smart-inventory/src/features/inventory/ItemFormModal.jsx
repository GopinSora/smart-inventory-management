import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal, { ModalHeader, ModalBody, ModalFooter } from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input, { Textarea, Select } from '@/components/ui/Input';
import { Field } from '@/components/ui/Primitives';
import { CATEGORIES, CONDITION_OPTIONS } from '@/config/constants';
import { useInventory } from '@/context/InventoryContext';

export default function ItemFormModal({ mode, initial, onClose, onRequestDelete }) {
  const { rooms, addItem, editItem } = useInventory();

  const [form, setForm] = useState({
    category: initial?.category || 'Keyboard',
    brand: initial?.brand || '',
    model: initial?.model || '',
    specifications: initial?.specifications || '',
    quantity: initial?.quantity ?? 1,
    purchaseDate: initial?.purchaseDate || '',
    condition: initial?.condition || '',
    roomId: initial?.roomId || '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    const e = {};
    if (!form.brand.trim()) e.brand = 'Required';
    if (!form.model.trim()) e.model = 'Required';
    const q = Number(form.quantity);
    if (!Number.isFinite(q) || q < 0) e.quantity = 'Must be ≥ 0';
    setErrors(e);
    if (Object.keys(e).length) return;

    setSubmitting(true);
    try {
      if (mode === 'edit') {
        await editItem(initial.id, form);
        toast.success('Item updated');
      } else {
        await addItem(form);
        toast.success('Item added');
      }
      onClose();
    } catch (err) {
      toast.error('Could not save item');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal onClose={onClose} size="md">
      <ModalHeader
        kicker={mode === 'add' ? 'Create record' : 'Edit record'}
        title={mode === 'add' ? 'New hardware item' : `${initial?.brand || ''} ${initial?.model || ''}`}
        onClose={onClose}
      />

      <ModalBody>
        <div className="space-y-4">
          <Field label="Category" required>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {CATEGORIES.map((c) => {
                const Ico = c.icon;
                const active = form.category === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => set('category', c.id)}
                    className={`flex flex-col items-center gap-1.5 py-3 rounded-lg border text-xs transition-all ${
                      active
                        ? 'bg-accent-50 border-accent-700 text-accent-800 shadow-soft'
                        : 'bg-white border-cream-200 text-ink-600 hover:border-cream-400'
                    }`}
                  >
                    <Ico className="w-4 h-4" />
                    {c.id}
                  </button>
                );
              })}
            </div>
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Brand / Company" required error={errors.brand}>
              <Input
                value={form.brand}
                onChange={(e) => set('brand', e.target.value)}
                placeholder="e.g. Logitech"
                error={!!errors.brand}
              />
            </Field>
            <Field label="Model" required error={errors.model}>
              <Input
                value={form.model}
                onChange={(e) => set('model', e.target.value)}
                placeholder="e.g. MX Master 3S"
                error={!!errors.model}
              />
            </Field>
          </div>

          <Field label="Specifications">
            <Textarea
              value={form.specifications}
              onChange={(e) => set('specifications', e.target.value)}
              placeholder="Key specs, ports, version, notes…"
              rows={2}
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Field label="Quantity" required error={errors.quantity}>
              <Input
                type="number"
                min="0"
                value={form.quantity}
                onChange={(e) => set('quantity', e.target.value)}
                error={!!errors.quantity}
                className="font-mono num-tab"
              />
            </Field>
            <Field label="Purchase date" hint="Optional">
              <Input
                type="date"
                value={form.purchaseDate}
                onChange={(e) => set('purchaseDate', e.target.value)}
                className="font-mono"
              />
            </Field>
            <Field label="Condition" hint="Optional">
              <Select value={form.condition} onChange={(e) => set('condition', e.target.value)}>
                <option value="">— Unspecified —</option>
                {CONDITION_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <Field label="Assigned room" hint="Optional">
            <Select value={form.roomId} onChange={(e) => set('roomId', e.target.value)}>
              <option value="">— Unassigned —</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </ModalBody>

      <ModalFooter className="justify-between">
        {mode === 'edit' ? (
          <Button variant="danger-ghost" icon={Trash2} onClick={onRequestDelete}>
            Delete
          </Button>
        ) : (
          <span />
        )}
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={submitting}>
            {submitting ? 'Saving…' : mode === 'add' ? 'Add item' : 'Save changes'}
          </Button>
        </div>
      </ModalFooter>
    </Modal>
  );
}
