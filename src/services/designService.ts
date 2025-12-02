import { db } from '../firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, orderBy, writeBatch } from 'firebase/firestore';
import { Banner, Promotion, Product } from '../types';
import { logAction } from './auditService';

const BANNERS_COLLECTION = 'banners';
const PROMOTIONS_COLLECTION = 'promotions';
const PRODUCTS_COLLECTION = 'products';

// --- Banners ---

export const getBanners = async (): Promise<Banner[]> => {
    try {
        const q = query(collection(db, BANNERS_COLLECTION));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as Banner));
    } catch (error) {
        console.error("Error fetching banners:", error);
        return [];
    }
};

export const createBanner = async (banner: Omit<Banner, 'id'>, adminUser: { uid: string, username: string }): Promise<Banner> => {
    try {
        const docRef = await addDoc(collection(db, BANNERS_COLLECTION), banner);

        await logAction(
            adminUser.uid,
            adminUser.username,
            'CREATE_BANNER',
            banner.title,
            `Created banner: ${banner.title}`
        );

        return { id: docRef.id, ...banner } as unknown as Banner;
    } catch (error) {
        console.error("Error creating banner:", error);
        throw error;
    }
};

export const updateBanner = async (id: number | string, banner: Partial<Banner>, adminUser: { uid: string, username: string }): Promise<void> => {
    try {
        const docRef = doc(db, BANNERS_COLLECTION, String(id));
        await updateDoc(docRef, banner);

        await logAction(
            adminUser.uid,
            adminUser.username,
            'UPDATE_BANNER',
            banner.title || `Banner ${id}`,
            `Updated banner ${id}`
        );
    } catch (error) {
        console.error("Error updating banner:", error);
        throw error;
    }
};

export const deleteBanner = async (id: number | string, adminUser: { uid: string, username: string }): Promise<void> => {
    try {
        await deleteDoc(doc(db, BANNERS_COLLECTION, String(id)));

        await logAction(
            adminUser.uid,
            adminUser.username,
            'DELETE_BANNER',
            `Banner ${id}`,
            `Deleted banner ${id}`
        );
    } catch (error) {
        console.error("Error deleting banner:", error);
        throw error;
    }
};

// --- Promotions ---

export const getPromotions = async (): Promise<Promotion[]> => {
    try {
        const q = query(collection(db, PROMOTIONS_COLLECTION));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as Promotion));
    } catch (error) {
        console.error("Error fetching promotions:", error);
        return [];
    }
};

export const createPromotion = async (promotion: Omit<Promotion, 'id'>, adminUser: { uid: string, username: string }): Promise<Promotion> => {
    try {
        const docRef = await addDoc(collection(db, PROMOTIONS_COLLECTION), promotion);

        await logAction(
            adminUser.uid,
            adminUser.username,
            'CREATE_PROMOTION',
            promotion.title,
            `Created promotion: ${promotion.title}`
        );

        return { id: docRef.id, ...promotion } as unknown as Promotion;
    } catch (error) {
        console.error("Error creating promotion:", error);
        throw error;
    }
};

export const updatePromotion = async (id: number | string, promotion: Partial<Promotion>, adminUser: { uid: string, username: string }): Promise<void> => {
    try {
        const docRef = doc(db, PROMOTIONS_COLLECTION, String(id));
        await updateDoc(docRef, promotion);

        await logAction(
            adminUser.uid,
            adminUser.username,
            'UPDATE_PROMOTION',
            promotion.title || `Promotion ${id}`,
            `Updated promotion ${id}`
        );
    } catch (error) {
        console.error("Error updating promotion:", error);
        throw error;
    }
};

export const deletePromotion = async (id: number | string, adminUser: { uid: string, username: string }): Promise<void> => {
    try {
        await deleteDoc(doc(db, PROMOTIONS_COLLECTION, String(id)));

        await logAction(
            adminUser.uid,
            adminUser.username,
            'DELETE_PROMOTION',
            `Promotion ${id}`,
            `Deleted promotion ${id}`
        );
    } catch (error) {
        console.error("Error deleting promotion:", error);
        throw error;
    }
};

// --- Product Ordering ---

export const updateProductOrder = async (products: Product[], adminUser: { uid: string, username: string }): Promise<void> => {
    try {
        const batch = writeBatch(db);
        products.forEach((product, index) => {
            const docRef = doc(db, PRODUCTS_COLLECTION, String(product.id));
            // Assuming we add a 'displayOrder' field to the Product type in Firestore
            batch.update(docRef, { displayOrder: index });
        });
        await batch.commit();

        await logAction(
            adminUser.uid,
            adminUser.username,
            'UPDATE_PRODUCT_ORDER',
            'Product Display Order',
            `Updated display order for ${products.length} products`
        );
    } catch (error) {
        console.error("Error updating product order:", error);
        throw error;
    }
};
