import React from 'react';
// import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title?: string;
    description?: string;
    image?: string;
}

const SEO: React.FC<SEOProps> = ({ title, description, image }) => {
    return null;
    /*
    const fullTitle = title === 'LUMINA - 루미나 프리미엄 악세서리' ? title : `${title} | LUMINA`;

    return (
        <Helmet>
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image} />
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:title" content={fullTitle} />
            <meta property="twitter:description" content={description} />
            <meta property="twitter:image" content={image} />
        </Helmet>
    );
    */
};

export default SEO;
