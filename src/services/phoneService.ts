/**
 * Phone Verification Service
 * 전화번호 인증 코드 발송 및 검증 서비스
 * 
 * Firebase Phone Authentication을 사용한 실제 SMS 발송
 */

import { auth } from '../firebase';
import { 
    RecaptchaVerifier, 
    signInWithPhoneNumber, 
    ConfirmationResult,
    PhoneAuthProvider,
    signInWithCredential
} from 'firebase/auth';

// 인증 결과 저장
let confirmationResult: ConfirmationResult | null = null;

/**
 * 전화번호 형식 정규화 (010-1234-5678 -> +821012345678)
 */
const normalizePhoneNumber = (phone: string): string => {
    const numbers = phone.replace(/[^\d]/g, '');
    if (numbers.startsWith('0')) {
        return `+82${numbers.slice(1)}`;
    }
    if (numbers.startsWith('82')) {
        return `+${numbers}`;
    }
    return `+82${numbers}`;
};

/**
 * reCAPTCHA Verifier 초기화
 */
const getRecaptchaVerifier = (): RecaptchaVerifier => {
    // 기존 verifier가 있으면 제거
    const existingVerifier = window.recaptchaVerifier;
    if (existingVerifier) {
        existingVerifier.clear();
    }

    const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {
            // reCAPTCHA 확인 완료
            console.log('[PhoneService] reCAPTCHA verified');
        },
        'expired-callback': () => {
            // reCAPTCHA 만료
            console.log('[PhoneService] reCAPTCHA expired');
        }
    });

    window.recaptchaVerifier = verifier;
    return verifier;
};

// Window 객체에 verifier 속성 추가
declare global {
    interface Window {
        recaptchaVerifier?: RecaptchaVerifier;
    }
}

/**
 * 전화번호 인증 코드 발송 (Firebase Phone Authentication)
 * 
 * 실제 SMS를 발송합니다.
 */
export const sendVerificationCode = async (phone: string, recaptchaContainerId: string = 'recaptcha-container'): Promise<{ success: boolean; message: string }> => {
    try {
        // 전화번호 형식 검증
        const phoneRegex = /^010-\d{4}-\d{4}$/;
        if (!phoneRegex.test(phone)) {
            return {
                success: false,
                message: '올바른 전화번호 형식으로 입력해주세요. (010-XXXX-XXXX)'
            };
        }

        const normalizedPhone = normalizePhoneNumber(phone);
        console.log(`[PhoneService] 전화번호 정규화: ${phone} -> ${normalizedPhone}`);

        // reCAPTCHA Verifier 설정
        let verifier: RecaptchaVerifier;
        try {
            verifier = getRecaptchaVerifier();
        } catch (error: any) {
            console.error('[PhoneService] reCAPTCHA Verifier 초기화 실패:', error);
            return {
                success: false,
                message: 'reCAPTCHA 설정에 실패했습니다. 페이지를 새로고침해주세요.'
            };
        }

        // Firebase Phone Authentication으로 SMS 발송
        try {
            confirmationResult = await signInWithPhoneNumber(auth, normalizedPhone, verifier);
            console.log('[PhoneService] SMS 발송 성공');

            // 세션 스토리지에 발송 기록 저장 (5분 유효)
            sessionStorage.setItem(`phone_verification_sent_${normalizedPhone}`, JSON.stringify({
                phone: normalizedPhone,
                sentAt: Date.now(),
                expiresAt: Date.now() + 5 * 60 * 1000 // 5분
            }));

            return {
                success: true,
                message: '인증 코드가 SMS로 발송되었습니다. 잠시만 기다려주세요.'
            };
        } catch (error: any) {
            console.error('[PhoneService] SMS 발송 실패:', error);
            
            // 기존 verifier 정리
            if (window.recaptchaVerifier) {
                window.recaptchaVerifier.clear();
                delete window.recaptchaVerifier;
            }

            // 에러 코드에 따른 메시지 처리
            let errorMessage = '인증 코드 발송 중 오류가 발생했습니다.';
            
            if (error.code === 'auth/too-many-requests') {
                errorMessage = '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.';
            } else if (error.code === 'auth/invalid-phone-number') {
                errorMessage = '유효하지 않은 전화번호 형식입니다.';
            } else if (error.code === 'auth/quota-exceeded') {
                errorMessage = '일일 SMS 발송 한도를 초과했습니다. 내일 다시 시도해주세요.';
            } else if (error.code === 'auth/captcha-check-failed') {
                errorMessage = 'reCAPTCHA 확인에 실패했습니다. 페이지를 새로고침하고 다시 시도해주세요.';
            } else if (error.message) {
                errorMessage = error.message;
            }

            return {
                success: false,
                message: errorMessage
            };
        }
    } catch (error: any) {
        console.error('[PhoneService] 인증 코드 발송 실패:', error);
        
        // verifier 정리
        if (window.recaptchaVerifier) {
            window.recaptchaVerifier.clear();
            delete window.recaptchaVerifier;
        }

        return {
            success: false,
            message: '인증 코드 발송 중 오류가 발생했습니다. 다시 시도해주세요.'
        };
    }
};

/**
 * 인증 코드 검증 (Firebase Phone Authentication)
 */
export const verifyCode = async (phone: string, inputCode: string): Promise<{ success: boolean; message: string }> => {
    try {
        if (!confirmationResult) {
            return {
                success: false,
                message: '인증 코드를 먼저 발송해주세요.'
            };
        }

        const normalizedPhone = normalizePhoneNumber(phone);
        
        // 발송 기록 확인
        const storageKey = `phone_verification_sent_${normalizedPhone}`;
        const storedData = sessionStorage.getItem(storageKey);
        
        if (!storedData) {
            return {
                success: false,
                message: '인증 코드를 먼저 발송해주세요.'
            };
        }

        const verificationData = JSON.parse(storedData);
        
        // 만료 확인
        if (Date.now() > verificationData.expiresAt) {
            sessionStorage.removeItem(storageKey);
            confirmationResult = null;
            return {
                success: false,
                message: '인증 코드가 만료되었습니다. 다시 발송해주세요.'
            };
        }

        // Firebase Phone Authentication으로 인증 코드 확인
        try {
            await confirmationResult.confirm(inputCode.trim());
            
            console.log('[PhoneService] 인증 코드 검증 성공');

            // 인증 성공 - 세션 스토리지에 인증 완료 표시 (10분 유효)
            sessionStorage.setItem(`phone_verified_${normalizedPhone}`, JSON.stringify({
                verified: true,
                phone: normalizedPhone,
                expiresAt: Date.now() + 10 * 60 * 1000 // 10분
            }));

            // 발송 기록 제거
            sessionStorage.removeItem(storageKey);
            
            // confirmationResult 초기화
            confirmationResult = null;

            // reCAPTCHA verifier 정리
            if (window.recaptchaVerifier) {
                window.recaptchaVerifier.clear();
                delete window.recaptchaVerifier;
            }

            return {
                success: true,
                message: '인증이 완료되었습니다.'
            };
        } catch (error: any) {
            console.error('[PhoneService] 인증 코드 검증 실패:', error);
            
            let errorMessage = '인증 코드가 일치하지 않습니다.';
            
            if (error.code === 'auth/invalid-verification-code') {
                errorMessage = '인증 코드가 올바르지 않습니다. 다시 입력해주세요.';
            } else if (error.code === 'auth/code-expired') {
                errorMessage = '인증 코드가 만료되었습니다. 다시 발송해주세요.';
                sessionStorage.removeItem(storageKey);
                confirmationResult = null;
            }

            return {
                success: false,
                message: errorMessage
            };
        }
    } catch (error: any) {
        console.error('[PhoneService] 인증 코드 검증 실패:', error);
        return {
            success: false,
            message: '인증 코드 검증 중 오류가 발생했습니다.'
        };
    }
};

/**
 * 전화번호 인증 상태 확인
 */
export const isPhoneVerified = (phone: string): boolean => {
    try {
        const normalizedPhone = normalizePhoneNumber(phone);
        const storageKey = `phone_verified_${normalizedPhone}`;
        const storedData = sessionStorage.getItem(storageKey);

        if (!storedData) {
            return false;
        }

        const verificationData = JSON.parse(storedData);
        
        // 만료 확인
        if (Date.now() > verificationData.expiresAt) {
            sessionStorage.removeItem(storageKey);
            return false;
        }

        return verificationData.verified === true;
    } catch {
        return false;
    }
};

/**
 * 전화번호 인증 상태 초기화
 */
export const clearPhoneVerification = (phone: string): void => {
    try {
        const normalizedPhone = normalizePhoneNumber(phone);
        sessionStorage.removeItem(`phone_verification_sent_${normalizedPhone}`);
        sessionStorage.removeItem(`phone_verified_${normalizedPhone}`);
        
        // confirmationResult 초기화
        confirmationResult = null;
        
        // verifier 정리
        if (window.recaptchaVerifier) {
            window.recaptchaVerifier.clear();
            delete window.recaptchaVerifier;
        }
    } catch (error) {
        console.error('[PhoneService] 인증 상태 초기화 실패:', error);
    }
};

/**
 * reCAPTCHA 컨테이너 요소 생성
 */
export const createRecaptchaContainer = (): HTMLElement => {
    let container = document.getElementById('recaptcha-container');
    
    if (!container) {
        container = document.createElement('div');
        container.id = 'recaptcha-container';
        container.style.display = 'none';
        document.body.appendChild(container);
    }
    
    return container;
};
