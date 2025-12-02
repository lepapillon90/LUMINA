import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

/**
 * Compresses an image file using HTML5 Canvas.
 * @param file The original file.
 * @param maxWidth The maximum width of the compressed image.
 * @param quality The quality of the JPEG compression (0 to 1).
 * @returns Promise resolving to the compressed Blob.
 */
const compressImage = (file: File, maxWidth: number = 1200, quality: number = 0.8): Promise<Blob> => {
    return new Promise((resolve, reject) => {
        const image = new Image();
        const reader = new FileReader();

        reader.onload = (e) => {
            image.src = e.target?.result as string;
        };

        reader.onerror = (error) => reject(error);

        image.onload = () => {
            const canvas = document.createElement('canvas');
            let width = image.width;
            let height = image.height;

            if (width > maxWidth) {
                height = Math.round((height * maxWidth) / width);
                width = maxWidth;
            }

            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error('Failed to get canvas context'));
                return;
            }

            ctx.drawImage(image, 0, 0, width, height);

            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error('Canvas to Blob conversion failed'));
                    }
                },
                'image/jpeg',
                quality
            );
        };

        reader.readAsDataURL(file);
    });
};

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
        const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
        // Force jpg extension if compressed, or keep original if not
        const finalExtension = ['jpg', 'jpeg', 'png', 'webp'].includes(extension) ? 'jpg' : extension;
        const filename = `${timestamp}_${randomString}.${finalExtension}`;

        const storageRef = ref(storage, `${path}/${filename}`);

        let fileToUpload: Blob | File = file;

        // Compress if it's an image
        if (file.type.startsWith('image/')) {
            try {
                console.log(`Original file size: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
                fileToUpload = await compressImage(file);
                console.log(`Compressed file size: ${(fileToUpload.size / 1024 / 1024).toFixed(2)} MB`);
            } catch (compressionError) {
                console.warn('Image compression failed, uploading original file:', compressionError);
            }
        }

        const snapshot = await uploadBytes(storageRef, fileToUpload);
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
