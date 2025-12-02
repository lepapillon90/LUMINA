import imageCompression from 'browser-image-compression';


export const compressImage = async (file: File): Promise<File> => {
    const options = {
        maxSizeMB: 1,          // 최대 파일 크기: 1MB
        maxWidthOrHeight: 1920, // 최대 너비/높이: 1920px
        useWebWorker: true,    // 웹 워커 사용으로 성능 향상
        fileType: 'image/webp' // WebP 형식으로 변환 (선택 사항, 용량 절감 효과 큼)
    };

    try {
        const compressedFile = await imageCompression(file, options);
        // 원본 파일명 유지 (확장자는 webp로 변경될 수 있음)
        const newFileName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
        return new File([compressedFile], newFileName, { type: 'image/webp' });
    } catch (error) {
        console.error('Image compression failed:', error);
        return file; // 실패 시 원본 파일 반환
    }
};

export const optimizeImageUrl = (url: string, width: number = 800): string => {
    if (!url) return '';

    // Unsplash Optimization
    if (url.includes('images.unsplash.com')) {
        const separator = url.includes('?') ? '&' : '?';
        return `${url}${separator}auto=format&fit=crop&w=${width}&q=80`;
    }

    // Cloudinary Optimization (Example pattern)
    if (url.includes('cloudinary.com')) {
        // Basic example: insert transformation string
        // This is a simplified regex and might need adjustment based on actual URL structure
        return url.replace('/upload/', `/upload/w_${width},q_auto,f_auto/`);
    }

    return url;
};
