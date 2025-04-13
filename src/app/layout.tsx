// src/app/layout.tsx
import './globals.css';
import { Inter } from 'next/font/google';
import { ThemeProvider } from 'next-themes'; // 추가
import type { Metadata } from 'next';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '선발은누구',
  description: 'KBO 라인업 확인 서비스',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
