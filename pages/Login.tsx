import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(username, password);
    if (success) {
      if (username === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } else {
      setError('아이디 또는 비밀번호가 일치하지 않습니다.');
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
              className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-black transition"
            />
          </div>
          <div>
            <label className="block text-xs uppercase text-gray-500 mb-1">비밀번호</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-black transition"
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-primary text-white py-4 uppercase tracking-widest text-sm hover:bg-black transition mt-4"
          >
            로그인
          </button>
        </form>
        <div className="mt-6 text-center text-xs text-gray-400">
          관리자 데모 계정: admin / admin
        </div>
      </div>
    </div>
  );
};

export default Login;