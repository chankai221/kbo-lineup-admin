'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebaseConfig';
import {
  collection,
  onSnapshot,
  orderBy,
  query,
} from 'firebase/firestore';

export default function LineupPage() {
  const [lineups, setLineups] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'lineups'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setLineups(data);
    });
    return () => unsubscribe();
  }, []);

  return (
    <main className="min-h-screen bg-white text-black dark:bg-gray-900 dark:text-white p-4 sm:p-8">
      <h1 className="text-2xl font-bold mb-6 text-center">📋 KBO 라인업 조회</h1>

      {lineups.length === 0 && (
        <p className="text-gray-500 text-center">저장된 라인업이 없습니다.</p>
      )}

      {lineups.map((lineup) => (
        <div key={lineup.id} className="border border-gray-300 dark:border-gray-700 p-4 rounded mb-4 max-w-3xl mx-auto">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-sm">📅 {lineup.date} - {lineup.homeTeam} vs {lineup.awayTeam}</span>
          </div>
          <div className="mt-2">
            <div className="font-bold">{lineup.homeTeam}:</div>
            <div className="mb-1">{lineup.home?.map((p: any) => `${p.name}(${p.position})`).join(', ')}</div>
            <div className="font-bold">{lineup.awayTeam}:</div>
            <div>{lineup.away?.map((p: any) => `${p.name}(${p.position})`).join(', ')}</div>
            <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              🧤 선발투수: {lineup.homeTeam} - {lineup.homePitcher}, {lineup.awayTeam} - {lineup.awayPitcher}
            </div>
          </div>
        </div>
      ))}
    </main>
  );
}
