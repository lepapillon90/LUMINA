import { db } from '../firebase';
import { collection, addDoc, updateDoc, query, where, getDocs, orderBy, writeBatch, doc, deleteDoc, runTransaction, getFirestore, getDoc } from 'firebase/firestore';
import { Order, Product } from '../types';
import { logAction } from './auditService';
import { sendOrderNotification } from './emailService';

const ORDERS_COLLECTION = 'orders';

export const createOrder = async (userId: string, order: Omit<Order, 'id'>): Promise<string> => {
    console.log("Creating order for user:", userId, "Order data:", order);


    try {
        // DEBUG: Sequential operations to isolate permission error
        // 1. Check and Update Stock (one by one)
        for (const item of order.items) {
            const productRef = doc(db, 'products', String(item.id));
            const productDoc = await getDoc(productRef);

            if (!productDoc.exists()) {
                throw `Product ${item.name} does not exist!`;
            }

            const productData = productDoc.data();
            const product = { id: item.id, ...productData } as Product;

            // 사이즈-색상 조합별 재고가 있는 경우 (최우선)
            if (product.sizeColorStock && item.selectedSize && item.selectedColor) {
                const stockItem = product.sizeColorStock.find(
                    s => s.size === item.selectedSize && s.color === item.selectedColor
                );

                if (stockItem) {
                    if (stockItem.quantity < item.quantity) {
                        throw `Stock insufficient for ${item.name} (Size: ${item.selectedSize}, Color: ${item.selectedColor}). Available: ${stockItem.quantity}`;
                    }

                    // 사이즈-색상 조합별 재고 차감
                    const updatedSizeColorStock = product.sizeColorStock.map(s =>
                        s.size === item.selectedSize && s.color === item.selectedColor
                            ? { ...s, quantity: s.quantity - item.quantity }
                            : s
                    );

                    await updateDoc(productRef, { sizeColorStock: updatedSizeColorStock });

                } else {
                    // 사이즈-색상 조합이 없지만 일반 재고가 있는 경우
                    const currentStock = productData.stock || 0;
                    if (currentStock < item.quantity) {
                        throw `Stock insufficient for ${item.name}. Available: ${currentStock}`;
                    }
                    await updateDoc(productRef, { stock: currentStock - item.quantity });
                }
            } else if (product.sizeStock && item.selectedSize && product.sizeStock[item.selectedSize] !== undefined) {
                // 사이즈별 재고가 있고 선택된 사이즈가 있는 경우 (하위 호환성)
                const currentSizeStock = product.sizeStock[item.selectedSize] || 0;
                if (currentSizeStock < item.quantity) {
                    throw `Stock insufficient for ${item.name} (Size: ${item.selectedSize}). Available: ${currentSizeStock}`;
                }

                const updatedSizeStock = {
                    ...product.sizeStock,
                    [item.selectedSize]: currentSizeStock - item.quantity
                };

                await updateDoc(productRef, { sizeStock: updatedSizeStock });
            } else {
                // 일반 재고 차감
                const currentStock = productData.stock || 0;
                if (currentStock < item.quantity) {
                    throw `Stock insufficient for ${item.name}. Available: ${currentStock}`;
                }

                // console.log(`[DEBUG] Updating stock for ${item.name}...`);
                await updateDoc(productRef, { stock: currentStock - item.quantity });
            }
        }

        // 2. Create Order
        const orderRef = await addDoc(collection(db, ORDERS_COLLECTION), {
            ...order,
            userId,
            createdAt: new Date()
        });
        const newOrderId = orderRef.id;

        console.log("Order created with ID:", newOrderId);

        // Send Admin Notification (Client-side simulation)
        sendOrderNotification(newOrderId, order.total).catch(err => console.error("Failed to send admin notification:", err));

        return newOrderId;
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

export const updateOrderStatuses = async (orderIds: string[], status: string, adminUser?: { uid: string, username: string }): Promise<void> => {
    console.log("Updating orders:", orderIds, "to status:", status);
    try {
        // 주문 취소 시 재고 복구를 위해 주문 정보를 먼저 가져옴
        const ordersToUpdate: Order[] = [];
        if (status === '주문취소') {
            for (const orderId of orderIds) {
                const orderRef = doc(db, ORDERS_COLLECTION, orderId);
                const orderDoc = await getDoc(orderRef);
                if (orderDoc.exists()) {
                    const orderData = orderDoc.data() as Order;
                    // 이전 상태가 주문취소가 아닌 경우에만 재고 복구
                    if (orderData.status !== '주문취소') {
                        ordersToUpdate.push({ id: orderDoc.id, ...orderData } as Order);
                    }
                }
            }
        }

        const batch = writeBatch(db);
        orderIds.forEach(id => {
            const orderRef = doc(db, ORDERS_COLLECTION, id);
            batch.update(orderRef, { status });
        });
        await batch.commit();

        // 주문 취소 시 재고 복구
        if (status === '주문취소' && ordersToUpdate.length > 0) {
            console.log(`[MY_LOG] Restoring stock for ${ordersToUpdate.length} cancelled orders`);
            for (const order of ordersToUpdate) {
                for (const item of order.items) {
                    const productRef = doc(db, 'products', String(item.id));
                    const productDoc = await getDoc(productRef);

                    if (productDoc.exists()) {
                        const productData = productDoc.data();
                        const product = { id: item.id, ...productData } as Product;

                        // 사이즈-색상 조합별 재고 복구 (최우선)
                        if (product.sizeColorStock && item.selectedSize && item.selectedColor) {
                            const stockItem = product.sizeColorStock.find(
                                s => s.size === item.selectedSize && s.color === item.selectedColor
                            );

                            if (stockItem) {
                                const updatedSizeColorStock = product.sizeColorStock.map(s =>
                                    s.size === item.selectedSize && s.color === item.selectedColor
                                        ? { ...s, quantity: s.quantity + item.quantity }
                                        : s
                                );
                                console.log(`[MY_LOG] Restoring ${item.quantity} units of ${item.name} (Size: ${item.selectedSize}, Color: ${item.selectedColor}) (${stockItem.quantity} -> ${stockItem.quantity + item.quantity})`);
                                await updateDoc(productRef, { sizeColorStock: updatedSizeColorStock });
                            } else {
                                // 사이즈-색상 조합이 없으면 일반 재고 복구
                                const currentStock = productData.stock || 0;
                                const restoredStock = currentStock + item.quantity;
                                console.log(`[MY_LOG] Restoring ${item.quantity} units of ${item.name} (${currentStock} -> ${restoredStock})`);
                                await updateDoc(productRef, { stock: restoredStock });
                            }
                        } else if (product.sizeStock && item.selectedSize && product.sizeStock[item.selectedSize] !== undefined) {
                            // 사이즈별 재고 복구 (하위 호환성)
                            const currentSizeStock = product.sizeStock[item.selectedSize] || 0;
                            const restoredSizeStock = currentSizeStock + item.quantity;
                            const updatedSizeStock = {
                                ...product.sizeStock,
                                [item.selectedSize]: restoredSizeStock
                            };
                            console.log(`[MY_LOG] Restoring ${item.quantity} units of ${item.name} (Size: ${item.selectedSize}) (${currentSizeStock} -> ${restoredSizeStock})`);
                            await updateDoc(productRef, { sizeStock: updatedSizeStock });
                        } else {
                            // 일반 재고 복구
                            const currentStock = productData.stock || 0;
                            const restoredStock = currentStock + item.quantity;
                            console.log(`[MY_LOG] Restoring ${item.quantity} units of ${item.name} (${currentStock} -> ${restoredStock})`);
                            await updateDoc(productRef, { stock: restoredStock });
                        }
                    }
                }
            }
            console.log("[MY_LOG] Stock restoration completed");
        }

        // Log the action if adminUser is provided
        if (adminUser) {
            await logAction(
                adminUser.uid,
                adminUser.username,
                'UPDATE_ORDER_STATUS',
                `${orderIds.length} orders`,
                `Status changed to ${status} for orders: ${orderIds.join(', ')}${status === '주문취소' && ordersToUpdate.length > 0 ? ` (Stock restored for ${ordersToUpdate.length} orders)` : ''}`
            );
        }

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
