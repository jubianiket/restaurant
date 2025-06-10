import type { ReactNode } from 'react';
import Header from './Header';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow bg-background">
        {children}
      </main>
      <footer className="app-footer bg-card text-card-foreground p-4 text-center text-sm">
        <p>&copy; {new Date().getFullYear()} Foodie Orders. All rights reserved.</p>
      </footer>
    </div>
  );
}
