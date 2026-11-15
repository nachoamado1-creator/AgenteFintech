import type { Metadata, Viewport } from 'next';
import { Bricolage_Grotesque, Martian_Mono } from 'next/font/google';
import Cursor from '@/components/Cursor';
import './globals.css';

const display = Bricolage_Grotesque({ variable: '--font-display', subsets: ['latin'], display: 'swap' });
const mono = Martian_Mono({ variable: '--font-mono', subsets: ['latin'], display: 'swap' });

export const metadata: Metadata = {
  title: 'Finn',
  description: 'Pagos y billeteras en Argentina: qué pasa hoy, qué puede venir y dónde están las brechas.',
};

export const viewport: Viewport = { themeColor: '#06060C', colorScheme: 'dark' };

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="es" className={`${display.variable} ${mono.variable}`}>
      <body>
        {children}
        <Cursor />
      </body>
    </html>
  );
}
