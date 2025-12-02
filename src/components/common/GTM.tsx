import React, { useEffect } from 'react';

interface GTMProps {
    gtmId: string;
}

const GTM: React.FC<GTMProps> = ({ gtmId }) => {
    useEffect(() => {
        const scriptId = 'gtm-script';
        if (document.getElementById(scriptId)) return;

        const script = document.createElement('script');
        script.id = scriptId;
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtm.js?id=${gtmId}`;

        // GTM Data Layer init
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
            'gtm.start': new Date().getTime(),
            event: 'gtm.js'
        });

        document.head.appendChild(script);

        return () => {
            // Cleanup if needed, though GTM usually stays
        };
    }, [gtmId]);

    return (
        <noscript>
            <iframe
                src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
                height="0"
                width="0"
                style={{ display: 'none', visibility: 'hidden' }}
            />
        </noscript>
    );
};

declare global {
    interface Window {
        dataLayer: any[];
    }
}

export default GTM;
