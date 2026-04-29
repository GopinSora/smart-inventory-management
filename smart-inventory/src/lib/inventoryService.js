import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  writeBatch,
  getDocs,
  where,
} from 'firebase/firestore';
import { db } from '@/config/firebase';

// User-scoped collections: users/{uid}/items, users/{uid}/rooms
const itemsCol = (uid) => collection(db, 'users', uid, 'items');
const roomsCol = (uid) => collection(db, 'users', uid, 'rooms');
const itemDoc = (uid, id) => doc(db, 'users', uid, 'items', id);
const roomDoc = (uid, id) => doc(db, 'users', uid, 'rooms', id);

// ─── Subscriptions ─────────────────────────────────────────────────────────

export const subscribeToItems = (uid, callback, onError) => {
  const q = query(itemsCol(uid), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snap) => {
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      callback(items);
    },
    (err) => onError && onError(err)
  );
};

export const subscribeToRooms = (uid, callback, onError) => {
  const q = query(roomsCol(uid), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snap) => {
      const rooms = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      callback(rooms);
    },
    (err) => onError && onError(err)
  );
};

// ─── Items ─────────────────────────────────────────────────────────────────

export const createItem = async (uid, data) => {
  return addDoc(itemsCol(uid), {
    ...sanitizeItem(data),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

export const updateItem = async (uid, id, data) => {
  return updateDoc(itemDoc(uid, id), {
    ...sanitizeItem(data),
    updatedAt: serverTimestamp(),
  });
};

export const deleteItem = async (uid, id) => deleteDoc(itemDoc(uid, id));

const sanitizeItem = (data) => ({
  category: data.category,
  brand: (data.brand || '').trim(),
  model: (data.model || '').trim(),
  specifications: (data.specifications || '').trim(),
  quantity: Number(data.quantity) || 0,
  purchaseDate: data.purchaseDate || null,
  condition: data.condition || null,
  roomId: data.roomId || null,
});

// ─── Rooms ─────────────────────────────────────────────────────────────────

export const createRoom = async (uid, data) => {
  return addDoc(roomsCol(uid), {
    name: (data.name || '').trim(),
    description: (data.description || '').trim(),
    createdAt: serverTimestamp(),
  });
};

export const updateRoom = async (uid, id, data) => {
  return updateDoc(roomDoc(uid, id), {
    name: (data.name || '').trim(),
    description: (data.description || '').trim(),
  });
};

export const deleteRoom = async (uid, id) => {
  // Unassign items pointing to this room, then delete the room.
  const q = query(itemsCol(uid), where('roomId', '==', id));
  const snap = await getDocs(q);
  const batch = writeBatch(db);
  snap.docs.forEach((d) => batch.update(d.ref, { roomId: null }));
  batch.delete(roomDoc(uid, id));
  return batch.commit();
};

// ─── Demo seed ─────────────────────────────────────────────────────────────

const SAMPLE_ROOMS = [
  { name: 'Lab A-201', description: 'AI & Deep Learning Lab' },
  { name: 'Lab B-105', description: 'Networking & Hardware Bench' },
  { name: 'Storage 02', description: 'Spare equipment & repairs' },
];

const SAMPLE_ITEMS = [
  { category: 'Keyboard', brand: 'Logitech', model: 'MX Keys S', specifications: 'Wireless, low-profile, backlit', quantity: 12, purchaseDate: '2024-08-15', condition: 'Working', roomIdx: 0 },
  { category: 'Mouse', brand: 'Logitech', model: 'MX Master 3S', specifications: '8000 DPI, Bluetooth + USB-C', quantity: 18, purchaseDate: '2024-08-15', condition: 'Working', roomIdx: 0 },
  { category: 'Monitor', brand: 'Dell', model: 'U2723QE', specifications: '27" 4K IPS, USB-C hub', quantity: 6, purchaseDate: '2024-02-10', condition: 'Working', roomIdx: 0 },
  { category: 'CPU', brand: 'HP', model: 'EliteDesk 800 G6', specifications: 'i7-10700, 32GB RAM, 1TB NVMe', quantity: 4, purchaseDate: '2023-11-20', condition: 'Repair', roomIdx: 2 },
  { category: 'Mouse', brand: 'Razer', model: 'DeathAdder V3', specifications: '30000 DPI ergonomic optical', quantity: 3, purchaseDate: '2025-01-05', condition: 'Faulty', roomIdx: 2 },
  { category: 'Monitor', brand: 'LG', model: '27GP850-B', specifications: '27" QHD IPS 165Hz', quantity: 2, condition: 'Working', roomIdx: 1 },
  { category: 'CPU', brand: 'Lenovo', model: 'ThinkCentre M75q', specifications: 'Ryzen 5 PRO, 16GB, 512GB SSD', quantity: 8, purchaseDate: '2024-05-12', condition: 'Working', roomIdx: 1 },
  { category: 'Keyboard', brand: 'Keychron', model: 'K8 Pro', specifications: 'Mechanical, hot-swap, QMK', quantity: 5, purchaseDate: '2025-03-22', condition: 'Working', roomIdx: 1 },
];

export const seedDemoData = async (uid) => {
  const roomRefs = [];
  for (const r of SAMPLE_ROOMS) {
    const ref = await addDoc(roomsCol(uid), {
      ...r,
      createdAt: serverTimestamp(),
    });
    roomRefs.push(ref);
  }
  for (const { roomIdx, ...rest } of SAMPLE_ITEMS) {
    await addDoc(itemsCol(uid), {
      ...sanitizeItem({
        ...rest,
        roomId: roomIdx != null ? roomRefs[roomIdx].id : null,
      }),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
};
