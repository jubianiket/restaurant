
import type { ReactNode } from 'react';
import Link from 'next/link';
import { UtensilsCrossed } from 'lucide-react';

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-background to-muted/30">
      <header className="py-6 px-4 sm:px-8">
        <Link href="/" className="flex items-center gap-2 text-primary">
          <UtensilsCrossed size={36} />
          <h1 className="text-3xl font-headline font-bold">Foodie Orders</h1>
        </Link>
      </header>
      <main className="flex-grow flex items-center justify-center p-4">
        {children}
      </main>
      <footer className="p-4 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Foodie Orders. All rights reserved.</p>
      </footer>
    </div>
  );
}
