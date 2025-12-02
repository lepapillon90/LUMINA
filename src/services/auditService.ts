import { db } from '../firebase';
import { collection, addDoc, getDocs, query, orderBy, limit, Timestamp } from 'firebase/firestore';
import { AuditLog } from '../types';

const AUDIT_COLLECTION = 'audit_logs';

export const logAction = async (
    userId: string,
    username: string,
    action: string,
    target: string,
    details: string
) => {
    try {
        await addDoc(collection(db, AUDIT_COLLECTION), {
            userId,
            username,
            action,
            target,
            details,
            timestamp: Timestamp.now()
        });
    } catch (error) {
        console.error("Failed to log action:", error);
    }
};

export const getAuditLogs = async (limitCount: number = 50): Promise<AuditLog[]> => {
    try {
        const q = query(
            collection(db, AUDIT_COLLECTION),
            orderBy('timestamp', 'desc'),
            limit(limitCount)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp.toDate().toISOString() // Convert Timestamp to string for UI
        } as AuditLog));
    } catch (error) {
        console.error("Failed to fetch audit logs:", error);
        return [];
    }
};
