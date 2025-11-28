import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Signup: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: '',
        name: '',
        email: ''
    });
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Basic validation
        if (!formData.username || !formData.password || !formData.name || !formData.email) {
            setError('모든 필드를 입력해주세요.');
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('유효한 이메일 주소를 입력해주세요.');
            return;
        }

        // Password length validation
        if (formData.password.length < 6) {
            setError('비밀번호는 6자 이상이어야 합니다.');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('비밀번호가 일치하지 않습니다.');
            return;
        }

        // Mock signup success
        alert('회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.');
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
            <div className="bg-white p-8 md:p-12 shadow-md max-w-md w-full">
                <h2 className="text-3xl font-serif text-center mb-8">회원가입</h2>
                {error && <div className="mb-4 text-red-500 text-sm text-center">{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs uppercase text-gray-500 mb-1">아이디</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-black transition"
                        />
                    </div>
                    <div>
                        <label className="block text-xs uppercase text-gray-500 mb-1">이름</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-black transition"
                        />
                    </div>
                    <div>
                        <label className="block text-xs uppercase text-gray-500 mb-1">이메일</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-black transition"
                        />
                    </div>
                    <div>
                        <label className="block text-xs uppercase text-gray-500 mb-1">비밀번호</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-black transition"
                        />
                    </div>
                    <div>
                        <label className="block text-xs uppercase text-gray-500 mb-1">비밀번호 확인</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-black transition"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-primary text-white py-4 uppercase tracking-widest text-sm hover:bg-black transition mt-4"
                    >
                        가입하기
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
