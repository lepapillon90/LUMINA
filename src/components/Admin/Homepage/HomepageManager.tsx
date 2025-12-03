import React, { useState } from 'react';
import { Layout, Video, Clock, Star, BookOpen, Image, Mail, TrendingUp, ImageIcon, Percent, Bell, Headphones } from 'lucide-react';
import { User } from '../../../types';
import HeroSectionManager from './HeroSectionManager';
import TimeSaleManager from './TimeSaleManager';
import NewArrivalsManager from './NewArrivalsManager';
import MagazineManager from './MagazineManager';
import LookbookManager from './LookbookManager';
import TrendingOOTDManager from './TrendingOOTDManager';
import InstagramFeedManager from './InstagramFeedManager';
import NewsletterManager from './NewsletterManager';
import BannersManager from './BannersManager';
import PromotionsManager from './PromotionsManager';
import AnnouncementBarManager from './AnnouncementBarManager';
import CSManager from '../CS/CSManager';

interface HomepageManagerProps {
    user: User | null;
}

type Section = 'overview' | 'hero' | 'timesale' | 'newarrivals' | 'lookbook' | 'trending' | 'magazine' | 'instagram' | 'newsletter' | 'banners' | 'promotions' | 'announcement' | 'cs';

const HomepageManager: React.FC<HomepageManagerProps> = ({ user }) => {
    const [activeSection, setActiveSection] = useState<Section>('overview');

    const sections = [
        { id: 'overview', label: '개요', icon: Layout },
        { id: 'announcement', label: '상단 알림', icon: Bell },
        { id: 'hero', label: 'Hero 섹션', icon: Video },
        { id: 'timesale', label: '타임세일', icon: Clock },
        { id: 'newarrivals', label: '신상품', icon: Star },
        { id: 'lookbook', label: '룩북', icon: Image },
        { id: 'trending', label: '트렌딩 OOTD', icon: TrendingUp },
        { id: 'magazine', label: '매거진', icon: BookOpen },
        { id: 'instagram', label: '인스타그램', icon: Image },
        { id: 'newsletter', label: '뉴스레터', icon: Mail },
        { id: 'banners', label: '배너 관리', icon: ImageIcon },
        { id: 'promotions', label: '프로모션', icon: Percent },
        { id: 'cs', label: '고객센터', icon: Headphones },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">홈페이지 관리</h1>
                <p className="text-gray-600 text-sm">홈페이지의 각 섹션을 관리할 수 있습니다.</p>
            </div>

            {/* Section Navigation */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex flex-wrap gap-2">
                    {sections.map((section) => {
                        const Icon = section.icon;
                        const isActive = activeSection === section.id;
                        return (
                            <button
                                key={section.id}
                                onClick={() => setActiveSection(section.id as Section)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition ${isActive
                                        ? 'bg-gray-900 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                <Icon size={16} />
                                <span>{section.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Section Content */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
                {activeSection === 'overview' && (
                    <div className="text-center py-12">
                        <Layout size={48} className="mx-auto text-gray-300 mb-4" />
                        <h2 className="text-xl font-bold text-gray-600 mb-2">홈페이지 관리 대시보드</h2>
                        <p className="text-gray-500 mb-6">좌측 메뉴에서 관리할 섹션을 선택하세요.</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
                            <div className="p-4 border border-gray-200 rounded-lg">
                                <Video size={24} className="mx-auto text-gray-400 mb-2" />
                                <p className="text-sm font-medium">Hero 섹션</p>
                                <p className="text-xs text-gray-500 mt-1">메인 비디오/이미지</p>
                            </div>
                            <div className="p-4 border border-gray-200 rounded-lg">
                                <Clock size={24} className="mx-auto text-gray-400 mb-2" />
                                <p className="text-sm font-medium">타임세일</p>
                                <p className="text-xs text-gray-500 mt-1">할인 이벤트 관리</p>
                            </div>
                            <div className="p-4 border border-gray-200 rounded-lg">
                                <Star size={24} className="mx-auto text-gray-400 mb-2" />
                                <p className="text-sm font-medium">신상품</p>
                                <p className="text-xs text-gray-500 mt-1">신상품 진열 관리</p>
                            </div>
                        </div>
                    </div>
                )}

                {activeSection === 'announcement' && <AnnouncementBarManager user={user} />}

                {activeSection === 'hero' && <HeroSectionManager user={user} />}

                {activeSection === 'timesale' && <TimeSaleManager user={user} />}

                {activeSection === 'newarrivals' && <NewArrivalsManager user={user} />}

                {activeSection === 'lookbook' && <LookbookManager user={user} />}

                {activeSection === 'trending' && <TrendingOOTDManager user={user} />}

                {activeSection === 'magazine' && <MagazineManager user={user} />}

                {activeSection === 'instagram' && <InstagramFeedManager user={user} />}

                {activeSection === 'newsletter' && <NewsletterManager user={user} />}

                {activeSection === 'banners' && <BannersManager user={user} />}

                {activeSection === 'promotions' && <PromotionsManager user={user} />}

                {activeSection === 'cs' && <CSManager />}
            </div>
        </div>
    );
};

export default HomepageManager;

