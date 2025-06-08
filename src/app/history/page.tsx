"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { mockOrders as initialMockOrders } from '@/lib/mockData'; // Renamed to avoid conflict
import type { Order } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Edit3, History as HistoryIcon } from 'lucide-react';
import { format } from 'date-fns';

export default function OrderHistoryPage() {
  // Use state to reflect updates if orders are added/modified via page.tsx
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    // In a real app, orders would be fetched. Here, we use mockOrders.
    // The mockOrders array can be mutated by page.tsx, so we copy it.
    setOrders([...initialMockOrders]); 
  }, []);


  const getStatusVariant = (status: Order['status']): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'completed':
      case 'delivered':
        return 'default'; // Using primary color for success
      case 'pending':
      case 'confirmed':
      case 'preparing':
      case 'ready':
        return 'secondary'; // Using accent color (yellow)
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
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
        <h1 className="text-3xl md:text-4xl font-headline font-bold text-primary mb-8 flex items-center">
          <HistoryIcon size={36} className="mr-3" /> Order History
        </h1>
        {orders.length === 0 ? (
          <p className="text-muted-foreground text-lg">No past orders found.</p>
        ) : (
          <div className="bg-card p-4 md:p-6 rounded-lg shadow-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{format(new Date(order.createdAt), 'MMM d, yyyy HH:mm')}</TableCell>
                    <TableCell>{order.customerDetails.name} ({order.customerDetails.phone})</TableCell>
                    <TableCell className="capitalize">{order.type}</TableCell>
                    <TableCell className="text-right">${order.totalCost.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeClass(order.status)}>{order.status}</Badge>
                    </TableCell>
                    <TableCell className="text-center space-x-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/orders/${order.id}`}>
                          <Eye size={16} className="mr-1" /> View
                        </Link>
                      </Button>
                      {order.status !== 'completed' && order.status !== 'cancelled' && order.status !== 'delivered' && (
                         <Button asChild variant="ghost" size="sm" className="text-primary hover:bg-primary/10">
                            <Link href={`/?edit=${order.id}`}>
                               <Edit3 size={16} className="mr-1" /> Edit
                            </Link>
                         </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
