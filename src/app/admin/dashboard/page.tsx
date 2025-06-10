
"use client";

import { useEffect, useMemo } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Loader2, DollarSign, ShoppingCart, PieChart, ListChecks, Download } from 'lucide-react';
import { mockOrders } from '@/lib/mockData'; 
import type { Order } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Pie, PieChart as RechartsPieChart, Cell } from "recharts";
import { Separator } from '@/components/ui/separator';
import * as xlsx from 'xlsx';
import { format } from 'date-fns';
import { useToast } from "@/hooks/use-toast";

const COLORS_STATUS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#FF5733'];
const COLORS_TYPE = ['#A0E7E5', '#FBE7C6', '#86E3CE'];


export default function AdminDashboardPage() {
  const { user, isLoading: authIsLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast(); // Moved useToast hook call inside the component

  useEffect(() => {
    if (!authIsLoading && !user) {
      router.replace('/'); 
    }
  }, [user, authIsLoading, router]);

  const analyticsData = useMemo(() => {
    if (!user) return null; 

    // Filter orders for the current user
    const userSpecificOrders: Order[] = mockOrders.filter(order => order.userId === user.email);

    const totalOrders = userSpecificOrders.length;
    const totalRevenue = userSpecificOrders.reduce((sum, order) => sum + order.totalCost, 0);

    const orderStatusCounts = userSpecificOrders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<Order['status'], number>);

    const orderStatusChartData = Object.entries(orderStatusCounts).map(([name, value]) => ({ name, value }));

    const orderTypeCounts = userSpecificOrders.reduce((acc, order) => {
      acc[order.type] = (acc[order.type] || 0) + 1;
      return acc;
    }, {} as Record<Order['type'], number>);
    
    const orderTypeChartData = Object.entries(orderTypeCounts).map(([name, value]) => ({ name, value }));

    return {
      totalOrders,
      totalRevenue,
      orderStatusChartData,
      orderTypeChartData,
      orders: userSpecificOrders, // pass the user-specific orders for download
    };
  }, [user]);

  const handleDownloadOrdersReport = () => {
    if (!analyticsData || !analyticsData.orders || analyticsData.orders.length === 0) {
        toast({ title: "No Data", description: "No orders to download for your account.", variant: "destructive"});
        return;
    }

    const dataForExcel = analyticsData.orders.map(order => ({
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
    xlsx.utils.book_append_sheet(workbook, worksheet, "OrdersReport");
    
    const columnWidths = Object.keys(dataForExcel[0] || {}).map(key => {
        let maxWidth = key.length; 
        dataForExcel.forEach(row => {
            const cellValue = String((row as any)[key] || "");
            maxWidth = Math.max(maxWidth, cellValue.length);
        });
        return { wch: Math.min(maxWidth + 2, 50) }; 
    });
    worksheet['!cols'] = columnWidths;

    xlsx.writeFile(workbook, `Foodie_Orders_Report_${user?.email?.split('@')[0]}_${format(new Date(), 'yyyyMMdd_HHmm')}.xlsx`);
  };

  if (authIsLoading || !user || !analyticsData) {
    return (
      <div className="flex flex-grow items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto p-4 md:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2">
            <h1 className="text-3xl md:text-4xl font-headline font-bold text-primary">
            My Dashboard
            </h1>
            {analyticsData.orders.length > 0 && (
                <Button onClick={handleDownloadOrdersReport} variant="outline" className="mt-4 sm:mt-0">
                    <Download size={18} className="mr-2" />
                    Download My Orders Report
                </Button>
            )}
        </div>
        <p className="text-muted-foreground mb-6">
          Overview of your order statistics and performance.
        </p>
        <Separator className="mb-8" />
        
        {analyticsData.totalOrders === 0 ? (
             <p className="text-muted-foreground text-lg text-center py-8">You have not placed any orders yet. Your dashboard will populate once you have order data.</p>
        ) : (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                <div className="text-2xl font-bold">Rs.{analyticsData.totalRevenue.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                    from your orders
                </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                <div className="text-2xl font-bold">{analyticsData.totalOrders}</div>
                <p className="text-xs text-muted-foreground">
                    placed by you
                </p>
                </CardContent>
            </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                <CardTitle className="text-lg flex items-center">
                    <ListChecks className="mr-2 h-5 w-5" /> Order Status Distribution
                </CardTitle>
                </CardHeader>
                <CardContent>
                {analyticsData.orderStatusChartData.length > 0 ? (
                    <ChartContainer config={{}} className="mx-auto aspect-square max-h-[300px]">
                    <RechartsPieChart>
                        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                        <Pie
                        data={analyticsData.orderStatusChartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        labelLine={false}
                        label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }) => {
                            const RADIAN = Math.PI / 180;
                            const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                            const x = cx + radius * Math.cos(-midAngle * RADIAN);
                            const y = cy + radius * Math.sin(-midAngle * RADIAN);
                            return (
                            <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="10">
                                {`${name} (${(percent * 100).toFixed(0)}%)`}
                            </text>
                            );
                        }}
                        >
                        {analyticsData.orderStatusChartData.map((entry, index) => (
                            <Cell key={`cell-status-${index}`} fill={COLORS_STATUS[index % COLORS_STATUS.length]} />
                        ))}
                        </Pie>
                    </RechartsPieChart>
                    </ChartContainer>
                ) : (
                    <p className="text-muted-foreground text-center py-4">No order status data available.</p>
                )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                <CardTitle className="text-lg flex items-center">
                    <PieChart className="mr-2 h-5 w-5" /> Order Type Distribution
                </CardTitle>
                </CardHeader>
                <CardContent>
                {analyticsData.orderTypeChartData.length > 0 ? (
                    <ChartContainer config={{}} className="mx-auto aspect-square max-h-[300px]">
                    <RechartsPieChart>
                        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                        <Pie
                        data={analyticsData.orderTypeChartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        labelLine={false}
                        label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }) => {
                            const RADIAN = Math.PI / 180;
                            const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                            const x = cx + radius * Math.cos(-midAngle * RADIAN);
                            const y = cy + radius * Math.sin(-midAngle * RADIAN);
                            return (
                            <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="10">
                                {`${name} (${(percent * 100).toFixed(0)}%)`}
                            </text>
                            );
                        }}
                        >
                        {analyticsData.orderTypeChartData.map((entry, index) => (
                            <Cell key={`cell-type-${index}`} fill={COLORS_TYPE[index % COLORS_TYPE.length]} />
                        ))}
                        </Pie>
                    </RechartsPieChart>
                    </ChartContainer>
                ) : (
                    <p className="text-muted-foreground text-center py-4">No order type data available.</p>
                )}
                </CardContent>
            </Card>
            </div>
        </>
        )}
      </div>
    </AppLayout>
  );
}

// Helper for toast, in case it's not globally available or you want a local instance
// This can be removed if useToast is already imported and configured project-wide
// const { toast } = useToast(); // This line was causing the error and has been moved into the component
