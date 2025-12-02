import React from 'react';
import { Helmet } from 'react-helmet-async';


interface SEOProps {
    title?: string;
    description?: string;
    image?: string;
    url?: string;
    jsonLd?: any;
}

const SEO: React.FC<SEOProps> = ({
    title = 'LUMINA - 루미나 프리미엄 악세서리',
    description = '당신의 빛을 찾아주는 프리미엄 쥬얼리 브랜드, 루미나입니다.',
    image = '/og-image.png',
    url = 'https://lumina-demo.web.app',
    jsonLd
}) => {
    const fullTitle = title === 'LUMINA - 루미나 프리미엄 악세서리' ? title : `${title} | LUMINA`;
    const fullUrl = url.startsWith('http') ? url : `https://lumina-demo.web.app${url}`;

    return (
        <Helmet>
            {/* Basic Meta Tags */}
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            <link rel="canonical" href={fullUrl} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content="website" />
            <meta property="og:url" content={fullUrl} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image} />

            {/* Twitter */}
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content={fullUrl} />
            <meta property="twitter:title" content={fullTitle} />
            <meta property="twitter:description" content={description} />
            <meta property="twitter:image" content={image} />

            {/* Structured Data */}
            {jsonLd && (
                <script type="application/ld+json">
                    {JSON.stringify(jsonLd)}
                </script>
            )}
        </Helmet>
    );
};

export default SEO;
