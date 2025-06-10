
"use client";

import AppLayout from '@/components/layout/AppLayout';
import MenuItemsManager from '@/components/admin/menu/MenuItemsManager';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function AdminMenuPage() {
  const { user, isLoading: authIsLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authIsLoading && !user) {
      router.replace('/'); // Redirect to login
    }
  }, [user, authIsLoading, router]);

  if (authIsLoading || !user) {
    return (
      <div className="flex flex-grow items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto p-4 md:p-8">
        <h1 className="text-3xl md:text-4xl font-headline font-bold text-primary mb-2">
          Menu Administration
        </h1>
        <p className="text-muted-foreground mb-6">
          Manage your restaurant's menu items here. You can add, edit, delete items, or upload an Excel sheet for bulk updates.
        </p>
        <Separator className="mb-8" />
        <MenuItemsManager />
      </div>
    </AppLayout>
  );
}
