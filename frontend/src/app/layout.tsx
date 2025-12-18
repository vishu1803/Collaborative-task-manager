import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { TaskProvider } from '@/contexts/TaskContext';
import { SWRProvider } from '@/contexts/SWRProvider';
import { SocketProvider } from '@/contexts/SocketContext';
import { ToastContainer } from '@/components/notifications/ToastContainer';
import { Analytics } from '@vercel/analytics/next';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Task Manager - Collaborative Task Management',
  description: 'A modern, collaborative task management application built with Next.js and TypeScript.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SWRProvider>
          <AuthProvider>
            <SocketProvider>
              <TaskProvider>
                {children}
                <Analytics />
                <ToastContainer />
              </TaskProvider>
            </SocketProvider>
          </AuthProvider>
        </SWRProvider>
      </body>
    </html>
  );
}
