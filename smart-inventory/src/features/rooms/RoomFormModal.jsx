import { useState } from 'react';
import toast from 'react-hot-toast';
import Modal, { ModalHeader, ModalBody, ModalFooter } from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Field } from '@/components/ui/Primitives';
import { useInventory } from '@/context/InventoryContext';

export default function RoomFormModal({ mode, initial, onClose }) {
  const { addRoom, editRoom } = useInventory();

  const [name, setName] = useState(initial?.name || '');
  const [description, setDescription] = useState(initial?.description || '');
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
        await editRoom(initial.id, { name, description });
        toast.success('Room updated');
      } else {
        await addRoom({ name, description });
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

  return (
    <Modal onClose={onClose} size="sm">
      <ModalHeader
        kicker={mode === 'add' ? 'Create location' : 'Edit location'}
        title={mode === 'add' ? 'New room' : initial?.name}
        onClose={onClose}
      />
      <ModalBody>
        <div className="space-y-4">
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
