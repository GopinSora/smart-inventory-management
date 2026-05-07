import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import {
  subscribeToItems,
  subscribeToRooms,
  createItemOrMerge,
  updateItem,
  deleteItem,
  createRoom,
  updateRoom,
  deleteRoom,
  seedDemoData,
} from '@/lib/inventoryService';
import { useAuth } from './AuthContext';
import { CATEGORY_IDS } from '@/config/constants';

const InventoryContext = createContext(null);

export const useInventory = () => {
  const ctx = useContext(InventoryContext);
  if (!ctx) throw new Error('useInventory must be used inside <InventoryProvider>');
  return ctx;
};

export function InventoryProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      setItems([]);
      setRooms([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    let itemsReady = false;
    let roomsReady = false;
    const checkReady = () => {
      if (itemsReady && roomsReady) setLoading(false);
    };

    const unsubItems = subscribeToItems(
      user.uid,
      (next) => {
        setItems(next);
        itemsReady = true;
        checkReady();
      },
      (err) => {
        setError(err.message);
        itemsReady = true;
        checkReady();
      }
    );

    const unsubRooms = subscribeToRooms(
      user.uid,
      (next) => {
        setRooms(next);
        roomsReady = true;
        checkReady();
      },
      (err) => {
        setError(err.message);
        roomsReady = true;
        checkReady();
      }
    );

    return () => {
      unsubItems();
      unsubRooms();
    };
  }, [user]);

  const stats = useMemo(() => {
    const total = items.reduce((s, i) => s + Number(i.quantity || 0), 0);
    const byCat = Object.fromEntries(CATEGORY_IDS.map((c) => [c, 0]));
    const byCond = { Working: 0, Faulty: 0, Repair: 0, Unspecified: 0 };
    items.forEach((i) => {
      byCat[i.category] = (byCat[i.category] || 0) + Number(i.quantity || 0);
      const k = i.condition || 'Unspecified';
      byCond[k] = (byCond[k] || 0) + Number(i.quantity || 0);
    });
    return { total, byCat, byCond, lineCount: items.length };
  }, [items]);

  const roomById = useMemo(
    () => Object.fromEntries(rooms.map((r) => [r.id, r])),
    [rooms]
  );

  const value = {
    items,
    rooms,
    stats,
    roomById,
    loading,
    error,
    addItem: (data) => createItemOrMerge(user.uid, data),
    editItem: (id, data) => updateItem(user.uid, id, data),
    removeItem: (id) => deleteItem(user.uid, id),
    addRoom: (data) => createRoom(user.uid, data),
    editRoom: (id, data) => updateRoom(user.uid, id, data),
    removeRoom: (id) => deleteRoom(user.uid, id),
    seedDemo: () => seedDemoData(user.uid),
  };

  return <InventoryContext.Provider value={value}>{children}</InventoryContext.Provider>;
}
