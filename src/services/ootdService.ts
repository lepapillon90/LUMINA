import { getAll, add, update, getQuery } from './db';
import { OOTDPost } from '../types';
import { orderBy, arrayUnion, arrayRemove, runTransaction, doc, getFirestore } from 'firebase/firestore';

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
    const db = getFirestore();
    const postRef = doc(db, COLLECTION, firestoreId);

    try {
        await runTransaction(db, async (transaction) => {
            const postDoc = await transaction.get(postRef);
            if (!postDoc.exists()) {
                throw "Post does not exist!";
            }

            const postData = postDoc.data() as OOTDPost;
            // Calculate new likes based on current DB state, not UI state
            // If UI says 'isLiked' is true, it means user wants to UNLIKE.
            // But 'isLiked' passed here is the OLD state.
            // Wait, in OOTD.tsx: 
            // const newLikes = post.isLiked ? post.likes - 1 : post.likes + 1;
            // await toggleLikeOOTDPost(String(post.id), post.likes, post.isLiked);
            // So 'isLiked' passed is the OLD state (before toggle).

            // If old state was liked, we are unliking -> decrement.
            // If old state was not liked, we are liking -> increment.

            const adjustment = isLiked ? -1 : 1;
            const newLikes = (postData.likes || 0) + adjustment;

            transaction.update(postRef, { likes: Math.max(0, newLikes) });

            // Aggregation: Update author's total likes
            if (postData.userId) {
                const userRef = doc(db, 'users', postData.userId);
                const userDoc = await transaction.get(userRef);
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    const currentTotal = userData.totalLikes || 0;
                    const newTotal = currentTotal + adjustment;
                    transaction.update(userRef, { totalLikes: Math.max(0, newTotal) });
                }
            }
        });
        return true;
    } catch (e) {
        console.error("Transaction failed: ", e);
        throw e;
    }
};

export const addCommentToOOTDPost = async (firestoreId: string, comment: { user: string; text: string }) => {
    await update(COLLECTION, firestoreId, {
        comments: arrayUnion(comment)
    });
};
