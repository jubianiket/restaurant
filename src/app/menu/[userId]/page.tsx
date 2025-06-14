
"use client";

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import type { MenuItem } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, Utensils, Tag, Info } from 'lucide-react';
import Image from 'next/image';

function PublicMenuLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground font-body antialiased">
      <header className="bg-primary text-primary-foreground py-4 shadow-md">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-headline font-bold flex items-center">
            <Utensils size={28} className="mr-3" /> Restaurant Menu
          </h1>
        </div>
      </header>
      <main className="container mx-auto p-4 md:p-8">
        {children}
      </main>
      <footer className="bg-card text-card-foreground p-4 text-center text-sm mt-8">
        <p>&copy; {new Date().getFullYear()} Foodie Orders. Powered by Foodie Orders.</p>
      </footer>
    </div>
  );
}

export default function PublicUserMenuPage() {
  const params = useParams();
  const userId = params.userId as string;
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [restaurantName, setRestaurantName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      const namePart = userId.split('@')[0];
      const capitalizedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
      setRestaurantName(`${capitalizedName}'s Eatery`);

      const fetchMenu = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const response = await fetch(`/api/menu?userId=${encodeURIComponent(userId)}`);
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Failed to fetch menu (status: ${response.status})`);
          }
          const data: MenuItem[] = await response.json();
          setMenuItems(data);
        } catch (err) {
          console.error("Error fetching public menu:", err);
          setError((err as Error).message);
        } finally {
          setIsLoading(false);
        }
      };
      fetchMenu();
    } else {
      setError("No user specified for the menu.");
      setIsLoading(false);
    }
  }, [userId]);

  const categorizedMenuItems = useMemo(() => {
    if (!menuItems) return {};
    return menuItems.reduce((acc, item) => {
      const category = item.category || 'Other';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    }, {} as Record<string, MenuItem[]>);
  }, [menuItems]);

  if (isLoading) {
    return (
      <PublicMenuLayout>
        <h2 className="text-2xl md:text-3xl font-headline font-semibold mb-6 text-primary">
          <Skeleton className="h-8 w-3/4" />
        </h2>
        <div className="space-y-8">
          {[...Array(2)].map((_, catIndex) => (
            <section key={catIndex}>
              <Skeleton className="h-7 w-1/3 mb-4" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, itemIndex) => (
                  <Card key={itemIndex} className="shadow-md">
                    <Skeleton className="h-40 w-full rounded-t-lg" />
                    <CardHeader>
                      <Skeleton className="h-6 w-3/4 mb-1" />
                      <Skeleton className="h-4 w-1/4" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-4 w-full mb-1" />
                      <Skeleton className="h-4 w-5/6" />
                    </CardContent>
                    <CardFooter className="pt-0">
                      <Skeleton className="h-6 w-1/3" />
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </section>
          ))}
        </div>
      </PublicMenuLayout>
    );
  }

  if (error) {
    return (
      <PublicMenuLayout>
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center">
              <AlertTriangle className="mr-2" /> Error Loading Menu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              This menu may not be available or the link might be incorrect.
            </p>
          </CardContent>
        </Card>
      </PublicMenuLayout>
    );
  }

  if (menuItems.length === 0) {
    return (
      <PublicMenuLayout>
        <h2 className="text-2xl md:text-3xl font-headline font-semibold mb-6 text-primary">
          Menu for {restaurantName || 'this restaurant'}
        </h2>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Info className="mr-2 text-muted-foreground" /> No Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              This restaurant currently has no items on their menu. Please check back later!
            </p>
          </CardContent>
        </Card>
      </PublicMenuLayout>
    );
  }

  return (
    <PublicMenuLayout>
      <h2 className="text-2xl md:text-3xl font-headline font-semibold mb-6 text-primary">
        Menu for {restaurantName || 'this restaurant'}
      </h2>
      <div className="space-y-8">
        {Object.entries(categorizedMenuItems).map(([category, items]) => (
          <section key={category}>
            <h3 className="text-xl font-headline font-semibold mb-4 text-primary/80 border-b-2 border-primary/20 pb-2 flex items-center">
              <Tag size={20} className="mr-2 text-accent" /> {category}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map(item => (
                <Card key={item.id} className="flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-200 rounded-lg overflow-hidden">
                  {item.imageUrl && (
                    <div className="relative w-full h-48">
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        style={{ objectFit: 'cover' }}
                        data-ai-hint={item.dataAiHint || item.category?.toLowerCase() || 'food item'}
                      />
                    </div>
                  )}
                   <CardHeader className={!item.imageUrl ? "pt-6" : "py-4"}>
                    <CardTitle className="font-headline text-lg">{item.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow py-0">
                    {item.description && <p className="text-sm text-muted-foreground mb-2">{item.description}</p>}
                  </CardContent>
                  <CardFooter className="pt-3 pb-4">
                     <p className="text-lg font-semibold text-primary">Rs.{item.price.toFixed(2)}</p>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </section>
        ))}
      </div>
    </PublicMenuLayout>
  );
}
