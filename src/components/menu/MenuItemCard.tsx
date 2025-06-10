<<<<<<< HEAD
<<<<<<< HEAD

=======
>>>>>>> 633c2f0 (Updated app)
=======

>>>>>>> b395a2a (I see this error with the app, reported by NextJS, please fix it. The er)
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
        <div className="relative w-full h-36 bg-muted flex items-center justify-center"> {/* Reduced height */}
          <p className="text-xs text-muted-foreground">No image</p> {/* Adjusted text size */}
        </div>
>>>>>>> b395a2a (I see this error with the app, reported by NextJS, please fix it. The er)
      )}
      <CardHeader className="p-3"> {/* Reduced padding */}
        <CardTitle className="font-headline text-base leading-tight">{item.name}</CardTitle> {/* Reduced font size, adjusted leading */}
        <CardDescription className="text-muted-foreground text-xs">{item.category}</CardDescription> {/* Reduced font size */}
      </CardHeader>
      <CardContent className="p-3 pt-0 flex-grow"> {/* Reduced padding */}
        <p className="text-xs text-muted-foreground line-clamp-3">{item.description}</p> {/* Reduced font size, added line-clamp */}
      </CardContent>
      <CardFooter className="p-3 pt-2 flex justify-between items-center"> {/* Reduced padding */}
        <p className="text-md font-semibold text-primary">Rs.{item.price.toFixed(2)}</p> {/* Reduced font size */}
        <Button onClick={() => onAddToOrder(item)} size="sm" variant="outline" className="border-primary text-primary hover:bg-primary/10 text-xs px-2 py-1 h-auto"> {/* Made button smaller */}
          <PlusCircle size={14} className="mr-1" /> {/* Adjusted icon size */}
          Add
        </Button>
      </CardFooter>
    </Card>
  );
}
