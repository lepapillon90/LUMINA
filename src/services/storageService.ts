import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

/**
 * Uploads an image to Firebase Storage and returns the download URL.
 * @param file The file to upload.
 * @param path The path in storage (e.g., 'ootd/').
 * @returns Promise resolving to the download URL.
 */
export const uploadImage = async (file: File, path: string = 'ootd'): Promise<string> => {
    try {
        // Create a unique filename using timestamp and random string
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 8);
        const extension = file.name.split('.').pop();
        const filename = `${timestamp}_${randomString}.${extension}`;

        const storageRef = ref(storage, `${path}/${filename}`);

        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);

        return downloadURL;
    } catch (error) {
        console.error("Error uploading image:", error);
        throw error;
    }
};
