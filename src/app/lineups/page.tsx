'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { db, auth } from '@/lib/firebaseConfig';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import AdminLogin from '@/components/AdminLogin';
import toast, { Toaster } from 'react-hot-toast';

const teams = ['LG', 'KT', 'SSG', 'NC', '롯데', 'KIA', '삼성', '두산', '한화', '키움'];
const ADMIN_EMAIL = 'admin@kbo.com'; // ✨ 1번: 관리자 이메일 설정

export default function LineupsPage() {
  const [lineups, setLineups] = useState<any[]>([]);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [mounted, setMounted] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAdmin(user?.email === ADMIN_EMAIL); // ✅ 관리자 이메일 일치 확인
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'lineups'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setLineups(data);
    });
    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string) => {
    const confirmDelete = confirm('정말 삭제하시겠습니까?');
    if (!confirmDelete) return;
    try {
      await deleteDoc(doc(db, 'lineups', id));
      toast.success('라인업이 삭제되었습니다.');
    } catch (err) {
      toast.error('삭제 실패');
    }
  };

  const filteredLineups = selectedTeam
    ? lineups.filter(
        (lineup) => lineup.homeTeam === selectedTeam || lineup.awayTeam === selectedTeam
      )
    : lineups;

  return (
    <main className="min-h-screen bg-gray-100 text-black dark:bg-gray-900 dark:text-white p-8">
      <Toaster position="top-center" />

      <div className="flex justify-between items-center flex-wrap gap-4 mb-6">
        <h1 className="text-3xl font-bold">📋 KBO 라인업 조회</h1>
        {mounted && (
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="border px-4 py-2 rounded text-sm hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            {theme === 'light' ? '다크 모드' : '라이트 모드'}
          </button>
        )}
      </div>

      <AdminLogin onLogin={() => {}} />

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
        <select
          value={selectedTeam}
          onChange={(e) => setSelectedTeam(e.target.value)}
          className="border px-3 py-2 rounded text-black"
        >
          <option value="">전체 보기</option>
          {teams.map((team) => (
            <option key={team} value={team}>{team}</option>
          ))}
        </select>
        <button
          onClick={() => setSelectedTeam('')}
          className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
        >
          초기화
        </button>
      </div>

      {filteredLineups.length === 0 ? (
        <p className="text-center text-gray-500">📭 저장된 라인업이 없습니다.</p>
      ) : (
        <div className="grid gap-6 max-w-3xl mx-auto">
          {filteredLineups.map((lineup) => (
            <div
              key={lineup.id}
              className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded p-4 shadow-sm"
            >
              <div className="flex justify-between items-center mb-2">
                <div className="text-lg font-semibold">
                  📅 {lineup.date} - {lineup.homeTeam} vs {lineup.awayTeam}
                </div>
                {isAdmin && (
                  <button
                    onClick={() => handleDelete(lineup.id)}
                    className="text-red-500 hover:underline text-sm"
                  >
                    삭제
                  </button>
                )}
              </div>
              <div className="mb-1">
                <strong>🏠 {lineup.homeTeam}:</strong>{' '}
                <span className="text-gray-800">
                  {lineup.home?.map((p: any) => `${p.name}(${p.position})`).join(', ')}
                </span>
              </div>
              <div>
                <strong>🛫 {lineup.awayTeam}:</strong>{' '}
                <span className="text-gray-800">
                  {lineup.away?.map((p: any) => `${p.name}(${p.position})`).join(', ')}
                </span>
              </div>
              <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                🧤 선발투수: {lineup.homeTeam} - {lineup.homePitcher}, {lineup.awayTeam} - {lineup.awayPitcher}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
