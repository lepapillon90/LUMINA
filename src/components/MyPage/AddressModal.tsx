import React, { useState, useEffect, useRef } from 'react';
import { X, Search, CheckCircle2 } from 'lucide-react';
import { DeliveryAddress } from '../../types';
import { useGlobalModal } from '../../contexts/GlobalModalContext';

// 다음 주소 API 타입 선언
declare global {
    interface Window {
        daum: {
            Postcode: {
                new(options: {
                    oncomplete: (data: {
                        zonecode: string;
                        address: string;
                        addressEnglish: string;
                        addressType: string;
                        bname: string;
                        buildingName: string;
                    }) => void;
                    width?: string;
                    height?: string;
                }): {
                    open: () => void;
                    embed: (element: HTMLElement) => void;
                };
            };
        };
    }
}

interface AddressModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (address: Omit<DeliveryAddress, 'id' | 'createdAt'>) => Promise<void>;
    editingAddress?: DeliveryAddress | null;
}

const AddressModal: React.FC<AddressModalProps> = ({ isOpen, onClose, onSave, editingAddress }) => {
    const { showAlert } = useGlobalModal();
    const [formData, setFormData] = useState({
        name: '',
        recipient: '',
        phone: '',
        postalCode: '',
        address: '',
        detailAddress: '',
        isDefault: false
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (editingAddress) {
            setFormData({
                name: editingAddress.name,
                recipient: editingAddress.recipient,
                phone: editingAddress.phone,
                postalCode: editingAddress.postalCode,
                address: editingAddress.address,
                detailAddress: editingAddress.detailAddress,
                isDefault: editingAddress.isDefault
            });
        } else {
            setFormData({
                name: '',
                recipient: '',
                phone: '',
                postalCode: '',
                address: '',
                detailAddress: '',
                isDefault: false
            });
        }
        // 모달이 열릴 때마다 에러 초기화
        setErrors({});
    }, [editingAddress, isOpen]);



    // 전화번호 포맷팅 함수 (010-XXXX-XXXX)
    const formatPhoneNumber = (value: string): string => {
        // 숫자만 추출
        const numbers = value.replace(/[^\d]/g, '');

        // 숫자가 없으면 빈 문자열 반환
        if (!numbers) return '';

        // 11자리를 초과하면 자름
        const limitedNumbers = numbers.slice(0, 11);

        // 길이에 따라 포맷팅
        if (limitedNumbers.length <= 3) {
            return limitedNumbers;
        } else if (limitedNumbers.length <= 7) {
            return `${limitedNumbers.slice(0, 3)}-${limitedNumbers.slice(3)}`;
        } else {
            return `${limitedNumbers.slice(0, 3)}-${limitedNumbers.slice(3, 7)}-${limitedNumbers.slice(7)}`;
        }
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatPhoneNumber(e.target.value);
        setFormData({ ...formData, phone: formatted });

        // 에러 메시지 제거
        if (errors.phone) {
            setErrors({ ...errors, phone: '' });
        }
    };



    const handleAddressSearch = () => {
        if (typeof window === 'undefined' || !window.daum || !window.daum.Postcode) {
            showAlert("주소 검색 서비스를 불러올 수 없습니다. 페이지를 새로고침해주세요.", "오류");
            return;
        }

        new window.daum.Postcode({
            oncomplete: function (data) {
                let addr = '';
                let extraAddr = '';

                // 사용자가 선택한 주소 타입에 따라 해당 주소 값을 가져온다
                if (data.addressType === 'R') {
                    addr = data.address; // 도로명 주소
                    // 법정동명이 있을 경우 추가한다
                    if (data.bname !== '') {
                        extraAddr += data.bname;
                    }
                    // 건물명이 있을 경우 추가한다
                    if (data.buildingName !== '') {
                        extraAddr += extraAddr !== '' ? ', ' + data.buildingName : data.buildingName;
                    }
                } else {
                    addr = data.address; // 지번 주소
                }

                // 우편번호와 주소 정보를 해당 필드에 넣는다
                setFormData(prev => ({
                    ...prev,
                    postalCode: data.zonecode,
                    address: addr
                }));

                // 커서를 상세주소 필드로 이동한다
                const detailInput = document.querySelector('input[placeholder*="상세 주소"]') as HTMLInputElement;
                if (detailInput) {
                    detailInput.focus();
                }
            },
            width: '100%',
            height: '100%'
        }).open();
    };

    // 유효성 검증 함수
    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        // 배송지 이름 검증
        if (!formData.name.trim()) {
            newErrors.name = '배송지 이름을 입력해주세요.';
        } else if (formData.name.trim().length < 1) {
            newErrors.name = '배송지 이름은 1자 이상 입력해주세요.';
        } else if (formData.name.trim().length > 20) {
            newErrors.name = '배송지 이름은 20자 이하여야 합니다.';
        }

        // 받는 분 이름 검증
        if (!formData.recipient.trim()) {
            newErrors.recipient = '받는 분 이름을 입력해주세요.';
        } else if (formData.recipient.trim().length < 2) {
            newErrors.recipient = '받는 분 이름은 2자 이상 입력해주세요.';
        } else if (formData.recipient.trim().length > 20) {
            newErrors.recipient = '받는 분 이름은 20자 이하여야 합니다.';
        } else if (!/^[가-힣a-zA-Z\s]+$/.test(formData.recipient.trim())) {
            newErrors.recipient = '받는 분 이름은 한글, 영문만 입력 가능합니다.';
        }

        // 전화번호 검증
        if (!formData.phone.trim()) {
            newErrors.phone = '전화번호를 입력해주세요.';
        } else {
            const phoneRegex = /^010-\d{4}-\d{4}$/;
            if (!phoneRegex.test(formData.phone)) {
                newErrors.phone = '올바른 전화번호 형식으로 입력해주세요. (010-XXXX-XXXX)';
            }
        }

        // 우편번호 검증
        if (!formData.postalCode.trim()) {
            newErrors.postalCode = '주소를 검색해주세요.';
        } else if (!/^\d{5}$/.test(formData.postalCode)) {
            newErrors.postalCode = '올바른 우편번호 형식이 아닙니다.';
        }

        // 기본 주소 검증
        if (!formData.address.trim()) {
            newErrors.address = '주소를 검색해주세요.';
        } else if (formData.address.trim().length > 200) {
            newErrors.address = '주소는 200자 이하여야 합니다.';
        }

        // 상세 주소 검증
        if (!formData.detailAddress.trim()) {
            newErrors.detailAddress = '상세 주소를 입력해주세요.';
        } else if (formData.detailAddress.trim().length < 2) {
            newErrors.detailAddress = '상세 주소는 2자 이상 입력해주세요.';
        } else if (formData.detailAddress.trim().length > 100) {
            newErrors.detailAddress = '상세 주소는 100자 이하여야 합니다.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 유효성 검증
        if (!validateForm()) {
            // 첫 번째 에러 필드로 스크롤
            const firstErrorField = Object.keys(errors)[0];
            if (firstErrorField) {
                const errorElement = document.querySelector(`[data-field="${firstErrorField}"]`) as HTMLElement;
                if (errorElement) {
                    errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    errorElement.focus();
                }
            }
            return;
        }

        try {
            setLoading(true);

            // 데이터 정리 (양쪽 공백 제거)
            const cleanedData = {
                name: formData.name.trim(),
                recipient: formData.recipient.trim(),
                phone: formData.phone.trim(),
                postalCode: formData.postalCode.trim(),
                address: formData.address.trim(),
                detailAddress: formData.detailAddress.trim(),
                isDefault: formData.isDefault
            };

            await onSave(cleanedData);
            await showAlert(editingAddress ? "배송지가 수정되었습니다." : "배송지가 추가되었습니다.", "완료");

            // 성공 후 폼 초기화 및 에러 초기화
            setErrors({});
            onClose();
        } catch (error: any) {
            console.error("[MY_LOG] Error saving address:", error);
            const errorMessage = error?.message || "배송지 저장 중 오류가 발생했습니다.";
            await showAlert(errorMessage, "오류");
        } finally {
            setLoading(false);
        }
    };

    // 입력 필드 변경 시 에러 메시지 제거
    const handleFieldChange = (field: string, value: string) => {
        setFormData({ ...formData, [field]: value });
        // 해당 필드의 에러가 있으면 제거
        if (errors[field]) {
            setErrors({ ...errors, [field]: '' });
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden animate-slide-up">
                <div className="p-6 border-b flex justify-between items-center">
                    <h2 className="text-xl font-serif font-bold">
                        {editingAddress ? '배송지 수정' : '새 배송지 추가'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-black transition"
                        disabled={loading}
                    >
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                배송지 이름 <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                data-field="name"
                                value={formData.name}
                                onChange={(e) => handleFieldChange('name', e.target.value)}
                                placeholder="예: 집, 회사"
                                maxLength={20}
                                className={`w-full border-gray-300 rounded-md shadow-sm focus:border-primary focus:ring focus:ring-primary/20 ${errors.name ? 'border-red-500' : ''
                                    }`}
                                disabled={loading}
                                required
                            />
                            {errors.name && (
                                <p className="mt-1 text-xs text-red-500">{errors.name}</p>
                            )}
                            <p className="mt-1 text-xs text-gray-400">{formData.name.length}/20</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                받는 분 <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                data-field="recipient"
                                value={formData.recipient}
                                onChange={(e) => handleFieldChange('recipient', e.target.value)}
                                placeholder="받는 분 이름"
                                maxLength={20}
                                className={`w-full border-gray-300 rounded-md shadow-sm focus:border-primary focus:ring focus:ring-primary/20 ${errors.recipient ? 'border-red-500' : ''
                                    }`}
                                disabled={loading}
                                required
                            />
                            {errors.recipient && (
                                <p className="mt-1 text-xs text-red-500">{errors.recipient}</p>
                            )}
                            <p className="mt-1 text-xs text-gray-400">{formData.recipient.length}/20</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                전화번호 <span className="text-red-500">*</span>
                            </label>
                            <div className="space-y-2">
                                <input
                                    type="tel"
                                    data-field="phone"
                                    value={formData.phone}
                                    onChange={(e) => {
                                        const formatted = formatPhoneNumber(e.target.value);
                                        handleFieldChange('phone', formatted);
                                    }}
                                    placeholder="010-1234-5678"
                                    maxLength={13}
                                    className={`flex-1 border-gray-300 rounded-md shadow-sm focus:border-primary focus:ring focus:ring-primary/20 ${errors.phone ? 'border-red-500' : ''
                                        }`}
                                    disabled={loading}
                                    required
                                />
                                {errors.phone && (
                                    <p className="text-xs text-red-500">{errors.phone}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                주소 검색 <span className="text-red-500">*</span>
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    data-field="postalCode"
                                    value={formData.postalCode}
                                    placeholder="우편번호"
                                    readOnly
                                    maxLength={5}
                                    className={`flex-1 border-gray-300 rounded-md shadow-sm bg-gray-50 cursor-pointer ${errors.postalCode ? 'border-red-500' : ''
                                        }`}
                                    disabled={loading}
                                    onClick={handleAddressSearch}
                                />
                                <button
                                    type="button"
                                    onClick={handleAddressSearch}
                                    disabled={loading}
                                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-gray-800 transition flex items-center gap-2 whitespace-nowrap disabled:opacity-50"
                                >
                                    <Search size={16} />
                                    주소 검색
                                </button>
                            </div>
                            {errors.postalCode && (
                                <p className="mt-1 text-xs text-red-500">{errors.postalCode}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                기본 주소 <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                data-field="address"
                                value={formData.address}
                                placeholder="주소 검색 버튼을 클릭하여 주소를 검색하세요"
                                readOnly
                                maxLength={200}
                                className={`w-full border-gray-300 rounded-md shadow-sm bg-gray-50 cursor-pointer ${errors.address ? 'border-red-500' : ''
                                    }`}
                                disabled={loading}
                                onClick={handleAddressSearch}
                                required
                            />
                            {errors.address && (
                                <p className="mt-1 text-xs text-red-500">{errors.address}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                상세 주소 <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                data-field="detailAddress"
                                value={formData.detailAddress}
                                onChange={(e) => handleFieldChange('detailAddress', e.target.value)}
                                placeholder="루미나 빌딩 101호"
                                maxLength={100}
                                className={`w-full border-gray-300 rounded-md shadow-sm focus:border-primary focus:ring focus:ring-primary/20 ${errors.detailAddress ? 'border-red-500' : ''
                                    }`}
                                disabled={loading}
                                required
                            />
                            {errors.detailAddress && (
                                <p className="mt-1 text-xs text-red-500">{errors.detailAddress}</p>
                            )}
                            <p className="mt-1 text-xs text-gray-400">{formData.detailAddress.length}/100</p>
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="isDefault"
                                checked={formData.isDefault}
                                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                                disabled={loading}
                            />
                            <label htmlFor="isDefault" className="ml-2 text-sm text-gray-700">
                                기본 배송지로 설정
                            </label>
                        </div>
                    </div>

                    <div className="mt-6 flex gap-3 justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                            disabled={loading}
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loading}
                        >
                            {loading ? '저장 중...' : editingAddress ? '수정하기' : '추가하기'}
                        </button>
                    </div>
                </form>


            </div >
        </div >
    );
};

export default AddressModal;

