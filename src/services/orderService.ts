import { db } from '../firebase';
import { collection, addDoc, query, where, getDocs, orderBy } from 'firebase/firestore';
import { Order, Product } from '../types';

const ORDERS_COLLECTION = 'orders';

export const createOrder = async (userId: string, order: Omit<Order, 'id'>): Promise<string> => {
    try {
        const docRef = await addDoc(collection(db, ORDERS_COLLECTION), {
            ...order,
            userId,
            createdAt: new Date()
        });
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
            where("userId", "==", userId),
            orderBy("createdAt", "desc")
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

export const getOrders = async (userId: string): Promise<Order[]> => {
    try {
        const q = query(
            collection(db, ORDERS_COLLECTION),
            where("userId", "==", userId),
            orderBy("createdAt", "desc")
        );

        const querySnapshot = await getDocs(q);
        const orders: Order[] = [];

        querySnapshot.forEach((doc) => {
            orders.push({ id: doc.id, ...doc.data() } as Order);
        });

        return orders;
    } catch (error) {
        console.error("Error fetching orders: ", error);
        return [];
    }
};
