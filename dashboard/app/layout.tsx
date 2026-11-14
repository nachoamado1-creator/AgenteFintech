import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import Cursor from '@/components/Cursor';
import './globals.css';

const inter = Inter({ variable: '--font-inter', subsets: ['latin'], display: 'swap' });

export const metadata: Metadata = {
  title: 'Radar Fintech',
  description: 'Pagos y billeteras en Argentina: qué pasa hoy, qué puede venir y dónde están las brechas.',
};

export const viewport: Viewport = { themeColor: '#09090B', colorScheme: 'dark' };

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="es" className={inter.variable}>
      <body>
        {children}
        <Cursor />
      </body>
    </html>
  );
}
