import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../firebase';

const ForgotPassword: React.FC = () => {
    const [email, setEmail] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // 이메일 유효성 검증 함수
    const validateEmail = (emailValue: string): string | null => {
        const trimmedEmail = emailValue.trim();
        
        if (!trimmedEmail) {
            return '이메일을 입력해주세요.';
        }

        if (trimmedEmail.length > 254) {
            return '이메일은 254자 이하여야 합니다.';
        }

        // 이메일 형식 검증 (더 상세한 정규식)
        const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        if (!emailRegex.test(trimmedEmail)) {
            return '유효한 이메일 주소 형식으로 입력해주세요.';
        }

        // 도메인 부분 검증
        const parts = trimmedEmail.split('@');
        if (parts.length !== 2) {
            return '유효한 이메일 주소 형식으로 입력해주세요.';
        }

        const domain = parts[1];
        if (!domain || domain.length > 253) {
            return '유효한 이메일 주소 형식으로 입력해주세요.';
        }

        return null;
    };

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        // 최대 길이 제한
        if (value.length <= 254) {
            setEmail(value);
        }
        // 에러가 있으면 입력 시 제거
        if (error) {
            setError('');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        const trimmedEmail = email.trim();
        setEmail(trimmedEmail);

        // 유효성 검증
        const validationError = validateEmail(trimmedEmail);
        if (validationError) {
            setError(validationError);
            return;
        }

        try {
            setIsLoading(true);
            
            // 비밀번호 재설정 이메일 발송 (리다이렉트 URL 설정)
            const actionCodeSettings = {
                url: `${window.location.origin}/login`,
                handleCodeInApp: false, // 이메일 링크를 앱에서 직접 처리하지 않고 브라우저에서 열기
            };
            
            await sendPasswordResetEmail(auth, trimmedEmail, actionCodeSettings);
            setIsSubmitted(true);
        } catch (err: any) {
            console.error("[MY_LOG] Password reset error:", err);
            
            // Firebase 에러 코드별 처리
            if (err.code === 'auth/user-not-found') {
                setError('등록되지 않은 이메일 주소입니다.');
            } else if (err.code === 'auth/invalid-email') {
                setError('유효하지 않은 이메일 형식입니다.');
            } else if (err.code === 'auth/too-many-requests') {
                setError('너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.');
            } else if (err.code === 'auth/network-request-failed') {
                setError('네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.');
            } else {
                setError('이메일 전송 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="bg-white p-8 md:p-12 shadow-md max-w-md w-full">
                <h2 className="text-3xl font-serif text-center mb-8">비밀번호 찾기</h2>

                {isSubmitted ? (
                    <div className="text-center">
                        <div className="mb-6 text-green-600">
                            <p className="font-medium">이메일이 전송되었습니다.</p>
                            <p className="text-sm mt-2 text-gray-600">입력하신 이메일 주소로 비밀번호 재설정 링크를 보냈습니다.</p>
                        </div>
                        <Link to="/login" className="block w-full bg-primary text-white py-4 uppercase tracking-widest text-sm hover:bg-black transition text-center">
                            로그인으로 돌아가기
                        </Link>
                    </div>
                ) : (
                    <>
                        <p className="text-sm text-gray-500 mb-6 text-center">
                            가입 시 등록한 이메일 주소를 입력하시면<br />비밀번호 재설정 링크를 보내드립니다.
                        </p>
                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm text-center">
                                {error}
                            </div>
                        )}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-xs uppercase text-gray-500 mb-1">이메일</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={handleEmailChange}
                                    placeholder="이메일 주소를 입력해주세요"
                                    maxLength={254}
                                    className={`w-full border-b py-2 focus:outline-none focus:border-black transition placeholder-gray-300 text-sm ${
                                        error ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    disabled={isLoading}
                                    required
                                />
                                {email.length > 0 && (
                                    <p className="mt-1 text-xs text-gray-400">{email.length}/254</p>
                                )}
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading || !email.trim()}
                                className="w-full bg-primary text-white py-4 uppercase tracking-widest text-sm hover:bg-black transition mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? '전송 중...' : '링크 보내기'}
                            </button>
                        </form>
                        <div className="mt-6 text-center text-xs text-gray-400">
                            <Link to="/login" className="text-primary hover:underline">로그인으로 돌아가기</Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;
