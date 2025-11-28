import { db } from '../firebase';
import {
    collection,
    doc,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    setDoc,
    DocumentData,
    QueryConstraint
} from 'firebase/firestore';

// Generic set (create or overwrite with specific ID)
export const set = async (collectionName: string, id: string, data: DocumentData) => {
    await setDoc(doc(db, collectionName, id), data);
};

// Generic get all
export const getAll = async (collectionName: string) => {
    const querySnapshot = await getDocs(collection(db, collectionName));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Generic get by ID
export const getById = async (collectionName: string, id: string) => {
    const docRef = doc(db, collectionName, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
    } else {
        return null;
    }
};

// Generic add
export const add = async (collectionName: string, data: DocumentData) => {
    const docRef = await addDoc(collection(db, collectionName), data);
    return docRef.id;
};

// Generic update
export const update = async (collectionName: string, id: string, data: DocumentData) => {
    const docRef = doc(db, collectionName, id);
    await updateDoc(docRef, data);
};

// Generic delete
export const remove = async (collectionName: string, id: string) => {
    await deleteDoc(doc(db, collectionName, id));
};

// Generic query
export const getQuery = async (collectionName: string, ...constraints: QueryConstraint[]) => {
    const q = query(collection(db, collectionName), ...constraints);
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
