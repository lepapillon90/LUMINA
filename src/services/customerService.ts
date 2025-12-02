import { db } from '../firebase';
import { collection, doc, getDocs, updateDoc, query, orderBy } from 'firebase/firestore';
import { Customer } from '../types';
import { logAction } from './auditService';

const USERS_COLLECTION = 'users';

export const getCustomers = async (): Promise<Customer[]> => {
    try {
        // Assuming customers are users with role 'customer' or just all users for now
        // You might want to filter by role if you have a 'role' field in users collection
        const q = query(collection(db, USERS_COLLECTION));
        const snapshot = await getDocs(q);

        // Map Firestore documents to Customer type
        // Note: This mapping depends on your actual Firestore data structure
        return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                name: data.displayName || data.username || 'Unknown',
                email: data.email || '',
                phone: data.phoneNumber || '',
                joinDate: data.createdAt ? new Date(data.createdAt.seconds * 1000).toISOString().split('T')[0] : '',
                lastLoginDate: data.lastLogin ? new Date(data.lastLogin.seconds * 1000).toISOString().split('T')[0] : '',
                totalSpent: data.totalSpent || 0,
                grade: data.grade || 'Bronze',
                status: data.isActive ? 'active' : 'inactive',
                memo: data.memo || ''
            } as Customer;
        });
    } catch (error) {
        console.error("Error fetching customers:", error);
        return [];
    }
};

export const updateCustomerMemo = async (customerId: string, memo: string, adminUser: { uid: string, username: string }): Promise<void> => {
    try {
        const docRef = doc(db, USERS_COLLECTION, customerId);
        await updateDoc(docRef, { memo });

        await logAction(
            adminUser.uid,
            adminUser.username,
            'UPDATE_CUSTOMER_MEMO',
            `Customer ${customerId}`,
            `Updated memo for customer ${customerId}`
        );
    } catch (error) {
        console.error("Error updating customer memo:", error);
        throw error;
    }
};
