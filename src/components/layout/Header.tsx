
"use client";

import Link from 'next/link';
import { UtensilsCrossed, History, Home, Settings, UserPlus, LogIn, LogOut, UserCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

export default function Header() {
  const { user, logout, isLoading } = useAuth();

  return (
    <header className="bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href={user ? "/create-order" : "/"} className="flex items-center gap-2">
          <UtensilsCrossed size={32} />
          <h1 className="text-2xl font-headline font-bold">Foodie Orders</h1>
        </Link>
        <nav className="flex items-center gap-2 md:gap-3 flex-wrap">
          {isLoading ? (
            <Loader2 size={24} className="animate-spin" />
          ) : user ? (
            <>
              <Link href="/create-order" className="hover:text-accent flex items-center gap-1 text-sm md:text-base">
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
              <div className="flex items-center gap-1 text-sm md:text-base">
                <UserCircle size={20} />
                <span className="hidden sm:inline">{user.email}</span>
              </div>
              <Button onClick={logout} variant="ghost" size="sm" className="hover:bg-primary/80 hover:text-accent text-sm md:text-base px-2 py-1 h-auto">
                <LogOut size={20} className="mr-1 sm:mr-2" />
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link href="/" className="hover:text-accent flex items-center gap-1 text-sm md:text-base">
                <LogIn size={20} />
                Sign In
              </Link>
              <Link href="/signup" className="hover:text-accent flex items-center gap-1 text-sm md:text-base">
                <UserPlus size={20} />
                Sign Up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
