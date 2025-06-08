<<<<<<< HEAD

=======
>>>>>>> 633c2f0 (Updated app)
"use client";

import type { OrderItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, PlusCircle, MinusCircle, XCircle } from 'lucide-react';
import Image from 'next/image';

interface OrderSummaryProps {
  items: OrderItem[];
  totalPrice: number;
  onUpdateQuantity: (itemId: string, newQuantity: number) => void;
  onRemoveItem: (itemId: string) => void;
}

export default function OrderSummary({ items, totalPrice, onUpdateQuantity, onRemoveItem }: OrderSummaryProps) {
  return (
    <Card className="shadow-lg sticky top-8">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-headline text-xl flex items-center">
          <ShoppingCart size={24} className="mr-2 text-primary" />
          Your Order
        </CardTitle>
        {items.length > 0 && <span className="text-sm text-muted-foreground">{items.length} item(s)</span>}
      </CardHeader>
      <CardContent className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
        {items.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">Your cart is empty. Add some items from the menu!</p>
        ) : (
          items.map(item => (
            <div key={item.id} className="flex items-start gap-4 py-2 border-b border-border last:border-b-0">
<<<<<<< HEAD
              {item.imageUrl ? (
                <Image 
                  src={item.imageUrl} 
                  alt={item.name} 
                  width={60} 
                  height={60} 
                  className="rounded-md object-cover" 
                  data-ai-hint={item.dataAiHint || item.category.toLowerCase()} 
                />
              ) : (
                 <div className="w-[60px] h-[60px] bg-muted rounded-md flex items-center justify-center text-xs text-muted-foreground">No Image</div>
=======
              {item.imageUrl && (
                <Image src={item.imageUrl} alt={item.name} width={60} height={60} className="rounded-md object-cover" data-ai-hint={item.dataAiHint || item.category.toLowerCase()} />
>>>>>>> 633c2f0 (Updated app)
              )}
              <div className="flex-grow">
                <h4 className="font-semibold">{item.name}</h4>
                <p className="text-sm text-muted-foreground">${item.price.toFixed(2)} x {item.quantity}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => onUpdateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1}>
                    <MinusCircle size={16} />
                  </Button>
                  <span className="w-6 text-center">{item.quantity}</span>
                  <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}>
                    <PlusCircle size={16} />
                  </Button>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive/70 hover:text-destructive mt-1" onClick={() => onRemoveItem(item.id)}>
                  <XCircle size={18} />
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
      {items.length > 0 && (
        <CardFooter className="flex flex-col gap-2 pt-4">
          <Separator />
          <div className="w-full flex justify-between items-center text-lg font-semibold mt-2">
            <span>Total:</span>
            <span className="text-primary">${totalPrice.toFixed(2)}</span>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
