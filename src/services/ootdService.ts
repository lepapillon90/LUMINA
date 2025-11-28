import { getAll, add, update, getQuery } from './db';
import { OOTDPost } from '../types';
import { orderBy, arrayUnion, arrayRemove } from 'firebase/firestore';

const COLLECTION = 'ootd_posts';

export const getOOTDPosts = async (): Promise<OOTDPost[]> => {
    // Get posts ordered by ID (descending) to show newest first, assuming ID is timestamp-ish or we add a createdAt
    // For now, just get all
    const posts = await getAll(COLLECTION);
    return posts as unknown as OOTDPost[];
};

export const createOOTDPost = async (post: Omit<OOTDPost, 'id'>) => {
    // We need to generate a numeric ID to match our type, or switch type to string.
    // For simplicity in migration, let's generate a timestamp-based numeric ID.
    const newId = Date.now();
    const newPost = { ...post, id: newId, comments: [], isLiked: false };
    await add(COLLECTION, newPost);
    return newPost;
};

export const toggleLikeOOTDPost = async (firestoreId: string, currentLikes: number, isLiked: boolean) => {
    // Note: In a real app, we'd track WHO liked it in a subcollection or array.
    // For this simple version, we just increment/decrement count and toggle local state.
    // However, 'isLiked' is per-user. Saving it to the doc means everyone sees it liked.
    // We will stick to the simple requirement: Update 'likes' count.
    // The 'isLiked' state should ideally be user-specific, but for now we might just update the count.

    const newLikes = isLiked ? currentLikes - 1 : currentLikes + 1;
    await update(COLLECTION, firestoreId, { likes: newLikes });
    return newLikes;
};

export const addCommentToOOTDPost = async (firestoreId: string, comment: { user: string; text: string }) => {
    await update(COLLECTION, firestoreId, {
        comments: arrayUnion(comment)
    });
};
