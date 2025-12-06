import { collection, getDocs, doc, getDoc, query, where, setDoc, updateDoc, deleteDoc, serverTimestamp, arrayRemove } from 'firebase/firestore';
import { db } from '../firebase';
import { Product } from '../types';
import { getCache, setCache, CACHE_KEYS, DEFAULT_TTL } from '../utils/cache';
import { logAction } from './auditService';
import { deleteImage } from './storageService';

const PRODUCTS_COLLECTION = 'products';

/**
 * Fetch all products from Firestore with caching
 */
export const getProducts = async (): Promise<Product[]> => {
    // Try to get from cache first
    const cached = getCache<Product[]>(CACHE_KEYS.PRODUCTS);

    // If cached, return immediately and update in background
    if (cached && cached.length > 0) {
        // Update cache in background
        fetchProductsFromFirebase().then(products => {
            if (products.length > 0) {
                setCache(CACHE_KEYS.PRODUCTS, products, { ttl: DEFAULT_TTL.MEDIUM });
            }
        });
        return cached;
    }

    // Otherwise, fetch from Firebase
    return await fetchProductsFromFirebase();
};

/**
 * Internal function to fetch products from Firebase
 */
const fetchProductsFromFirebase = async (): Promise<Product[]> => {
    try {
        const querySnapshot = await getDocs(collection(db, PRODUCTS_COLLECTION));
        const products: Product[] = [];

        querySnapshot.forEach((doc) => {
            products.push({ id: doc.id as any, ...doc.data() } as Product);
        });

        // Cache the results
        if (products.length > 0) {
            setCache(CACHE_KEYS.PRODUCTS, products, { ttl: DEFAULT_TTL.MEDIUM });
        }

        return products;
    } catch (error) {
        console.error('Error fetching products:', error);
        // Return cached data if available on error
        const cached = getCache<Product[]>(CACHE_KEYS.PRODUCTS);
        return cached || [];
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
export const createProduct = async (product: Omit<Product, 'id'>, adminUser: { uid: string, username: string }): Promise<Product> => {
    try {
        // Generate new ID using timestamp
        const newId = Date.now().toString();
        const docRef = doc(db, PRODUCTS_COLLECTION, newId);

        // Sanitize product data
        const productData: any = {
            ...product,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        };

        // Ensure string arrays are actual arrays (fallback)
        const arrayFields = ['tags', 'colors', 'sizes', 'images'];
        arrayFields.forEach(field => {
            if (!productData[field]) productData[field] = [];
        });

        if (!productData.sizeColorStock) productData.sizeColorStock = [];

        // Remove any remaining undefined fields to prevent Firestore errors
        Object.keys(productData).forEach(key => {
            if (productData[key] === undefined) {
                delete productData[key];
            }
        });

        await setDoc(docRef, productData);

        // Log the action
        await logAction(
            adminUser.uid,
            adminUser.username,
            'CREATE_PRODUCT',
            product.name,
            `Created product: ${product.name} (${newId})`
        );

        return { id: newId as any, ...product };
    } catch (error) {
        console.error('Error creating product:', error);
        throw new Error(`Failed to create product: ${(error as any).message}`);
    }
};

/**
 * Update an existing product in Firestore
 */
export const updateProduct = async (id: number | string, updates: Partial<Product>, adminUser: { uid: string, username: string }): Promise<void> => {
    try {
        const docRef = doc(db, PRODUCTS_COLLECTION, id.toString());

        const updateData: any = {
            ...updates,
            updatedAt: serverTimestamp(),
        };

        // Remove id from updates if present
        delete updateData.id;

        // Remove undefined fields
        Object.keys(updateData).forEach(key => {
            if (updateData[key] === undefined) {
                delete updateData[key];
            }
        });

        await updateDoc(docRef, updateData);

        // Log the action
        await logAction(
            adminUser.uid,
            adminUser.username,
            'UPDATE_PRODUCT',
            updates.name || `Product ${id}`,
            `Updated product ${id} with fields: ${Object.keys(updates).join(', ')}`
        );
    } catch (error) {
        console.error('Error updating product:', error);
        throw new Error(`Failed to update product: ${(error as any).message}`);
    }
};

/**
 * Delete a product from Firestore, Storage, and related collections
 */
export const deleteProduct = async (id: number | string, adminUser: { uid: string, username: string }): Promise<void> => {
    try {
        const productId = id.toString();

        // 1. Fetch product data first to get image URLs
        const docRef = doc(db, PRODUCTS_COLLECTION, productId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            throw new Error('Product not found');
        }

        const productData = docSnap.data() as Product;

        // 2. Delete images from Storage
        const deleteImagePromises: Promise<void>[] = [];

        // Main image
        if (productData.image) {
            deleteImagePromises.push(
                deleteImage(productData.image).catch(err =>
                    console.warn(`Failed to delete main image for product ${id}:`, err)
                )
            );
        }

        // Additional images
        if (productData.images && productData.images.length > 0) {
            productData.images.forEach(imgUrl => {
                deleteImagePromises.push(
                    deleteImage(imgUrl).catch(err =>
                        console.warn(`Failed to delete additional image for product ${id}:`, err)
                    )
                );
            });
        }

        // Description images (extract from HTML)
        if (productData.description) {
            const imgRegex = /<img[^>]+src="([^"]+)"/g;
            let match;
            while ((match = imgRegex.exec(productData.description)) !== null) {
                const imgUrl = match[1];
                // Only delete if it's a firebase storage URL
                if (imgUrl.includes('firebasestorage')) {
                    deleteImagePromises.push(
                        deleteImage(imgUrl).catch(err =>
                            console.warn(`Failed to delete description image for product ${id}:`, err)
                        )
                    );
                }
            }
        }

        await Promise.all(deleteImagePromises);

        // 3. Remove references from other collections

        // TimeSale
        const timeSaleRef = doc(db, 'homepage_timesale', 'current');
        const timeSaleSnap = await getDoc(timeSaleRef);
        if (timeSaleSnap.exists()) {
            const timeSaleData = timeSaleSnap.data();
            if (timeSaleData.productIds && timeSaleData.productIds.includes(Number(id))) {
                await updateDoc(timeSaleRef, {
                    productIds: arrayRemove(Number(id)),
                    updatedAt: serverTimestamp()
                });
            }
        }

        // New Arrivals
        const newArrivalsRef = doc(db, 'homepage_newarrivals', 'current');
        const newArrivalsSnap = await getDoc(newArrivalsRef);
        if (newArrivalsSnap.exists()) {
            const newArrivalsData = newArrivalsSnap.data();
            if (newArrivalsData.productIds && newArrivalsData.productIds.includes(Number(id))) {
                await updateDoc(newArrivalsRef, {
                    productIds: arrayRemove(Number(id)),
                    updatedAt: serverTimestamp()
                });
            }
        }

        // 4. Delete the product document
        await deleteDoc(docRef);

        // Log the action
        await logAction(
            adminUser.uid,
            adminUser.username,
            'DELETE_PRODUCT',
            `Product ${productData.name} (${id})`,
            `Deleted product ID: ${id} and associated images/references`
        );
    } catch (error) {
        console.error('Error deleting product:', error);
        throw error;
    }
};
