import { useState } from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

export default function ConfirmDeleteModal({ type, target, onClose, onConfirmed }) {
  const [submitting, setSubmitting] = useState(false);

  const isItem = type === 'item';
  const title = isItem ? 'Delete this item?' : 'Delete this room?';
  const body = isItem
    ? `${target.brand} ${target.model} (qty ${target.quantity}) will be permanently removed.`
    : `${target.name} will be removed. Items currently assigned will become unassigned.`;

  const confirm = async () => {
    setSubmitting(true);
    try {
      await onConfirmed();
      toast.success('Deleted');
    } catch (err) {
      toast.error('Could not delete');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal onClose={onClose} size="sm">
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 shrink-0 bg-rose-50 border border-rose-200 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-display text-xl text-ink-900 mb-1.5">{title}</h3>
            <p className="text-sm text-ink-600 leading-relaxed">{body}</p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 mt-6">
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="danger" icon={Trash2} onClick={confirm} disabled={submitting}>
            {submitting ? 'Deleting…' : 'Delete'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
