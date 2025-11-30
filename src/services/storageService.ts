import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

/**
 * Uploads an image to Firebase Storage and returns the download URL.
 * @param file The file to upload.
 * @param path The path in storage (e.g., 'ootd/', 'products/').
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

/**
 * Uploads multiple product images to Firebase Storage
 * @param files Array of files to upload
 * @returns Promise resolving to an array of download URLs
 */
export const uploadProductImages = async (files: File[]): Promise<string[]> => {
    try {
        const uploadPromises = files.map(file => uploadImage(file, 'products'));
        const urls = await Promise.all(uploadPromises);
        return urls;
    } catch (error) {
        console.error("Error uploading product images:", error);
        throw error;
    }
};

/**
 * Deletes an image from Firebase Storage
 * @param imageUrl The full download URL of the image to delete
 */
export const deleteImage = async (imageUrl: string): Promise<void> => {
    try {
        // Extract the path from the full URL
        // URL format: https://firebasestorage.googleapis.com/v0/b/{bucket}/o/{path}?alt=media&token={token}
        const url = new URL(imageUrl);
        const pathMatch = url.pathname.match(/\/o\/(.+?)(\?|$)/);

        if (!pathMatch) {
            throw new Error('Invalid image URL format');
        }

        // Decode the path (it's URL encoded)
        const encodedPath = pathMatch[1];
        const decodedPath = decodeURIComponent(encodedPath);

        const imageRef = ref(storage, decodedPath);
        await deleteObject(imageRef);
    } catch (error) {
        console.error("Error deleting image:", error);
        throw error;
    }
};
