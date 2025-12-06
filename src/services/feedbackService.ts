import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

export interface AIFeedback {
    query: string;
    response: string;
    rating: 'like' | 'dislike';
    timestamp?: any;
}

const FEEDBACK_COLLECTION = 'ai_feedback';

/**
 * Save user feedback for an AI response
 */
export const saveAIFeedback = async (feedback: AIFeedback): Promise<void> => {
    try {
        await addDoc(collection(db, FEEDBACK_COLLECTION), {
            ...feedback,
            timestamp: serverTimestamp()
        });
        console.log('AI Feedback saved');
    } catch (error) {
        console.error('Error saving AI feedback:', error);
        // Fail silently to not disrupt the user experience
    }
};
