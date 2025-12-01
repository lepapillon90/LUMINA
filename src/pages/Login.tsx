import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { getQuery } from '../services/db';
import { where } from 'firebase/firestore';
import { useAuth } from '../contexts';
import { UserRole } from '../types';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirect based on user role when auth state changes
  useEffect(() => {
    if (user) {
      console.log("User detected in Login page:", JSON.stringify(user, null, 2));
      console.log("User Role:", user.role);

      if (user.role === UserRole.ADMIN) {
        console.log("Redirecting to /mypage (Admin)");
        navigate('/mypage');
      } else {
        console.log("Redirecting to /");
        navigate('/');
      }
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!username || !password) {
      setError('아이디와 비밀번호를 모두 입력해주세요.');
      setIsLoading(false);
      return;
    }

    try {
      console.log("Attempting login with username:", username);
      let loginEmail = '';

      // Special case for demo admin
      if (username === 'admin') {
        loginEmail = 'admin@lumina.com';
        console.log("Mapped 'admin' to:", loginEmail);
      } else {
        // Lookup email by username
        const users = await getQuery('users', where('username', '==', username));
        if (users.length === 0) {
          console.log("Username not found in DB");
          setError('존재하지 않는 아이디입니다.');
          setIsLoading(false);
          return;
        }
        loginEmail = (users[0] as any).email;
      }

      console.log("Signing in with email:", loginEmail);
      await signInWithEmailAndPassword(auth, loginEmail, password);
      console.log("Sign in successful - waiting for AuthContext update...");

      // Navigation is now handled by the useEffect hook

    } catch (err: any) {
      console.error("Login error caught:", err);
      console.log("Error code:", err.code);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('아이디 또는 비밀번호가 일치하지 않습니다.');
      } else if (err.code === 'auth/invalid-email') {
        setError('유효하지 않은 이메일 형식입니다.');
      } else {
        setError('로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
      setIsLoading(false); // Only stop loading on error, success will redirect
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white p-8 md:p-12 shadow-md max-w-md w-full">
        <h2 className="text-3xl font-serif text-center mb-8">로그인</h2>
        {error && <div className="mb-4 text-red-500 text-sm text-center">{error}</div>}
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs uppercase text-gray-500 mb-1">아이디</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-black transition placeholder-gray-300 text-sm"
              placeholder="아이디를 입력해주세요"
            />
          </div>
          <div>
            <label className="block text-xs uppercase text-gray-500 mb-1">비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-black transition placeholder-gray-300 text-sm"
              placeholder="비밀번호를 입력해주세요"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-white py-4 uppercase tracking-widest text-sm hover:bg-black transition mt-4 disabled:opacity-50"
          >
            {isLoading ? '로그인 중...' : '로그인'}
          </button>
        </form>
        <div className="mt-6 flex justify-between text-xs text-gray-500">
          <Link to="/forgot-password" className="hover:text-primary hover:underline">비밀번호 찾기</Link>
          <Link to="/signup" className="hover:text-primary hover:underline">회원가입</Link>
        </div>
        <div className="mt-8 text-center text-xs text-gray-400 border-t pt-4">
          관리자 데모 계정: admin / admin123
        </div>
      </div>
    </div>
  );
};

export default Login;