import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  writeBatch,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { HistoryItem } from '../types';

const historyCollection = collection(db, 'history');

export const getHistoryItems = async (count: number): Promise<HistoryItem[]> => {
  const q = query(historyCollection, orderBy('timestamp', 'desc'), limit(count));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    // Ensure timestamp is a number, converting from Firestore Timestamp if necessary
    const timestamp = data.timestamp instanceof Timestamp ? data.timestamp.toMillis() : Date.now();
    return {
      id: doc.id,
      title: data.title,
      text: data.text,
      timestamp: timestamp,
    };
  });
};

export const addHistoryItem = async (item: Omit<HistoryItem, 'id' | 'timestamp'>): Promise<HistoryItem> => {
  const docRef = await addDoc(historyCollection, {
    ...item,
    timestamp: serverTimestamp(),
  });

  // Return the new item with a client-side timestamp for immediate UI update.
  // The next fetch will have the precise server-generated timestamp.
  return {
    ...item,
    id: docRef.id,
    timestamp: Date.now(),
  };
};

export const deleteHistoryItem = async (id: string): Promise<void> => {
  const docRef = doc(db, 'history', id);
  await deleteDoc(docRef);
};

export const clearHistory = async (): Promise<void> => {
  const q = query(historyCollection);
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) {
    return;
  }

  const batch = writeBatch(db);
  querySnapshot.forEach(document => {
    batch.delete(document.ref);
  });
  await batch.commit();
};
