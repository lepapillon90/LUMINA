import { db } from '../firebase';
import { collection, doc, getDocs, updateDoc, query, orderBy, where, Timestamp } from 'firebase/firestore';
import { Customer, Order } from '../types';
import { logAction } from './auditService';
import { calculateMembershipGrade } from './membershipService';

const USERS_COLLECTION = 'users';
const ORDERS_COLLECTION = 'orders';

export const getCustomers = async (): Promise<Customer[]> => {
    try {
        // Fetch all users (excluding admins)
        const usersSnapshot = await getDocs(collection(db, USERS_COLLECTION));

        // Fetch all orders to calculate totalSpent
        const ordersSnapshot = await getDocs(collection(db, ORDERS_COLLECTION));

        // Create a map of userId -> totalSpent
        const totalSpentMap = new Map<string, number>();
        const lastOrderDateMap = new Map<string, Date>();

        ordersSnapshot.forEach(doc => {
            const order = doc.data() as Order;
            const userId = order.userId;
            if (userId) {
                const currentTotal = totalSpentMap.get(userId) || 0;
                totalSpentMap.set(userId, currentTotal + (order.total || 0));

                // Track last order date
                if (order.createdAt) {
                    const orderDate = order.createdAt instanceof Timestamp
                        ? order.createdAt.toDate()
                        : new Date(order.createdAt);
                    const existingDate = lastOrderDateMap.get(userId);
                    if (!existingDate || orderDate > existingDate) {
                        lastOrderDateMap.set(userId, orderDate);
                    }
                }
            }
        });

        // Map Firestore documents to Customer type
        const customers: Customer[] = [];

        usersSnapshot.forEach(doc => {
            const data = doc.data();

            // Skip admin users
            if (data.role === 'ADMIN') return;

            const userId = doc.id;
            const totalSpent = totalSpentMap.get(userId) || 0;
            const calculatedGrade = calculateMembershipGrade(totalSpent);

            // Determine status based on last login and order date
            let status: 'active' | 'inactive' | 'banned' = 'active';
            const lastLogin = data.lastLogin
                ? (data.lastLogin instanceof Timestamp ? data.lastLogin.toDate() : new Date(data.lastLogin))
                : null;
            const lastOrderDate = lastOrderDateMap.get(userId);

            // Inactive if no login in last 90 days and no order in last 90 days
            const ninetyDaysAgo = new Date();
            ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

            if ((!lastLogin || lastLogin < ninetyDaysAgo) && (!lastOrderDate || lastOrderDate < ninetyDaysAgo)) {
                status = 'inactive';
            }

            // Format dates
            const joinDate = data.createdAt
                ? (data.createdAt instanceof Timestamp
                    ? data.createdAt.toDate()
                    : new Date(data.createdAt)).toISOString().split('T')[0]
                : '';

            const lastLoginDate = lastLogin
                ? lastLogin.toISOString().split('T')[0]
                : undefined;

            customers.push({
                id: userId,
                name: data.displayName || data.username || 'Unknown',
                email: data.email || '',
                phone: data.phoneNumber || '',
                joinDate,
                lastLoginDate,
                totalSpent,
                grade: calculatedGrade,
                status,
                memo: data.memo || '',
                points: data.points || 0
            } as Customer);
        });

        // Sort by totalSpent descending
        return customers.sort((a, b) => b.totalSpent - a.totalSpent);
    } catch (error) {
        console.error('[MY_LOG] Error fetching customers:', error);
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
        console.error('[MY_LOG] Error updating customer memo:', error);
        throw error;
    }
};

export const getCustomerOrders = async (customerId: string): Promise<Order[]> => {
    try {
        const q = query(
            collection(db, ORDERS_COLLECTION),
            where('userId', '==', customerId),
            orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
    } catch (error) {
        console.error('[MY_LOG] Error fetching customer orders:', error);
        return [];
    }
};
