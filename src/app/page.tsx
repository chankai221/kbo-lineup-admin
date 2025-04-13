'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { db, auth } from '@/lib/firebaseConfig';
import {
  addDoc,
  collection,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import toast, { Toaster } from 'react-hot-toast';
import AdminLogin from '@/components/AdminLogin';

const positions = ['P', 'C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF', 'DH'];
const teams = ['LG', 'KT', 'SSG', 'NC', '롯데', 'KIA', '삼성', '두산', '한화', '키움'];
const ADMIN_EMAIL = 'admin@kbo.com';

export default function Home() {
  const [homeLineup, setHomeLineup] = useState(Array(9).fill({ name: '', position: '' }));
  const [awayLineup, setAwayLineup] = useState(Array(9).fill({ name: '', position: '' }));
  const [homePitcher, setHomePitcher] = useState('');
  const [awayPitcher, setAwayPitcher] = useState('');
  const [lineups, setLineups] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState<string>('');
  const [homeTeam, setHomeTeam] = useState('');
  const [awayTeam, setAwayTeam] = useState('');
  const [mounted, setMounted] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAdmin(user?.email === ADMIN_EMAIL);
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

  const handleChange = (index: number, value: string, isHome: boolean, key: 'name' | 'position') => {
    const lineup = isHome ? [...homeLineup] : [...awayLineup];
    lineup[index] = { ...lineup[index], [key]: value };
    isHome ? setHomeLineup(lineup) : setAwayLineup(lineup);
  };

  const handleSubmit = async () => {
    if (!date.trim() || !homeTeam || !awayTeam) return toast.error('필수 정보를 입력해주세요.');
    setLoading(true);
    try {
      await addDoc(collection(db, 'lineups'), {
        home: homeLineup,
        away: awayLineup,
        homePitcher,
        awayPitcher,
        date,
        homeTeam,
        awayTeam,
        createdAt: serverTimestamp(),
      });
      toast.success('라인업이 저장되었습니다.');
    } catch (err) {
      toast.error('저장 실패');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    await deleteDoc(doc(db, 'lineups', id));
    toast.success('삭제 완료');
  };

  return (
    <main className="min-h-screen bg-white text-black dark:bg-gray-900 dark:text-white p-4 sm:p-8">
      <Toaster position="top-center" />

      <div className="flex justify-between items-center flex-wrap gap-2 mb-6">
        <h1 className="text-2xl font-bold">⚾ 선발은누구 - 라인업 입력</h1>
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

      {isAdmin && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="text-black px-3 py-2 rounded"
            />
            <div className="flex gap-2">
              <select
                value={homeTeam}
                onChange={(e) => setHomeTeam(e.target.value)}
                className="text-black px-3 py-2 rounded w-full"
              >
                <option value="">홈팀 선택</option>
                {teams.map((team) => (
                  <option key={team} value={team}>{team}</option>
                ))}
              </select>
              <select
                value={awayTeam}
                onChange={(e) => setAwayTeam(e.target.value)}
                className="text-black px-3 py-2 rounded w-full"
              >
                <option value="">원정팀 선택</option>
                {teams.map((team) => (
                  <option key={team} value={team}>{team}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-semibold mb-2">🏠 홈팀 라인업</h2>
              {homeLineup.map((player, idx) => (
                <div key={idx} className="flex gap-2 mb-2">
                  <input
                    value={player.name}
                    onChange={(e) => handleChange(idx, e.target.value, true, 'name')}
                    placeholder={`타자 ${idx + 1} 이름`}
                    className="flex-1 p-2 text-black rounded"
                  />
                  <select
                    value={player.position}
                    onChange={(e) => handleChange(idx, e.target.value, true, 'position')}
                    className="p-2 text-black rounded"
                  >
                    <option value="">포지션</option>
                    {positions.map((pos) => (
                      <option key={pos} value={pos}>{pos}</option>
                    ))}
                  </select>
                </div>
              ))}
              <input
                value={homePitcher}
                onChange={(e) => setHomePitcher(e.target.value)}
                placeholder="선발 투수"
                className="w-full p-2 text-black rounded mt-2"
              />
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2">🛫 원정팀 라인업</h2>
              {awayLineup.map((player, idx) => (
                <div key={idx} className="flex gap-2 mb-2">
                  <input
                    value={player.name}
                    onChange={(e) => handleChange(idx, e.target.value, false, 'name')}
                    placeholder={`타자 ${idx + 1} 이름`}
                    className="flex-1 p-2 text-black rounded"
                  />
                  <select
                    value={player.position}
                    onChange={(e) => handleChange(idx, e.target.value, false, 'position')}
                    className="p-2 text-black rounded"
                  >
                    <option value="">포지션</option>
                    {positions.map((pos) => (
                      <option key={pos} value={pos}>{pos}</option>
                    ))}
                  </select>
                </div>
              ))}
              <input
                value={awayPitcher}
                onChange={(e) => setAwayPitcher(e.target.value)}
                placeholder="선발 투수"
                className="w-full p-2 text-black rounded mt-2"
              />
            </div>
          </div>

          <div className="text-center mt-6">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-blue-600 px-6 py-2 rounded text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? '저장 중...' : '라인업 저장하기'}
            </button>
          </div>
        </>
      )}

      <div className="mt-10 max-w-5xl mx-auto">
        <h2 className="text-xl font-bold mb-4">📋 저장된 라인업 목록</h2>
        {lineups.length === 0 && <p className="text-gray-400">저장된 라인업이 없습니다.</p>}
        {lineups.map((lineup) => (
          <div key={lineup.id} className="border border-gray-300 dark:border-gray-700 p-4 rounded mb-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold">📅 {lineup.date} - {lineup.homeTeam} vs {lineup.awayTeam}</span>
              {isAdmin && (
                <button
                  onClick={() => handleDelete(lineup.id)}
                  className="text-red-400 hover:underline text-sm"
                >
                  삭제
                </button>
              )}
            </div>
            <div className="mt-2">
              <strong>{lineup.homeTeam}:</strong>{' '}
              {lineup.home?.map((p: any) => `${p.name}(${p.position})`).join(', ')}
            </div>
            <div>
              <strong>{lineup.awayTeam}:</strong>{' '}
              {lineup.away?.map((p: any) => `${p.name}(${p.position})`).join(', ')}
            </div>
            <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              🧤 선발투수: {lineup.homeTeam} - {lineup.homePitcher}, {lineup.awayTeam} - {lineup.awayPitcher}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
