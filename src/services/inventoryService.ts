import { db } from '../firebase';
import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    orderBy,
    limit,
    Timestamp,
    serverTimestamp
} from 'firebase/firestore';
import { InventoryLog, Product } from '../types';
import { updateProduct } from './productService';
import { getProductById } from './productService';

const INVENTORY_LOGS_COLLECTION = 'inventory_logs';

/**
 * 입고 처리
 */
export const processStockIn = async (
    productId: number,
    size: string | undefined,
    color: string | undefined,
    quantity: number,
    reason: string,
    adminUser: { uid: string; username: string },
    currentStock: Array<{ size: string; color: string; quantity: number }>
): Promise<void> => {
    try {
        const product = await getProductById(productId);
        if (!product) {
            throw new Error('상품을 찾을 수 없습니다.');
        }

        // 기존 재고 찾기
        let existingItem = currentStock.find(
            item => item.size === size && item.color === color
        );

        const beforeQuantity = existingItem ? existingItem.quantity : 0;
        const afterQuantity = beforeQuantity + quantity;

        // 재고 업데이트
        let updatedStock: Array<{ size: string; color: string; quantity: number }>;

        if (existingItem) {
            // 기존 항목 업데이트
            updatedStock = currentStock.map(item =>
                item.size === size && item.color === color
                    ? { ...item, quantity: afterQuantity }
                    : item
            );
        } else {
            // 새 항목 추가
            if (!size || !color) {
                throw new Error('사이즈와 색상을 모두 입력해주세요.');
            }
            updatedStock = [...currentStock, { size, color, quantity: afterQuantity }];
        }

        // 상품 재고 업데이트
        await updateProduct(
            productId,
            { sizeColorStock: updatedStock },
            adminUser
        );

        // 로그 기록
        await addDoc(collection(db, INVENTORY_LOGS_COLLECTION), {
            productId,
            productName: product.name,
            type: '입고',
            size: size || null,
            color: color || null,
            quantity,
            beforeQuantity,
            afterQuantity,
            reason,
            adminUserId: adminUser.uid,
            adminUsername: adminUser.username,
            createdAt: serverTimestamp()
        });
    } catch (error) {
        console.error('Error processing stock in:', error);
        throw error;
    }
};

/**
 * 출고 처리
 */
export const processStockOut = async (
    productId: number,
    size: string | undefined,
    color: string | undefined,
    quantity: number,
    reason: string,
    adminUser: { uid: string; username: string },
    currentStock: Array<{ size: string; color: string; quantity: number }>,
    orderId?: string
): Promise<void> => {
    try {
        const product = await getProductById(productId);
        if (!product) {
            throw new Error('상품을 찾을 수 없습니다.');
        }

        // 기존 재고 찾기
        const existingItem = currentStock.find(
            item => item.size === size && item.color === color
        );

        if (!existingItem) {
            throw new Error('해당 사이즈/색상 조합의 재고가 없습니다.');
        }

        const beforeQuantity = existingItem.quantity;

        if (beforeQuantity < quantity) {
            throw new Error(`재고가 부족합니다. (현재 재고: ${beforeQuantity}개)`);
        }

        const afterQuantity = beforeQuantity - quantity;

        // 재고 업데이트
        let updatedStock: Array<{ size: string; color: string; quantity: number }>;

        if (afterQuantity === 0) {
            // 재고가 0이 되면 항목 제거
            updatedStock = currentStock.filter(
                item => !(item.size === size && item.color === color)
            );
        } else {
            // 재고 업데이트
            updatedStock = currentStock.map(item =>
                item.size === size && item.color === color
                    ? { ...item, quantity: afterQuantity }
                    : item
            );
        }

        // 상품 재고 업데이트
        await updateProduct(
            productId,
            { sizeColorStock: updatedStock },
            adminUser
        );

        // 로그 기록
        await addDoc(collection(db, INVENTORY_LOGS_COLLECTION), {
            productId,
            productName: product.name,
            type: '출고',
            size: size || null,
            color: color || null,
            quantity,
            beforeQuantity,
            afterQuantity,
            reason,
            adminUserId: adminUser.uid,
            adminUsername: adminUser.username,
            orderId: orderId || null,
            createdAt: serverTimestamp()
        });
    } catch (error) {
        console.error('Error processing stock out:', error);
        throw error;
    }
};

/**
 * 상품별 입고/출고 로그 조회
 */
export const getInventoryLogsByProduct = async (
    productId: number,
    limitCount: number = 100
): Promise<InventoryLog[]> => {
    try {
        const q = query(
            collection(db, INVENTORY_LOGS_COLLECTION),
            where('productId', '==', productId),
            orderBy('createdAt', 'desc'),
            limit(limitCount)
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt ? doc.data().createdAt.toDate() : new Date()
        } as InventoryLog));
    } catch (error) {
        console.error('Error fetching inventory logs:', error);
        return [];
    }
};

/**
 * 전체 입고/출고 로그 조회
 */
export const getAllInventoryLogs = async (
    limitCount: number = 100
): Promise<InventoryLog[]> => {
    try {
        const q = query(
            collection(db, INVENTORY_LOGS_COLLECTION),
            orderBy('createdAt', 'desc'),
            limit(limitCount)
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt ? doc.data().createdAt.toDate() : new Date()
        } as InventoryLog));
    } catch (error) {
        console.error('Error fetching all inventory logs:', error);
        return [];
    }
};

/**
 * 기간별 입고/출고 로그 조회
 */
export const getInventoryLogsByDateRange = async (
    startDate: Date,
    endDate: Date,
    productId?: number
): Promise<InventoryLog[]> => {
    try {
        let q;

        const startTimestamp = Timestamp.fromDate(startDate);
        const endTimestamp = Timestamp.fromDate(endDate);

        if (productId) {
            q = query(
                collection(db, INVENTORY_LOGS_COLLECTION),
                where('productId', '==', productId),
                where('createdAt', '>=', startTimestamp),
                where('createdAt', '<=', endTimestamp),
                orderBy('createdAt', 'desc')
            );
        } else {
            q = query(
                collection(db, INVENTORY_LOGS_COLLECTION),
                where('createdAt', '>=', startTimestamp),
                where('createdAt', '<=', endTimestamp),
                orderBy('createdAt', 'desc')
            );
        }

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => {
            const data = doc.data() as any;
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt ? data.createdAt.toDate() : new Date()
            } as InventoryLog;
        });
    } catch (error) {
        console.error('Error fetching inventory logs by date range:', error);
        return [];
    }
};


/**
 * 재고 변경 로그 직접 기록 (초기 재고 등록 등)
 */
export const logInventoryChange = async (
    productId: number,
    productName: string,
    type: '입고' | '출고',
    size: string | null,
    color: string | null,
    quantity: number,
    beforeQuantity: number,
    afterQuantity: number,
    reason: string,
    adminUser: { uid: string; username: string }
): Promise<void> => {
    try {
        await addDoc(collection(db, INVENTORY_LOGS_COLLECTION), {
            productId,
            productName,
            type,
            size,
            color,
            quantity,
            beforeQuantity,
            afterQuantity,
            reason,
            adminUserId: adminUser.uid,
            adminUsername: adminUser.username,
            createdAt: serverTimestamp()
        });
    } catch (error) {
        console.error('Error logging inventory change:', error);
        // 로그 기록 실패가 전체 프로세스를 막지 않도록 에러를 던지지 않음
    }
};
