import React from 'react';
import MagazineSection from '../components/features/home/MagazineSection';
import SEO from '../components/common/SEO';

const Magazine: React.FC = () => {
    return (
        <div className="pt-40">
            <SEO title="Magazine | LUMINA" description="루미나의 다양한 이야기를 만나보세요." />
            <div className="container mx-auto px-6 pb-12">
                <h1 className="text-4xl font-serif text-primary mb-8 text-center">LUMINA Magazine</h1>
                <p className="text-center text-gray-500 mb-12">스타일링 팁부터 브랜드 스토리까지, 루미나의 이야기를 전해드립니다.</p>

                {/* Reusing the section for now as content */}
                <MagazineSection showViewAll={false} />
            </div>
        </div>
    );
};

export default Magazine;
