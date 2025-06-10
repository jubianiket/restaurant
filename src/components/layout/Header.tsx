
import Link from 'next/link';
import { UtensilsCrossed, History, Home, Settings } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <UtensilsCrossed size={32} />
          <h1 className="text-2xl font-headline font-bold">Foodie Orders</h1>
        </Link>
        <nav className="flex items-center gap-2 md:gap-4 flex-wrap">
          <Link href="/" className="hover:text-accent flex items-center gap-1 text-sm md:text-base">
            <Home size={20} />
            New Order
          </Link>
          <Link href="/history" className="hover:text-accent flex items-center gap-1 text-sm md:text-base">
            <History size={20} />
            Order History
          </Link>
          <Link href="/admin/menu" className="hover:text-accent flex items-center gap-1">
            <Settings size={20} />
            Manage Menu
          </Link>
        </nav>
      </div>
    </header>
  );
}
