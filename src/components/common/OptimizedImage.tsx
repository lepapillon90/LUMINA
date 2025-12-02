import React, { useState } from 'react';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src: string;
    alt: string;
    className?: string;
    placeholder?: string;
    loading?: "lazy" | "eager";
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
    src,
    alt,
    className = '',
    placeholder = 'data:image/gif;base64,R0lGODlhAQABAIAAAMLCwgAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==', // Gray placeholder
    loading = "lazy",
    ...props
}) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState(false);

    return (
        <div className={`relative overflow-hidden ${className}`}>
            {!isLoaded && !error && (
                <div className="absolute inset-0 bg-gray-100 animate-pulse" />
            )}
            <img
                src={error ? placeholder : src}
                alt={alt}
                loading={loading}
                decoding="async"
                onLoad={() => setIsLoaded(true)}
                onError={() => {
                    setError(true);
                    setIsLoaded(true);
                }}
                className={`transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'} w-full h-full object-cover`}
                {...props}
            />
        </div>
    );
};

export default OptimizedImage;
