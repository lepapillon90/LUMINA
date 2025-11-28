import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
            <h1 className="text-6xl font-serif text-primary mb-4">404</h1>
            <h2 className="text-2xl font-medium text-gray-800 mb-4">Page Not Found</h2>
            <p className="text-gray-600 mb-8 max-w-md">
                요청하신 페이지를 찾을 수 없습니다. 주소가 정확한지 확인해 주세요.
            </p>
            <Link
                to="/"
                className="bg-primary text-white px-8 py-3 text-sm font-medium hover:bg-accent transition-colors uppercase tracking-wider"
            >
                Return to Home
            </Link>
        </div>
    );
};

export default NotFound;
