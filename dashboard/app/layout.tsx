import type { Metadata, Viewport } from 'next';
import { Inter, Fraunces, JetBrains_Mono } from 'next/font/google';
import Cursor from '@/components/Cursor';
import './globals.css';

const inter = Inter({ variable: '--font-inter', subsets: ['latin'], display: 'swap' });
const fraunces = Fraunces({ variable: '--font-serif', subsets: ['latin'], style: ['italic'], display: 'swap' });
const mono = JetBrains_Mono({ variable: '--font-mono', subsets: ['latin'], display: 'swap' });

export const metadata: Metadata = {
  title: 'Radar Fintech',
  description: 'Pagos y billeteras en Argentina: qué pasa hoy, qué puede venir y dónde están las brechas.',
};

export const viewport: Viewport = { themeColor: '#09090B', colorScheme: 'dark' };

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="es" className={`${inter.variable} ${fraunces.variable} ${mono.variable}`}>
      <body>
        {children}
        <Cursor />
      </body>
    </html>
  );
}
