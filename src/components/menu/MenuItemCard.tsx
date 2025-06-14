
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
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            style={{ objectFit: 'cover' }}
            data-ai-hint={item.dataAiHint || item.category?.toLowerCase() || 'food item'}
          />
        </div>
      ) : (
        <div className="relative w-full h-36 bg-muted flex items-center justify-center">
          <p className="text-xs text-muted-foreground">No image</p>
        </div>
      )}
      <CardHeader className="p-3">
        <CardTitle className="font-headline text-base leading-tight">{item.name}</CardTitle>
        <CardDescription className="text-muted-foreground text-xs">{item.category}</CardDescription>
      </CardHeader>
      <CardContent className="p-3 pt-0 flex-grow">
        <p className="text-xs text-muted-foreground line-clamp-3">{item.description}</p>
      </CardContent>
      <CardFooter className="p-3 pt-2 flex justify-between items-center">
        <p className="text-md font-semibold text-primary">Rs.{item.price.toFixed(2)}</p>
        <Button onClick={() => onAddToOrder(item)} size="sm" variant="outline" className="border-primary text-primary hover:bg-primary/10 text-xs px-2 py-1 h-auto">
          <PlusCircle size={14} className="mr-1" />
          Add
        </Button>
      </CardFooter>
    </Card>
  );
}
