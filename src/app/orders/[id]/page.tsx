<<<<<<< HEAD

"use client";

import { useEffect, useState } from 'react';
=======
"use client";

import { useEffect, useState } } from 'react';
>>>>>>> 633c2f0 (Updated app)
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';
import { mockOrders } from '@/lib/mockData';
import type { Order, OrderItem } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import PrintBillButton from '@/components/order/PrintBillButton';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit3, ShoppingBag, Truck, Utensils, User, Phone, MapPin, CalendarDays, Tag, FileText } from 'lucide-react';
import Image from 'next/image';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';


export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const id = params.id as string;

  useEffect(() => {
    if (id) {
<<<<<<< HEAD
=======
      // In a real app, fetch order by ID from a backend
>>>>>>> 633c2f0 (Updated app)
      const foundOrder = mockOrders.find(o => o.id === id);
      setOrder(foundOrder || null);
    }
  }, [id]);

  if (!order) {
    return (
      <AppLayout>
        <div className="container mx-auto p-8 text-center">
          <h1 className="text-2xl font-bold">Order Not Found</h1>
          <p className="text-muted-foreground">The requested order could not be located.</p>
          <Button asChild className="mt-4">
            <Link href="/history">
              <ArrowLeft size={18} className="mr-2" />
              Back to Order History
            </Link>
          </Button>
        </div>
      </AppLayout>
    );
  }

  const OrderTypeIcon = ({ type }: { type: Order['type'] }) => {
    if (type === 'delivery') return <Truck className="mr-2 h-5 w-5 text-primary" />;
    if (type === 'dine-in') return <Utensils className="mr-2 h-5 w-5 text-primary" />;
    if (type === 'take-away') return <ShoppingBag className="mr-2 h-5 w-5 text-primary" />;
    return null;
  };
  
  const getStatusBadgeClass = (status: Order['status']): string => {
    switch (status) {
      case 'completed':
      case 'delivered':
        return 'bg-green-500 text-white';
      case 'pending':
      case 'confirmed':
        return 'bg-yellow-500 text-black';
      case 'preparing':
      case 'ready':
        return 'bg-blue-500 text-white';
      case 'cancelled':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  }

  return (
    <AppLayout>
      <div className="container mx-auto p-4 md:p-8">
        <Button onClick={() => router.back()} variant="outline" className="mb-6">
          <ArrowLeft size={18} className="mr-2" />
          Back
        </Button>

        <Card className="shadow-xl">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-3xl font-headline text-primary flex items-center">
                   <FileText size={30} className="mr-3" /> Order Details: {order.id}
                </CardTitle>
                <CardDescription className="text-base">
                  Placed on: {format(new Date(order.createdAt), 'MMMM d, yyyy HH:mm')}
                </CardDescription>
              </div>
              <Badge className={`text-sm px-3 py-1 ${getStatusBadgeClass(order.status)}`}>{order.status}</Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <Separator />
            <div className="grid md:grid-cols-2 gap-6">
              <section>
                <h3 className="text-xl font-semibold mb-3 flex items-center"><User className="mr-2 h-5 w-5 text-primary" />Customer Information</h3>
                <p className="flex items-center"><strong className="w-24">Name:</strong> {order.customerDetails.name}</p>
                <p className="flex items-center"><Phone className="mr-2 h-4 w-4 text-muted-foreground" /> <strong className="w-20">Phone:</strong> {order.customerDetails.phone}</p>
                {order.type === 'delivery' && order.customerDetails.address && (
                  <p className="flex items-start"><MapPin className="mr-2 h-4 w-4 text-muted-foreground mt-1" /> <strong className="w-20">Address:</strong> {order.customerDetails.address}</p>
                )}
              </section>
              <section>
                <h3 className="text-xl font-semibold mb-3 flex items-center"><Tag className="mr-2 h-5 w-5 text-primary" />Order Type</h3>
                <p className="flex items-center text-lg capitalize"><OrderTypeIcon type={order.type} /> {order.type}</p>
              </section>
            </div>
            
            <Separator />

            <section>
              <h3 className="text-xl font-semibold mb-3 flex items-center"><ShoppingBag className="mr-2 h-5 w-5 text-primary" />Ordered Items</h3>
              <div className="space-y-3">
                {order.items.map((item: OrderItem) => (
                  <div key={item.id} className="flex items-center gap-4 p-3 bg-background/50 rounded-md border">
<<<<<<< HEAD
                    {item.imageUrl ? (
                      <Image 
                        src={item.imageUrl} 
                        alt={item.name} 
                        width={60} 
                        height={60} 
                        className="rounded object-cover" 
                        data-ai-hint={item.dataAiHint || item.category.toLowerCase()} 
                      />
                    ) : (
                      <div className="w-[60px] h-[60px] bg-muted rounded-md flex items-center justify-center text-xs text-muted-foreground">No Image</div>
=======
                    {item.imageUrl && (
                      <Image src={item.imageUrl} alt={item.name} width={60} height={60} className="rounded object-cover" data-ai-hint={item.dataAiHint || item.category.toLowerCase()} />
>>>>>>> 633c2f0 (Updated app)
                    )}
                    <div className="flex-grow">
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                    </div>
                    <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </section>

            <Separator />
            
            <div className="text-right">
              <p className="text-2xl font-bold">Total: <span className="text-primary">${order.totalCost.toFixed(2)}</span></p>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col md:flex-row justify-end gap-3 pt-6 border-t">
<<<<<<< HEAD
            <PrintBillButton orderId={order.id} data-testid="print-bill-button" />
=======
            <PrintBillButton orderId={order.id} />
>>>>>>> 633c2f0 (Updated app)
            {order.status !== 'completed' && order.status !== 'cancelled' && order.status !== 'delivered' && (
              <Button asChild variant="default">
                <Link href={`/?edit=${order.id}`}>
                  <Edit3 size={18} className="mr-2" />
                  Edit Order
                </Link>
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </AppLayout>
  );
}
