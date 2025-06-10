
"use client";

import Link from 'next/link';
import { UtensilsCrossed, History, Home, Settings, UserPlus } from 'lucide-react';

export default function Header() {
  const { user, logout, isLoading } = useAuth();

  return (
    <header className="bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href={user ? "/create-order" : "/"} className="flex items-center gap-2">
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
          <Link href="/admin/menu" className="hover:text-accent flex items-center gap-1 text-sm md:text-base">
            <Settings size={20} />
            Manage Menu
          </Link>
          <Link href="/signup" className="hover:text-accent flex items-center gap-1 text-sm md:text-base">
            <UserPlus size={20} />
            Sign Up
          </Link>
        </nav>
      </div>
    </header>
  );
}
