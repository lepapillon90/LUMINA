import { db } from '../firebase';
import { collection, addDoc, query, where, getDocs, orderBy, writeBatch, doc, deleteDoc } from 'firebase/firestore';
import { Order, Product } from '../types';
import { logAction } from './auditService';

const ORDERS_COLLECTION = 'orders';

export const createOrder = async (userId: string, order: Omit<Order, 'id'>): Promise<string> => {
    console.log("Creating order for user:", userId, "Order data:", order);
    try {
        const docRef = await addDoc(collection(db, ORDERS_COLLECTION), {
            ...order,
            userId,
            createdAt: new Date()
        });
        console.log("Order created with ID:", docRef.id);
        return docRef.id;
    } catch (error) {
        console.error("Error creating order: ", error);
        throw error;
    }
};

export const getPurchasedProducts = async (userId: string): Promise<Product[]> => {
    try {
        const q = query(
            collection(db, ORDERS_COLLECTION),
            where("userId", "==", userId)
            // orderBy("createdAt", "desc")
        );

        const querySnapshot = await getDocs(q);
        const productsMap = new Map<number, Product>();

        querySnapshot.forEach((doc) => {
            const order = doc.data() as Order;
            if (order.items) {
                order.items.forEach((item) => {
                    if (!productsMap.has(item.id)) {
                        productsMap.set(item.id, item);
                    }
                });
            }
        });

        return Array.from(productsMap.values());
    } catch (error) {
        console.error("Error fetching purchased products: ", error);
        return [];
    }
};

export const getAllOrders = async (): Promise<Order[]> => {
    console.log("Fetching all orders for admin");
    try {
        const q = query(
            collection(db, ORDERS_COLLECTION),
            orderBy("createdAt", "desc")
        );

        const querySnapshot = await getDocs(q);
        const orders: Order[] = [];

        querySnapshot.forEach((doc) => {
            orders.push({ id: doc.id, ...doc.data() } as Order);
        });

        return orders;
    } catch (error) {
        console.error("Error fetching all orders: ", error);
        return [];
    }
};

export const getOrders = async (userId: string): Promise<Order[]> => {
    console.log("Fetching orders for user:", userId);
    try {
        const q = query(
            collection(db, ORDERS_COLLECTION),
            where("userId", "==", userId)
            // orderBy("createdAt", "desc")
        );

        const querySnapshot = await getDocs(q);
        console.log("Orders snapshot size:", querySnapshot.size);
        const orders: Order[] = [];

        querySnapshot.forEach((doc) => {
            orders.push({ id: doc.id, ...doc.data() } as Order);
        });
        console.log("Parsed orders:", orders);

        return orders;
    } catch (error) {
        console.error("Error fetching orders: ", error);
        return [];
    }
};

export const updateOrderStatuses = async (orderIds: string[], status: string, adminUser: { uid: string, username: string }): Promise<void> => {
    console.log("Updating orders:", orderIds, "to status:", status);
    try {
        const batch = writeBatch(db);
        orderIds.forEach(id => {
            const orderRef = doc(db, ORDERS_COLLECTION, id);
            batch.update(orderRef, { status });
        });
        await batch.commit();

        // Log the action
        await logAction(
            adminUser.uid,
            adminUser.username,
            'UPDATE_ORDER_STATUS',
            `${orderIds.length} orders`,
            `Status changed to ${status} for orders: ${orderIds.join(', ')}`
        );

        console.log("Batch update successful");
    } catch (error) {
        console.error("Error updating order statuses: ", error);
        throw error;
    }
};

export const deleteOrder = async (orderId: string): Promise<void> => {
    console.log("Deleting order:", orderId);
    try {
        await deleteDoc(doc(db, ORDERS_COLLECTION, orderId));
        console.log("Order deleted successfully");
    } catch (error) {
        console.error("Error deleting order: ", error);
        throw error;
    }
};
