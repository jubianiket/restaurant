
import type { MenuItem } from '@/types';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle } from 'lucide-react';

interface MenuItemCardProps {
  item: MenuItem;
  onAddToOrder: (item: MenuItem) => void;
}

export default function MenuItemCard({ item, onAddToOrder }: MenuItemCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 h-full">
      {item.imageUrl ? (
        <div className="relative w-full h-48">
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill // Changed from layout="fill" objectFit="cover" for Next 13+
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" // Example sizes, adjust as needed
            style={{ objectFit: 'cover' }} // Replaces objectFit prop
            data-ai-hint={item.dataAiHint || item.category.toLowerCase()}
          />
        </div>
      ) : (
        <div className="relative w-full h-48 bg-muted flex items-center justify-center">
          <p className="text-sm text-muted-foreground">No image</p>
        </div>
      )}
      <CardHeader>
        <CardTitle className="font-headline text-xl">{item.name}</CardTitle>
        <CardDescription className="text-muted-foreground text-sm">{item.category}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm">{item.description}</p>
      </CardContent>
      <CardFooter className="flex justify-between items-center pt-4">
        <p className="text-lg font-semibold text-primary">${item.price.toFixed(2)}</p>
        <Button onClick={() => onAddToOrder(item)} size="sm" variant="outline" className="border-primary text-primary hover:bg-primary/10">
          <PlusCircle size={18} className="mr-2" />
          Add
        </Button>
      </CardFooter>
    </Card>
  );
}
