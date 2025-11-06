import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'مكتبة التعليم PDF',
  description: 'منصة رفع وتنزيل كتب PDF حسب المراحل الدراسية',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
