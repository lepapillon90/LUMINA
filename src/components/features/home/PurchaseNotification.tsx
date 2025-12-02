import React, { useState, useEffect } from 'react';
import { ShoppingBag, X } from 'lucide-react';

const PurchaseNotification: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [notification, setNotification] = useState<{ name: string; product: string; time: string } | null>(null);

    const mockPurchases = [
        { name: "김*지", product: "Lumina Signature Necklace", time: "방금 전" },
        { name: "이*수", product: "Classic Gold Ring", time: "1분 전" },
        { name: "박*영", product: "Pearl Drop Earrings", time: "2분 전" },
        { name: "Choi*H", product: "Silver Chain Bracelet", time: "방금 전" },
    ];

    useEffect(() => {
        // Initial delay
        const initialTimer = setTimeout(() => {
            showRandomNotification();
        }, 5000);

        // Loop
        const interval = setInterval(() => {
            showRandomNotification();
        }, 15000); // Show every 15 seconds

        return () => {
            clearTimeout(initialTimer);
            clearInterval(interval);
        };
    }, []);

    const showRandomNotification = () => {
        const random = mockPurchases[Math.floor(Math.random() * mockPurchases.length)];
        setNotification(random);
        setIsVisible(true);

        // Hide after 4 seconds
        setTimeout(() => {
            setIsVisible(false);
        }, 4000);
    };

    if (!isVisible || !notification) return null;

    return (
        <div className="fixed bottom-4 left-4 z-40 bg-white shadow-lg rounded-lg p-4 flex items-center gap-3 animate-slide-up border border-gray-100 max-w-xs">
            <div className="bg-gray-100 p-2 rounded-full">
                <ShoppingBag size={16} className="text-primary" />
            </div>
            <div className="flex-1">
                <p className="text-xs text-gray-500 mb-0.5">{notification.time} 구매</p>
                <p className="text-sm font-medium text-gray-900 line-clamp-1">
                    <span className="font-bold">{notification.name}</span>님이 구매하셨습니다.
                </p>
                <p className="text-xs text-gray-600 truncate">{notification.product}</p>
            </div>
            <button
                onClick={() => setIsVisible(false)}
                className="text-gray-400 hover:text-gray-600"
            >
                <X size={14} />
            </button>
        </div>
    );
};

export default PurchaseNotification;
