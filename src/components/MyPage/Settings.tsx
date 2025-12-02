import React, { useState } from 'react';
import { MapPin, Bell, User, Save } from 'lucide-react';
import { useGlobalModal } from '../../contexts/GlobalModalContext';

const Settings: React.FC = () => {
    const { showAlert } = useGlobalModal();
    const [marketing, setMarketing] = useState({
        email: true,
        sms: false,
        push: true
    });

    const [profile, setProfile] = useState({
        ringSize: '11호',
        tone: 'Gold',
        allergy: 'None'
    });

    const handleSave = () => {
        // Simulate save
        showAlert("설정이 저장되었습니다.", "저장 완료");
    };

    return (
        <div className="space-y-12">
            {/* Delivery Address */}
            <section>
                <h3 className="text-lg font-serif font-bold mb-6 flex items-center gap-2">
                    <MapPin size={20} /> 배송지 관리
                </h3>
                <div className="space-y-4">
                    <div className="border border-gray-200 rounded-lg p-4 flex justify-between items-center bg-gray-50">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-gray-900">집 (기본)</span>
                                <span className="text-[10px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded">Default</span>
                            </div>
                            <p className="text-sm text-gray-600">서울시 강남구 테헤란로 123, 루미나 빌딩 101호</p>
                            <p className="text-sm text-gray-500 mt-1">010-1234-5678</p>
                        </div>
                        <button className="text-sm text-gray-500 underline hover:text-black">수정</button>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-4 flex justify-between items-center">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-gray-900">회사</span>
                            </div>
                            <p className="text-sm text-gray-600">경기도 성남시 분당구 판교역로 456</p>
                            <p className="text-sm text-gray-500 mt-1">010-1234-5678</p>
                        </div>
                        <div className="flex gap-3">
                            <button className="text-sm text-gray-500 underline hover:text-black">기본으로 설정</button>
                            <button className="text-sm text-gray-500 underline hover:text-black">수정</button>
                        </div>
                    </div>
                    <button className="w-full py-3 border border-dashed border-gray-300 rounded-lg text-gray-500 hover:bg-gray-50 hover:border-gray-400 transition">
                        + 새 배송지 추가
                    </button>
                </div>
            </section>

            {/* Style Profile */}
            <section>
                <h3 className="text-lg font-serif font-bold mb-6 flex items-center gap-2">
                    <User size={20} /> 스타일 프로필
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">반지 호수</label>
                        <select
                            value={profile.ringSize}
                            onChange={(e) => setProfile({ ...profile, ringSize: e.target.value })}
                            className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary focus:ring focus:ring-primary/20"
                        >
                            <option>7호</option>
                            <option>9호</option>
                            <option>11호</option>
                            <option>13호</option>
                            <option>15호</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">선호 컬러</label>
                        <select
                            value={profile.tone}
                            onChange={(e) => setProfile({ ...profile, tone: e.target.value })}
                            className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary focus:ring focus:ring-primary/20"
                        >
                            <option>Gold</option>
                            <option>Silver</option>
                            <option>Rose Gold</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">알러지 유무</label>
                        <select
                            value={profile.allergy}
                            onChange={(e) => setProfile({ ...profile, allergy: e.target.value })}
                            className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary focus:ring focus:ring-primary/20"
                        >
                            <option>None</option>
                            <option>Nickel</option>
                            <option>Metal</option>
                        </select>
                    </div>
                </div>
            </section>

            {/* Marketing Settings */}
            <section>
                <h3 className="text-lg font-serif font-bold mb-6 flex items-center gap-2">
                    <Bell size={20} /> 알림 설정
                </h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between py-2">
                        <div>
                            <p className="font-medium text-gray-900">이메일 수신</p>
                            <p className="text-sm text-gray-500">할인 혜택 및 뉴스레터</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={marketing.email} onChange={() => setMarketing({ ...marketing, email: !marketing.email })} className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                    </div>
                    <div className="flex items-center justify-between py-2">
                        <div>
                            <p className="font-medium text-gray-900">SMS 수신</p>
                            <p className="text-sm text-gray-500">주문 상태 및 배송 알림 (필수 항목 제외)</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={marketing.sms} onChange={() => setMarketing({ ...marketing, sms: !marketing.sms })} className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                    </div>
                </div>
            </section>

            <div className="pt-6 border-t border-gray-100 flex justify-end">
                <button
                    onClick={handleSave}
                    className="bg-black text-white px-8 py-3 rounded hover:bg-gray-800 transition flex items-center gap-2"
                >
                    <Save size={18} />
                    <span>변경사항 저장</span>
                </button>
            </div>
        </div>
    );
};

export default Settings;
