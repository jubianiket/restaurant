
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    setOrders([...initialMockOrders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  }, []);


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

  const handleUpdateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    // Update mockOrders (initialMockOrders)
    const orderInMock = initialMockOrders.find(o => o.id === orderId);
    if (orderInMock) {
      orderInMock.status = newStatus;
    }

    // Update local state for UI re-render
    setOrders(prevOrders =>
      prevOrders.map(o =>
        o.id === orderId ? { ...o, status: newStatus } : o
      ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    );

    toast({
      title: "Order Status Updated",
      description: `Order ${orderId} status changed to ${newStatus}.`,
    });
  };


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
                  <TableHead className="w-[180px]">Status</TableHead>
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
                    <TableCell className="text-right">Rs.{order.totalCost.toFixed(2)}</TableCell>
                    <TableCell>
                      {order.status === 'cancelled' || order.status === 'delivered' ? (
                        <Badge className={`${getStatusBadgeClass(order.status)} capitalize`}>{order.status}</Badge>
                      ) : (
                        <Select
                          value={order.status}
                          onValueChange={(newStatusValue) => {
                            handleUpdateOrderStatus(order.id, newStatusValue as Order['status']);
                          }}
                        >
                          <SelectTrigger className="w-full min-w-[120px] max-w-[150px] text-xs capitalize h-8">
                            <SelectValue placeholder="Set status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending" className="text-xs">Pending</SelectItem>
                            <SelectItem value="completed" className="text-xs">Completed</SelectItem>
                            {order.status !== 'pending' &&
                             order.status !== 'completed' &&
                             order.status !== 'cancelled' &&
                             order.status !== 'delivered' && (
                              <SelectItem value={order.status} className="text-xs capitalize">{order.status}</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      )}
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
