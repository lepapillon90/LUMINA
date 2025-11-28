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

export const getUserOOTDPosts = async (username: string): Promise<OOTDPost[]> => {
    try {
        // In a real app, we should query by userId, but for now we filter by username
        // Note: This requires an index if we use 'where' and 'orderBy' together

        // We can't use getDocs on a QueryConstraint[] directly with our helper, 
        // but 'getAll' doesn't support filtering.
        // Let's use the raw firebase functions here for specific query

        // Actually, let's just fetch all and filter in memory for this MVP phase 
        // to avoid index creation blocking the user immediately again.
        // TODO: Optimize with Firestore query and index
        const allPosts = await getAll(COLLECTION);
        const userPosts = (allPosts as unknown as OOTDPost[]).filter(post => post.user === username);

        // Sort by ID desc (newest first)
        return userPosts.sort((a, b) => b.id - a.id);
    } catch (error) {
        console.error("Error fetching user OOTD posts:", error);
        return [];
    }
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
