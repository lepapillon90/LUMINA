import React, { useState, useEffect } from 'react';
import { MapPin, Bell, User, Save, Plus } from 'lucide-react';
import { useGlobalModal } from '../../contexts/GlobalModalContext';
import { useAuth } from '../../contexts';
import { DeliveryAddress, StyleProfile, NotificationSettings } from '../../types';
import { db } from '../../firebase';
import { doc, getDoc, updateDoc, collection, addDoc, deleteDoc, query, where, getDocs, writeBatch } from 'firebase/firestore';
import AddressModal from './AddressModal';

const Settings: React.FC = () => {
    const { showAlert } = useGlobalModal();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // 배송지 관련
    const [addresses, setAddresses] = useState<DeliveryAddress[]>([]);
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState<DeliveryAddress | null>(null);

    // 스타일 프로필
    const [profile, setProfile] = useState<StyleProfile>({
        ringSize: undefined,
        wristSize: undefined,
        neckSize: undefined,
        earSize: undefined,
        tone: undefined,
        preferredMaterials: [],
        preferredStyle: [],
        preferredJewelryTypes: [],
        budgetRange: undefined,
        wearingPurpose: [],
        designPreference: [],
        allergy: undefined,
        specialOccasions: {}
    });

    // 알림 설정
    const [marketing, setMarketing] = useState<NotificationSettings>({
        email: true,
        sms: false,
        push: true
    });

    // 사용자 설정 데이터 로드
    useEffect(() => {
        if (user?.uid) {
            loadUserSettings();
        }
    }, [user?.uid]);

    const loadUserSettings = async () => {
        if (!user?.uid) return;

        try {
            setLoading(true);

            // 사용자 문서에서 스타일 프로필과 알림 설정 로드
            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                const userData = userDoc.data();

                // 스타일 프로필 로드
                if (userData.styleProfile) {
                    setProfile({
                        ringSize: userData.styleProfile.ringSize,
                        wristSize: userData.styleProfile.wristSize,
                        neckSize: userData.styleProfile.neckSize,
                        earSize: userData.styleProfile.earSize,
                        tone: userData.styleProfile.tone,
                        preferredMaterials: userData.styleProfile.preferredMaterials || [],
                        preferredStyle: userData.styleProfile.preferredStyle || [],
                        preferredJewelryTypes: userData.styleProfile.preferredJewelryTypes || [],
                        budgetRange: userData.styleProfile.budgetRange,
                        wearingPurpose: userData.styleProfile.wearingPurpose || [],
                        designPreference: userData.styleProfile.designPreference || [],
                        allergy: userData.styleProfile.allergy,
                        specialOccasions: userData.styleProfile.specialOccasions || {}
                    });
                }

                // 알림 설정 로드
                if (userData.notificationSettings) {
                    setMarketing(userData.notificationSettings);
                }
            }

            // 배송지 로드
            await loadAddresses();
        } catch (error) {
            console.error('[MY_LOG] Error loading user settings:', error);
            await showAlert("설정을 불러오는 중 오류가 발생했습니다.", "오류");
        } finally {
            setLoading(false);
        }
    };

    const loadAddresses = async () => {
        if (!user?.uid) return;

        try {
            const addressesQuery = query(
                collection(db, 'user_addresses'),
                where('userId', '==', user.uid)
            );
            const querySnapshot = await getDocs(addressesQuery);

            const loadedAddresses: DeliveryAddress[] = [];
            querySnapshot.forEach((doc) => {
                loadedAddresses.push({
                    id: doc.id,
                    ...doc.data()
                } as DeliveryAddress);
            });

            // 기본 배송지 우선 정렬
            loadedAddresses.sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0));
            setAddresses(loadedAddresses);
        } catch (error) {
            console.error('[MY_LOG] Error loading addresses:', error);
        }
    };

    const handleSaveAddress = async (addressData: Omit<DeliveryAddress, 'id' | 'createdAt'>) => {
        if (!user?.uid) {
            throw new Error('로그인이 필요합니다. 로그인 후 다시 시도해주세요.');
        }

        // 실제 Firebase Auth 상태 확인
        const firebaseAuth = (await import('../../firebase')).auth;
        console.log('[MY_LOG] Firebase Auth current user:', firebaseAuth.currentUser?.uid);

        if (!firebaseAuth.currentUser) {
            throw new Error('로그인 상태가 확인되지 않습니다. 다시 로그인해주세요.');
        }

        if (user.uid !== firebaseAuth.currentUser.uid) {
            console.warn('[MY_LOG] User UID mismatch:', user.uid, 'vs', firebaseAuth.currentUser.uid);
        }

        console.log('[MY_LOG] Saving address - User UID:', user.uid);
        console.log('[MY_LOG] Firebase Auth UID:', firebaseAuth.currentUser.uid);
        console.log('[MY_LOG] Address Data:', addressData);

        try {
            const batch = writeBatch(db);

            // 기본 배송지로 설정하는 경우 다른 배송지들의 기본 설정 해제
            if (addressData.isDefault) {
                const addressesQuery = query(
                    collection(db, 'user_addresses'),
                    where('userId', '==', user.uid),
                    where('isDefault', '==', true)
                );

                try {
                    const querySnapshot = await getDocs(addressesQuery);
                    querySnapshot.forEach((doc) => {
                        batch.update(doc.ref, { isDefault: false });
                    });
                } catch (queryError: any) {
                    console.error('[MY_LOG] Error querying addresses:', queryError);
                    // 쿼리 실패해도 계속 진행 (새 주소 추가는 계속 진행)
                }
            }

            if (editingAddress) {
                // 수정 - userId는 변경하지 않음
                const { userId, ...addressDataWithoutUserId } = addressData as any;
                const addressRef = doc(db, 'user_addresses', editingAddress.id);
                batch.update(addressRef, {
                    ...addressDataWithoutUserId,
                    updatedAt: new Date()
                });
            } else {
                // 추가 - userId가 이미 있으면 제거하고 새로 설정
                const { userId, ...addressDataWithoutUserId } = addressData as any;
                const addressRef = doc(collection(db, 'user_addresses'));
                const addressToSave = {
                    ...addressDataWithoutUserId,
                    userId: user.uid, // 항상 현재 사용자의 uid로 설정
                    createdAt: new Date()
                };
                console.log('[MY_LOG] Address to save:', addressToSave);
                batch.set(addressRef, addressToSave);
            }

            console.log('[MY_LOG] Committing batch...');
            await batch.commit();
            console.log('[MY_LOG] Batch committed successfully');
            await loadAddresses();
        } catch (error: any) {
            console.error('[MY_LOG] Error saving address:', error);
            console.error('[MY_LOG] User UID:', user?.uid);
            console.error('[MY_LOG] Firebase Auth current user:', firebaseAuth.currentUser?.uid);
            console.error('[MY_LOG] Address Data:', addressData);
            console.error('[MY_LOG] Error Code:', error?.code);
            console.error('[MY_LOG] Error Message:', error?.message);
            console.error('[MY_LOG] Full Error:', JSON.stringify(error, null, 2));

            // Firestore 권한 오류 처리
            if (error?.code === 'permission-denied' || error?.code === 'permissions-denied') {
                throw new Error('배송지를 저장할 권한이 없습니다. 로그인 상태를 확인해주세요.');
            }

            // 기타 에러 메시지 개선
            if (error?.message) {
                throw new Error(`배송지 저장 실패: ${error.message}`);
            }
            throw error;
        }
    };

    const handleDeleteAddress = async (addressId: string) => {
        if (!user?.uid) return;

        const address = addresses.find(a => a.id === addressId);
        if (!address) return;

        const confirm = window.confirm(`"${address.name}" 배송지를 삭제하시겠습니까?`);
        if (!confirm) return;

        try {
            await deleteDoc(doc(db, 'user_addresses', addressId));
            await showAlert("배송지가 삭제되었습니다.", "완료");
            await loadAddresses();
        } catch (error) {
            console.error('[MY_LOG] Error deleting address:', error);
            await showAlert("배송지 삭제 중 오류가 발생했습니다.", "오류");
        }
    };

    const handleSetDefaultAddress = async (addressId: string) => {
        if (!user?.uid) return;

        try {
            const batch = writeBatch(db);

            // 모든 배송지의 기본 설정 해제
            const addressesQuery = query(
                collection(db, 'user_addresses'),
                where('userId', '==', user.uid)
            );
            const querySnapshot = await getDocs(addressesQuery);
            querySnapshot.forEach((doc) => {
                batch.update(doc.ref, { isDefault: doc.id === addressId });
            });

            await batch.commit();
            await showAlert("기본 배송지가 변경되었습니다.", "완료");
            await loadAddresses();
        } catch (error) {
            console.error('[MY_LOG] Error setting default address:', error);
            await showAlert("기본 배송지 설정 중 오류가 발생했습니다.", "오류");
        }
    };

    const handleEditAddress = (address: DeliveryAddress) => {
        setEditingAddress(address);
        setIsAddressModalOpen(true);
    };

    const handleAddAddress = () => {
        setEditingAddress(null);
        setIsAddressModalOpen(true);
    };

    const handleSaveSettings = async () => {
        if (!user?.uid) {
            await showAlert("로그인이 필요한 서비스입니다.", "알림");
            return;
        }

        try {
            setSaving(true);
            const userDocRef = doc(db, 'users', user.uid);

            await updateDoc(userDocRef, {
                styleProfile: profile,
                notificationSettings: marketing,
                updatedAt: new Date()
            });

            await showAlert("설정이 저장되었습니다.", "저장 완료");
        } catch (error) {
            console.error('[MY_LOG] Error saving settings:', error);
            await showAlert("설정 저장 중 오류가 발생했습니다.", "오류");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="text-center py-10 text-gray-500">
                설정을 불러오는 중...
            </div>
        );
    }

    return (
        <div className="space-y-12">
            {/* Delivery Address */}
            <section>
                <h3 className="text-lg font-serif font-bold mb-6 flex items-center gap-2">
                    <MapPin size={20} /> 배송지 관리
                </h3>
                <div className="space-y-4">
                    {addresses.map((address) => (
                        <div
                            key={address.id}
                            className={`border rounded-lg p-4 flex justify-between items-center ${address.isDefault ? 'bg-gray-50 border-gray-200' : 'border-gray-200'
                                }`}
                        >
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-bold text-gray-900">{address.name}</span>
                                    {address.isDefault && (
                                        <span className="text-[10px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded">
                                            Default
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-gray-600">
                                    {address.postalCode} {address.address} {address.detailAddress}
                                </p>
                                <p className="text-sm text-gray-600">{address.recipient}</p>
                                <p className="text-sm text-gray-500 mt-1">{address.phone}</p>
                            </div>
                            <div className="flex gap-3 ml-4">
                                {!address.isDefault && (
                                    <button
                                        onClick={() => handleSetDefaultAddress(address.id)}
                                        className="text-sm text-gray-500 underline hover:text-black"
                                    >
                                        기본으로 설정
                                    </button>
                                )}
                                <button
                                    onClick={() => handleEditAddress(address)}
                                    className="text-sm text-gray-500 underline hover:text-black"
                                >
                                    수정
                                </button>
                                <button
                                    onClick={() => handleDeleteAddress(address.id)}
                                    className="text-sm text-red-500 underline hover:text-red-700"
                                >
                                    삭제
                                </button>
                            </div>
                        </div>
                    ))}
                    {addresses.length === 0 && (
                        <div className="text-center py-8 text-gray-500 border border-dashed border-gray-300 rounded-lg">
                            등록된 배송지가 없습니다.
                        </div>
                    )}
                    <button
                        onClick={handleAddAddress}
                        className="w-full py-3 border border-dashed border-gray-300 rounded-lg text-gray-500 hover:bg-gray-50 hover:border-gray-400 transition flex items-center justify-center gap-2"
                    >
                        <Plus size={18} />
                        새 배송지 추가
                    </button>
                </div>
            </section>

            {/* Style Profile */}
            <section>
                <h3 className="text-lg font-serif font-bold mb-6 flex items-center gap-2">
                    <User size={20} /> 스타일 프로필
                </h3>

                <div className="space-y-8">
                    {/* 사이즈 정보 */}
                    <div>
                        <h4 className="text-base font-semibold text-gray-900 mb-4">사이즈 정보</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">반지 호수</label>
                                <select
                                    value={profile.ringSize || ''}
                                    onChange={(e) => setProfile({ ...profile, ringSize: e.target.value || undefined })}
                                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary focus:ring focus:ring-primary/20"
                                >
                                    <option value="">선택안함</option>
                                    <option>5호</option>
                                    <option>6호</option>
                                    <option>7호</option>
                                    <option>8호</option>
                                    <option>9호</option>
                                    <option>10호</option>
                                    <option>11호</option>
                                    <option>12호</option>
                                    <option>13호</option>
                                    <option>14호</option>
                                    <option>15호</option>
                                    <option>16호</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">손목 사이즈 (팔찌)</label>
                                <select
                                    value={profile.wristSize || ''}
                                    onChange={(e) => setProfile({ ...profile, wristSize: e.target.value || undefined })}
                                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary focus:ring focus:ring-primary/20"
                                >
                                    <option value="">선택안함</option>
                                    <option>XS (13-14cm)</option>
                                    <option>S (14-15cm)</option>
                                    <option>M (15-16cm)</option>
                                    <option>L (16-17cm)</option>
                                    <option>XL (17-18cm)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">목 사이즈 (목걸이)</label>
                                <select
                                    value={profile.neckSize || ''}
                                    onChange={(e) => setProfile({ ...profile, neckSize: e.target.value || undefined })}
                                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary focus:ring focus:ring-primary/20"
                                >
                                    <option value="">선택안함</option>
                                    <option>35-38cm</option>
                                    <option>40-42cm</option>
                                    <option>45-48cm</option>
                                    <option>50-55cm</option>
                                    <option>60cm+</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">귀 사이즈</label>
                                <select
                                    value={profile.earSize || ''}
                                    onChange={(e) => setProfile({ ...profile, earSize: e.target.value || undefined })}
                                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary focus:ring focus:ring-primary/20"
                                >
                                    <option value="">선택안함</option>
                                    <option>Small</option>
                                    <option>Medium</option>
                                    <option>Large</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* 선호 소재 및 톤 */}
                    <div>
                        <h4 className="text-base font-semibold text-gray-900 mb-4">선호 소재 및 톤</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">선호 컬러 톤</label>
                                <select
                                    value={profile.tone || ''}
                                    onChange={(e) => setProfile({ ...profile, tone: e.target.value || undefined })}
                                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary focus:ring focus:ring-primary/20"
                                >
                                    <option value="">선택안함</option>
                                    <option>Gold</option>
                                    <option>Silver</option>
                                    <option>Rose Gold</option>
                                    <option>Platinum</option>
                                    <option>White Gold</option>
                                    <option>Yellow Gold</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">선호 소재 (복수 선택 가능)</label>
                                <div className="flex flex-wrap gap-2">
                                    {['Gold', 'Silver', 'Rose Gold', 'Platinum', 'Titanium', '스테인리스 스틸'].map((material) => (
                                        <label key={material} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={profile.preferredMaterials?.includes(material) || false}
                                                onChange={(e) => {
                                                    const current = profile.preferredMaterials || [];
                                                    if (e.target.checked) {
                                                        setProfile({ ...profile, preferredMaterials: [...current, material] });
                                                    } else {
                                                        setProfile({ ...profile, preferredMaterials: current.filter(m => m !== material) });
                                                    }
                                                }}
                                                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                                            />
                                            <span className="ml-2 text-sm text-gray-700">{material}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 선호 스타일 */}
                    <div>
                        <h4 className="text-base font-semibold text-gray-900 mb-4">선호 스타일</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {['미니멀', '클래식', '모던', '빈티지', '럭셔리', '캐주얼', '엘레간트', '로맨틱'].map((style) => (
                                <label key={style} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={profile.preferredStyle?.includes(style) || false}
                                        onChange={(e) => {
                                            const current = profile.preferredStyle || [];
                                            if (e.target.checked) {
                                                setProfile({ ...profile, preferredStyle: [...current, style] });
                                            } else {
                                                setProfile({ ...profile, preferredStyle: current.filter(s => s !== style) });
                                            }
                                        }}
                                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">{style}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* 선호하는 주얼리 타입 */}
                    <div>
                        <h4 className="text-base font-semibold text-gray-900 mb-4">선호하는 주얼리 타입</h4>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                            {['반지', '목걸이', '귀걸이', '팔찌', '브로치', '헤어핀', '발찌', '시계'].map((type) => (
                                <label key={type} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={profile.preferredJewelryTypes?.includes(type) || false}
                                        onChange={(e) => {
                                            const current = profile.preferredJewelryTypes || [];
                                            if (e.target.checked) {
                                                setProfile({ ...profile, preferredJewelryTypes: [...current, type] });
                                            } else {
                                                setProfile({ ...profile, preferredJewelryTypes: current.filter(t => t !== type) });
                                            }
                                        }}
                                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">{type}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* 예산 범위 */}
                    <div>
                        <h4 className="text-base font-semibold text-gray-900 mb-4">예산 범위</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                            {['선택안함', '10만원 미만', '10-50만원', '50-100만원', '100-300만원', '300만원 이상'].map((range) => (
                                <label key={range} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="budgetRange"
                                        checked={profile.budgetRange === range || (!profile.budgetRange && range === '선택안함')}
                                        onChange={() => setProfile({ ...profile, budgetRange: range === '선택안함' ? undefined : range })}
                                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">{range}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* 착용 목적 */}
                    <div>
                        <h4 className="text-base font-semibold text-gray-900 mb-4">착용 목적</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {['일상', '데일리', '특별한 날', '선물', '결혼식', '파티', '비즈니스', '여행'].map((purpose) => (
                                <label key={purpose} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={profile.wearingPurpose?.includes(purpose) || false}
                                        onChange={(e) => {
                                            const current = profile.wearingPurpose || [];
                                            if (e.target.checked) {
                                                setProfile({ ...profile, wearingPurpose: [...current, purpose] });
                                            } else {
                                                setProfile({ ...profile, wearingPurpose: current.filter(p => p !== purpose) });
                                            }
                                        }}
                                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">{purpose}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* 디자인 선호도 */}
                    <div>
                        <h4 className="text-base font-semibold text-gray-900 mb-4">디자인 선호도</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {['심플', '화려한', '다이아몬드', '펄', '컬러 스톤', '기하학적', '자연스러운', '유니크'].map((design) => (
                                <label key={design} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={profile.designPreference?.includes(design) || false}
                                        onChange={(e) => {
                                            const current = profile.designPreference || [];
                                            if (e.target.checked) {
                                                setProfile({ ...profile, designPreference: [...current, design] });
                                            } else {
                                                setProfile({ ...profile, designPreference: current.filter(d => d !== design) });
                                            }
                                        }}
                                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">{design}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* 알러지 정보 */}
                    <div>
                        <h4 className="text-base font-semibold text-gray-900 mb-4">알러지 정보</h4>
                        <div className="max-w-md">
                            <select
                                value={profile.allergy || ''}
                                onChange={(e) => setProfile({ ...profile, allergy: e.target.value || undefined })}
                                className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary focus:ring focus:ring-primary/20"
                            >
                                <option value="">알러지 없음</option>
                                <option>Nickel (니켈)</option>
                                <option>Copper (구리)</option>
                                <option>Brass (황동)</option>
                                <option>Other Metals (기타 금속)</option>
                            </select>
                            <p className="text-xs text-gray-500 mt-1">알러지가 있으시면 알려주세요. 안전한 주얼리를 추천해드리겠습니다.</p>
                        </div>
                    </div>

                    {/* 기념일 정보 */}
                    <div>
                        <h4 className="text-base font-semibold text-gray-900 mb-4">기념일 정보</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">생일</label>
                                <input
                                    type="date"
                                    value={profile.specialOccasions?.birthday || ''}
                                    onChange={(e) => setProfile({
                                        ...profile,
                                        specialOccasions: {
                                            ...profile.specialOccasions,
                                            birthday: e.target.value || undefined
                                        }
                                    })}
                                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary focus:ring focus:ring-primary/20"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">기념일</label>
                                <input
                                    type="date"
                                    value={profile.specialOccasions?.anniversary || ''}
                                    onChange={(e) => setProfile({
                                        ...profile,
                                        specialOccasions: {
                                            ...profile.specialOccasions,
                                            anniversary: e.target.value || undefined
                                        }
                                    })}
                                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary focus:ring focus:ring-primary/20"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">기타 특별한 날</label>
                                <input
                                    type="text"
                                    value={profile.specialOccasions?.other || ''}
                                    onChange={(e) => setProfile({
                                        ...profile,
                                        specialOccasions: {
                                            ...profile.specialOccasions,
                                            other: e.target.value || undefined
                                        }
                                    })}
                                    placeholder="예: 프로포즈 데이"
                                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary focus:ring focus:ring-primary/20"
                                />
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">기념일에 맞춘 특별한 주얼리를 추천해드리겠습니다.</p>
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
                            <input
                                type="checkbox"
                                checked={marketing.email}
                                onChange={() => setMarketing({ ...marketing, email: !marketing.email })}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                    </div>
                    <div className="flex items-center justify-between py-2">
                        <div>
                            <p className="font-medium text-gray-900">SMS 수신</p>
                            <p className="text-sm text-gray-500">주문 상태 및 배송 알림 (필수 항목 제외)</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={marketing.sms}
                                onChange={() => setMarketing({ ...marketing, sms: !marketing.sms })}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                    </div>
                    <div className="flex items-center justify-between py-2">
                        <div>
                            <p className="font-medium text-gray-900">푸시 알림</p>
                            <p className="text-sm text-gray-500">주문 알림 및 프로모션</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={marketing.push}
                                onChange={() => setMarketing({ ...marketing, push: !marketing.push })}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                    </div>
                </div>
            </section>

            <div className="pt-6 border-t border-gray-100 flex justify-end">
                <button
                    onClick={handleSaveSettings}
                    disabled={saving}
                    className="bg-black text-white px-8 py-3 rounded hover:bg-gray-800 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Save size={18} />
                    <span>{saving ? '저장 중...' : '변경사항 저장'}</span>
                </button>
            </div>

            {/* Address Modal */}
            <AddressModal
                isOpen={isAddressModalOpen}
                onClose={() => {
                    setIsAddressModalOpen(false);
                    setEditingAddress(null);
                }}
                onSave={handleSaveAddress}
                editingAddress={editingAddress}
            />
        </div>
    );
};

export default Settings;
