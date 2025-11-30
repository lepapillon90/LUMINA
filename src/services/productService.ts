import { collection, getDocs, doc, getDoc, query, where, setDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Product } from '../types';

const PRODUCTS_COLLECTION = 'products';

/**
 * Fetch all products from Firestore
 */
export const getProducts = async (): Promise<Product[]> => {
    try {
        const querySnapshot = await getDocs(collection(db, PRODUCTS_COLLECTION));
        const products: Product[] = [];

        querySnapshot.forEach((doc) => {
            products.push({ id: doc.id as any, ...doc.data() } as Product);
        });

        return products;
    } catch (error) {
        console.error('Error fetching products:', error);
        return [];
    }
};

/**
 * Fetch a single product by ID
 */
export const getProductById = async (id: number): Promise<Product | null> => {
    try {
        const docRef = doc(db, PRODUCTS_COLLECTION, id.toString());
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return { id: docSnap.id as any, ...docSnap.data() } as Product;
        } else {
            console.warn(`Product with ID ${id} not found`);
            return null;
        }
    } catch (error) {
        console.error('Error fetching product:', error);
        return null;
    }
};

/**
 * Fetch products by category
 */
export const getProductsByCategory = async (category: string): Promise<Product[]> => {
    try {
        const q = query(
            collection(db, PRODUCTS_COLLECTION),
            where('category', '==', category)
        );
        const querySnapshot = await getDocs(q);
        const products: Product[] = [];

        querySnapshot.forEach((doc) => {
            products.push({ id: doc.id as any, ...doc.data() } as Product);
        });

        return products;
    } catch (error) {
        console.error('Error fetching products by category:', error);
        return [];
    }
};

/**
 * Fetch new arrival products
 */
export const getNewProducts = async (): Promise<Product[]> => {
    try {
        const q = query(
            collection(db, PRODUCTS_COLLECTION),
            where('isNew', '==', true)
        );
        const querySnapshot = await getDocs(q);
        const products: Product[] = [];

        querySnapshot.forEach((doc) => {
            products.push({ id: doc.id as any, ...doc.data() } as Product);
        });

        return products;
    } catch (error) {
        console.error('Error fetching new products:', error);
        return [];
    }
};

/**
 * Create a new product in Firestore
 */
export const createProduct = async (product: Omit<Product, 'id'>): Promise<Product> => {
    try {
        // Generate new ID using timestamp
        const newId = Date.now().toString();
        const docRef = doc(db, PRODUCTS_COLLECTION, newId);

        const productData = {
            ...product,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        };

        await setDoc(docRef, productData);

        return { id: newId as any, ...product };
    } catch (error) {
        console.error('Error creating product:', error);
        throw error;
    }
};

/**
 * Update an existing product in Firestore
 */
export const updateProduct = async (id: number | string, updates: Partial<Product>): Promise<void> => {
    try {
        const docRef = doc(db, PRODUCTS_COLLECTION, id.toString());

        const updateData = {
            ...updates,
            updatedAt: serverTimestamp(),
        };

        // Remove id from updates if present
        delete (updateData as any).id;

        await updateDoc(docRef, updateData);
    } catch (error) {
        console.error('Error updating product:', error);
        throw error;
    }
};

/**
 * Delete a product from Firestore
 */
export const deleteProduct = async (id: number | string): Promise<void> => {
    try {
        const docRef = doc(db, PRODUCTS_COLLECTION, id.toString());
        await deleteDoc(docRef);
    } catch (error) {
        console.error('Error deleting product:', error);
        throw error;
    }
};
