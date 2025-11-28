import React, { useState } from 'react';
import { PRODUCTS, OOTD_POSTS } from '../../constants';
import { add } from '../../services/db';

const DataMigration: React.FC = () => {
    const [status, setStatus] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);

    const migrateProducts = async () => {
        setIsLoading(true);
        setStatus('Migrating Products...');
        try {
            let count = 0;
            for (const product of PRODUCTS) {
                // Check if already exists or just add? For simplicity, just add.
                // In real world, we'd check ID.
                await add('products', product);
                count++;
            }
            setStatus(`Successfully migrated ${count} products.`);
        } catch (error) {
            console.error(error);
            setStatus('Error migrating products.');
        } finally {
            setIsLoading(false);
        }
    };

    const migrateOOTD = async () => {
        setIsLoading(true);
        setStatus('Migrating OOTD Posts...');
        try {
            let count = 0;
            for (const post of OOTD_POSTS) {
                await add('ootd_posts', {
                    ...post,
                    comments: [],
                    isLiked: false
                });
                count++;
            }
            setStatus(`Successfully migrated ${count} OOTD posts.`);
        } catch (error) {
            console.error(error);
            setStatus('Error migrating OOTD posts.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-6 bg-white shadow rounded-lg max-w-lg mx-auto mt-10">
            <h2 className="text-2xl font-bold mb-4">Data Migration Tool</h2>
            <p className="mb-6 text-gray-600">Upload mock data to Firestore. Run this only once.</p>

            <div className="space-y-4">
                <button
                    onClick={migrateProducts}
                    disabled={isLoading}
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                    Migrate Products ({PRODUCTS.length})
                </button>

                <button
                    onClick={migrateOOTD}
                    disabled={isLoading}
                    className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50"
                >
                    Migrate OOTD Posts ({OOTD_POSTS.length})
                </button>
            </div>

            {status && (
                <div className="mt-6 p-4 bg-gray-100 rounded text-center font-medium">
                    {status}
                </div>
            )}
        </div>
    );
};

export default DataMigration;
