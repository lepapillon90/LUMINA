import { getAll, getById } from './db';
import { Product } from '../types';

const COLLECTION = 'products';

export const getProducts = async (): Promise<Product[]> => {
    const products = await getAll(COLLECTION);
    return products as unknown as Product[];
};

export const getProductById = async (id: number): Promise<Product | null> => {
    // Firestore IDs are strings, but our legacy type uses number for ID.
    // We might need to handle this mapping. For now, we assume we query by a field 'id' if we keep numeric IDs,
    // or we switch to string IDs.
    // Strategy: Fetch all and find (not efficient but works for small catalog) OR query by 'id' field.

    // Better approach: Query by the numeric 'id' field stored in the document
    const products = await getAll(COLLECTION);
    const product = products.find((p: any) => p.id === id);
    return (product as unknown as Product) || null;
};
