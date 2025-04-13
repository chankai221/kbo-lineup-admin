'use client';

import { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebaseConfig';

export default function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      onLogin();
    });
    return () => unsubscribe();
  }, [onLogin]);

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setEmail('');
      setPassword('');
    } catch (err) {
      alert('로그인 실패! 이메일 또는 비밀번호를 확인해주세요.');
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    onLogin();
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded shadow max-w-md mx-auto my-6">
      {user ? (
        <div className="text-center">
          <p className="mb-2 text-sm">✅ 로그인됨: <strong>{user.email}</strong></p>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
          >
            로그아웃
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <input
            type="email"
            placeholder="관리자 이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-2 border rounded text-black"
          />
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-2 border rounded text-black"
          />
          <button
            onClick={handleLogin}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            로그인
          </button>
        </div>
      )}
    </div>
  );
}
