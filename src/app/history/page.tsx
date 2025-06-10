
"use client";

import Link from 'next/link';
import { useEffect, useState, useMemo } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { mockOrders as initialMockOrders } from '@/lib/mockData';
import type { Order } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Edit3, History as HistoryIcon, Loader2, Download } from 'lucide-react';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import * as xlsx from 'xlsx';

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const { toast } = useToast();
  const { user, isLoading: authIsLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authIsLoading && !user) {
      router.replace('/');
    }
  }, [user, authIsLoading, router]);

  useEffect(() => {
    if (user) {
        // Filter orders for the current user and sort them
        const userOrders = initialMockOrders
            .filter(o => o.userId === user.email)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setOrders(userOrders);
    }
  }, [user]);


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
    // Update in the global mockOrders array
    const orderInMock = initialMockOrders.find(o => o.id === orderId && o.userId === user?.email);
    if (orderInMock) {
      orderInMock.status = newStatus;
    }

    // Update local state for UI re-render, maintaining user filter and sort
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

  const handleDownloadUserOrders = () => {
    if (!orders || orders.length === 0) {
      toast({ title: "No Orders", description: "There are no orders in your history to download.", variant: "destructive" });
      return;
    }

    // orders state is already filtered for the current user
    const dataForExcel = orders.map(order => ({
      "Order ID": order.id,
      "Date": format(new Date(order.createdAt), 'yyyy-MM-dd HH:mm'),
      "Customer Name": order.customerDetails.name,
      "Customer Phone": order.customerDetails.phone,
      "Customer Address": order.customerDetails.address || "N/A",
      "Order Type": order.type,
      "Status": order.status,
      "Total Cost (Rs.)": order.totalCost.toFixed(2),
      "Items": order.items.map(item => `${item.name} (Qty: ${item.quantity}, Price: ${item.price.toFixed(2)})`).join(' | ')
    }));

    const worksheet = xlsx.utils.json_to_sheet(dataForExcel);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "MyOrders");

    const columnWidths = Object.keys(dataForExcel[0] || {}).map(key => {
        let maxWidth = key.length;
        dataForExcel.forEach(row => {
            const cellValue = String((row as any)[key] || "");
            maxWidth = Math.max(maxWidth, cellValue.length);
        });
        return { wch: Math.min(maxWidth + 2, 50) };
    });
    worksheet['!cols'] = columnWidths;

    xlsx.writeFile(workbook, `Foodie_My_Orders_${user?.email?.split('@')[0]}_${format(new Date(), 'yyyyMMdd_HHmm')}.xlsx`);
  };


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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <h1 className="text-3xl md:text-4xl font-headline font-bold text-primary flex items-center">
            <HistoryIcon size={36} className="mr-3" /> My Order History
            </h1>
            {orders.length > 0 && (
                <Button onClick={handleDownloadUserOrders} variant="outline" className="mt-4 sm:mt-0">
                    <Download size={18} className="mr-2" />
                    Download My Orders
                </Button>
            )}
        </div>
        {orders.length === 0 && !authIsLoading ? (
          <p className="text-muted-foreground text-lg">You have no past orders.</p>
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
                          disabled={!user || order.userId !== user.email} // Disable if not user's order (extra check)
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
                             order.status !== 'delivered' && ( // Show current status if it's one of the "in-between" states
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
                            <Link href={`/create-order?edit=${order.id}`}>
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
