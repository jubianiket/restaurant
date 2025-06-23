import type { ReactNode } from 'react';
import HeaderAsSidebarNav from './Header'; // This is now the sidebar
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <HeaderAsSidebarNav />
      <SidebarInset>
          <header className="app-header sticky top-0 z-10 flex h-14 items-center border-b bg-background px-4 md:hidden">
              <SidebarTrigger />
          </header>
          <main className="flex-grow bg-background">
            {children}
          </main>
          <footer className="app-footer bg-card text-card-foreground p-4 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} Foodie Orders. All rights reserved.</p>
          </footer>
      </SidebarInset>
    </SidebarProvider>
  );
}
