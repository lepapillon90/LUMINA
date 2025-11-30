import { collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';
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
