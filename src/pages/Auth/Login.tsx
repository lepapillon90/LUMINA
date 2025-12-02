import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth } from '../../firebase';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getQuery, set } from '../../services/db';
import { where, doc, getDoc, getFirestore } from 'firebase/firestore';
import { useAuth } from '../../contexts';
import { UserRole } from '../../types';

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

  const handleGoogleLogin = async () => {
    setError('');
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user exists in Firestore
      const db = getFirestore();
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        // Create new user if not exists
        await set('users', user.uid, {
          username: user.email?.split('@')[0] || 'user_' + user.uid.slice(0, 5),
          email: user.email,
          displayName: user.displayName || 'User',
          role: 'GUEST',
          grade: 'Bronze',
          totalSpent: 0,
          createdAt: new Date().toISOString(),
          profileImage: user.photoURL
        });
        console.log("Created new user from Google login");
      } else {
        console.log("Existing user logged in with Google");
      }
      // Navigation handled by useEffect
    } catch (err: any) {
      console.error("Google login error:", err);
      setError('Google 로그인 중 오류가 발생했습니다.');
      setIsLoading(false);
    }
  };

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

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">또는</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full bg-white border border-gray-300 text-gray-700 py-3 flex items-center justify-center gap-2 hover:bg-gray-50 transition text-sm font-medium"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Google 계정으로 계속하기
        </button>

        <div className="mt-6 flex justify-between text-xs text-gray-500">
          <Link to="/forgot-password" className="hover:text-primary hover:underline">비밀번호 찾기</Link>
          <Link to="/signup" className="hover:text-primary hover:underline">회원가입</Link>
          <Link to="/order-tracking" className="hover:text-primary hover:underline">비회원 주문 조회</Link>
        </div>
        <div className="mt-8 text-center text-xs text-gray-400 border-t pt-4">
          관리자 데모 계정: admin / admin123
        </div>
      </div>
    </div>
  );
};

export default Login;