import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth } from '../../firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { getQuery, set } from '../../services/db';
import { where } from 'firebase/firestore';
import { useGlobalModal } from '../../contexts/GlobalModalContext';
import { sendWelcomeEmail } from '../../services/emailService';

const Signup: React.FC = () => {
    const navigate = useNavigate();
    const { showAlert } = useGlobalModal();
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: '',
        name: '',
        email: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        // 아이디는 영문 소문자와 숫자만 입력 가능하도록 제한
        if (name === 'username') {
            const sanitizedValue = value.replace(/[^a-z0-9]/g, '');
            setFormData(prev => ({ ...prev, [name]: sanitizedValue }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // Basic validation
        if (!formData.username || !formData.password || !formData.name || !formData.email) {
            setError('모든 필드를 입력해주세요.');
            setIsLoading(false);
            return;
        }

        // Username validation
        if (formData.username.length < 3) {
            setError('아이디는 3자 이상이어야 합니다.');
            setIsLoading(false);
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('유효한 이메일 주소를 입력해주세요.');
            setIsLoading(false);
            return;
        }

        // Password length validation
        if (formData.password.length < 6) {
            setError('비밀번호는 6자 이상이어야 합니다.');
            setIsLoading(false);
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('비밀번호가 일치하지 않습니다.');
            setIsLoading(false);
            return;
        }

        try {
            // Check if username exists
            const existingUsers = await getQuery('users', where('username', '==', formData.username));
            if (existingUsers.length > 0) {
                setError('이미 사용 중인 아이디입니다.');
                setIsLoading(false);
                return;
            }

            // Check if email exists in Firestore
            const existingEmails = await getQuery('users', where('email', '==', formData.email));
            if (existingEmails.length > 0) {
                setError('이미 가입된 이메일입니다.');
                setIsLoading(false);
                return;
            }

            // Create user in Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);

            // Update profile with name
            await updateProfile(userCredential.user, {
                displayName: formData.name
            });

            // Save user data to Firestore
            await set('users', userCredential.user.uid, {
                username: formData.username,
                email: formData.email,
                displayName: formData.name,
                role: 'GUEST',
                grade: 'Bronze',
                totalSpent: 0,
                createdAt: new Date().toISOString()
            });

            // Send Welcome Email (Client-side simulation)
            sendWelcomeEmail(formData.email, formData.name).catch(err => console.error("Failed to send welcome email:", err));

            await showAlert('회원가입이 완료되었습니다! 자동으로 로그인됩니다.', '환영합니다');
            navigate('/');
        } catch (err: any) {
            console.error("Signup error:", err);
            if (err.code === 'auth/email-already-in-use') {
                setError('이미 사용 중인 이메일입니다.');
            } else if (err.code === 'auth/invalid-email') {
                setError('유효하지 않은 이메일 형식입니다.');
            } else if (err.code === 'auth/weak-password') {
                setError('비밀번호가 너무 약합니다.');
            } else {
                setError(`회원가입 오류: ${err.code || err.message}`);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12 pt-32">
            <div className="bg-white p-8 md:p-12 shadow-md max-w-md w-full">
                <h2 className="text-3xl font-serif text-center mb-8">회원가입</h2>
                {error && <div className="mb-4 text-red-500 text-sm text-center">{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs uppercase text-gray-500 mb-1">이름</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            maxLength={20}
                            className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-black transition placeholder-gray-300 text-sm"
                            placeholder="실명을 입력해주세요"
                        />
                    </div>
                    <div>
                        <label className="block text-xs uppercase text-gray-500 mb-1">아이디</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            maxLength={20}
                            className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-black transition placeholder-gray-300 text-sm"
                            placeholder="영문 소문자, 숫자 조합 3~20자"
                        />
                    </div>
                    <div>
                        <label className="block text-xs uppercase text-gray-500 mb-1">이메일</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            maxLength={50}
                            className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-black transition placeholder-gray-300 text-sm"
                            placeholder="example@email.com"
                        />
                    </div>
                    <div>
                        <label className="block text-xs uppercase text-gray-500 mb-1">비밀번호</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            maxLength={20}
                            className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-black transition placeholder-gray-300 text-sm"
                            placeholder="영문, 숫자, 특수문자 포함 6~20자"
                        />
                    </div>
                    <div>
                        <label className="block text-xs uppercase text-gray-500 mb-1">비밀번호 확인</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            maxLength={20}
                            className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-black transition placeholder-gray-300 text-sm"
                            placeholder="비밀번호를 다시 입력해주세요"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-primary text-white py-4 uppercase tracking-widest text-sm hover:bg-black transition mt-4 disabled:opacity-50"
                    >
                        {isLoading ? '가입 처리 중...' : '가입하기'}
                    </button>
                </form>
                <div className="mt-6 text-center text-xs text-gray-400">
                    이미 계정이 있으신가요? <Link to="/login" className="text-primary hover:underline">로그인</Link>
                </div>
            </div>
        </div>
    );
};

export default Signup;
