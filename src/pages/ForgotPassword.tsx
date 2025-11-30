import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';

const ForgotPassword: React.FC = () => {
    const [email, setEmail] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!email) {
            setError('이메일을 입력해주세요.');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('유효한 이메일 주소를 입력해주세요.');
            return;
        }

        try {
            await sendPasswordResetEmail(auth, email);
            setIsSubmitted(true);
        } catch (err: any) {
            console.error("Password reset error:", err);
            if (err.code === 'auth/user-not-found') {
                setError('등록되지 않은 이메일 주소입니다.');
            } else if (err.code === 'auth/invalid-email') {
                setError('유효하지 않은 이메일 형식입니다.');
            } else {
                setError('이메일 전송 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
            }
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
                        {error && <div className="mb-4 text-red-500 text-sm text-center">{error}</div>}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-xs uppercase text-gray-500 mb-1">이메일</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-black transition"
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-primary text-white py-4 uppercase tracking-widest text-sm hover:bg-black transition mt-4"
                            >
                                링크 보내기
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
