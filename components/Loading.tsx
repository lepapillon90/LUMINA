import React from 'react';

const Loading: React.FC = () => {
    return (
        <div className="flex items-center justify-center min-h-screen bg-white">
            <div className="flex flex-col items-center">
                <div className="w-12 h-12 border-4 border-gray-200 border-t-primary rounded-full animate-spin mb-4"></div>
                <p className="text-gray-500 font-serif tracking-widest text-sm">LOADING LUMINA...</p>
            </div>
        </div>
    );
};

export default Loading;
