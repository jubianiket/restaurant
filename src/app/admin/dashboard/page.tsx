
"use client";

import { useEffect, useMemo, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Loader2, DollarSign, ShoppingCart, Users, ListChecks, Download, LineChart, BarChart, Clock, Star } from 'lucide-react';
import { mockOrders } from '@/lib/mockData'; 
import type { Order } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ResponsiveContainer, BarChart as RechartsBarChart, Bar, LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart as RechartsPieChart, Pie, Cell } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from '@/components/ui/separator';
import * as xlsx from 'xlsx';
import { format, parseISO, subDays, startOfDay } from 'date-fns';
import { useToast } from "@/hooks/use-toast";

const COLORS_TYPE = ['#A0E7E5', '#FBE7C6', '#86E3CE'];

type TimeRange = '7d' | '30d' | 'all';

export default function AdminDashboardPage() {
  const { user, isLoading: authIsLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');

  useEffect(() => {
    if (!authIsLoading && !user) {
      router.replace('/'); 
    }
  }, [user, authIsLoading, router]);

  const filteredOrders = useMemo(() => {
    if (!user) return [];
    const userOrders = mockOrders.filter(order => order.userId === user.email);
    if (timeRange === 'all') return userOrders;
    
    const days = timeRange === '7d' ? 7 : 30;
    const startDate = startOfDay(subDays(new Date(), days));
    
    return userOrders.filter(order => isAfter(parseISO(order.createdAt), startDate));
  }, [user, timeRange]);

  const analyticsData = useMemo(() => {
    if (!user || filteredOrders.length === 0) return null;

    const totalOrders = filteredOrders.length;
    const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.totalCost, 0);
    const avgOrderValue = totalRevenue / totalOrders;
    
    // Customer analytics
    const allUserPhoneNumbers = mockOrders
        .filter(o => o.userId === user.email && o.customerDetails.phone)
        .map(o => o.customerDetails.phone);
    const uniquePhoneNumbersInPeriod = new Set(filteredOrders.filter(o => o.customerDetails.phone).map(o => o.customerDetails.phone));
    const newCustomers = [...uniquePhoneNumbersInPeriod].filter(phone => {
        const firstOrderDate = mockOrders
            .filter(o => o.userId === user.email && o.customerDetails.phone === phone)
            .sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())[0]?.createdAt;
        if (!firstOrderDate) return false;
        
        const periodStartDate = timeRange === 'all' ? new Date(0) : startOfDay(subDays(new Date(), timeRange === '7d' ? 7 : 30));
        return isAfter(parseISO(firstOrderDate), periodStartDate);
    }).length;

    // Time-based analytics
    const salesByDate = filteredOrders.reduce((acc, order) => {
        const date = format(parseISO(order.createdAt), 'yyyy-MM-dd');
        acc[date] = (acc[date] || 0) + order.totalCost;
        return acc;
    }, {} as Record<string, number>);

    const salesOverTimeData = Object.entries(salesByDate)
        .map(([date, total]) => ({ date, total }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
    const salesByHour = filteredOrders.reduce((acc, order) => {
        const hour = format(parseISO(order.createdAt), 'HH');
        acc[hour] = (acc[hour] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const peakHoursData = Object.entries(salesByHour).map(([hour, count]) => ({ hour: `${hour}:00`, orders: count }));

    // Item-level analytics
    const itemRevenue = filteredOrders
        .flatMap(o => o.items)
        .reduce((acc, item) => {
            acc[item.name] = (acc[item.name] || 0) + (item.price * item.quantity);
            return acc;
        }, {} as Record<string, number>);

    const topSellingItems = Object.entries(itemRevenue)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, revenue]) => ({ name, revenue }));

    // Order type distribution
    const orderTypeCounts = filteredOrders.reduce((acc, order) => {
      acc[order.type] = (acc[order.type] || 0) + 1;
      return acc;
    }, {} as Record<Order['type'], number>);
    const orderTypeChartData = Object.entries(orderTypeCounts).map(([name, value]) => ({ name, value }));

    return {
      totalOrders,
      totalRevenue,
      avgOrderValue,
      newCustomers,
      salesOverTimeData,
      peakHoursData,
      topSellingItems,
      orderTypeChartData,
    };
  }, [user, filteredOrders, timeRange]);

  const handleDownloadOrdersReport = () => {
    if (!filteredOrders || filteredOrders.length === 0) {
        toast({ title: "No Data", description: "No orders to download in the selected period.", variant: "destructive"});
        return;
    }

    const formatAddress = (details: Order['customerDetails']): string => {
        if (details.tableNumber) return `Table ${details.tableNumber}`;
        if (details.building && details.flat) return `Flat ${details.flat}, ${details.building}`;
        return "N/A";
    };

    const dataForExcel = filteredOrders.map(order => ({
      "Order ID": order.id,
      "Date": format(parseISO(order.createdAt), 'yyyy-MM-dd HH:mm'),
      "Customer Phone": order.customerDetails.phone,
      "Customer Address": formatAddress(order.customerDetails),
      "Order Type": order.type,
      "Status": order.status,
      "Total Cost (Rs.)": order.totalCost.toFixed(2),
      "Items": order.items.map(item => `${item.name} (Qty: ${item.quantity})`).join(' | ')
    }));

    const worksheet = xlsx.utils.json_to_sheet(dataForExcel);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "OrdersReport");
    xlsx.writeFile(workbook, `Foodie_Orders_Report_${format(new Date(), 'yyyyMMdd')}.xlsx`);
  };
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background/80 backdrop-blur-sm p-2 border border-border rounded-lg shadow-lg">
          <p className="label font-bold">{label}</p>
          <p className="intro text-primary">{`Value: ${payload[0].value.toLocaleString(undefined, {style: 'currency', currency: 'INR'})}`}</p>
        </div>
      );
    }
    return null;
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
      <div className="container mx-auto p-4 md:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
                <h1 className="text-3xl md:text-4xl font-headline font-bold text-primary">My Dashboard</h1>
                <p className="text-muted-foreground">Analytics overview for your restaurant.</p>
            </div>
            <div className="flex items-center gap-2 mt-4 sm:mt-0">
                 <Select value={timeRange} onValueChange={(value) => setTimeRange(value as TimeRange)}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select a time range" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="7d">Last 7 Days</SelectItem>
                        <SelectItem value="30d">Last 30 Days</SelectItem>
                        <SelectItem value="all">All Time</SelectItem>
                    </SelectContent>
                </Select>
                <Button onClick={handleDownloadOrdersReport} variant="outline">
                    <Download size={18} className="mr-2" />
                    Download Report
                </Button>
            </div>
        </div>
        <Separator/>

        {!analyticsData ? (
             <p className="text-muted-foreground text-lg text-center py-8">No order data available for the selected period.</p>
        ) : (
        <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Rs.{analyticsData.totalRevenue.toFixed(2)}</div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analyticsData.totalOrders}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg. Order Value</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Rs.{analyticsData.avgOrderValue.toFixed(2)}</div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">New Customers</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+{analyticsData.newCustomers}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center"><LineChart className="mr-2 h-5 w-5"/>Sales Over Time</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[350px] w-full">
                         <ResponsiveContainer width="100%" height="100%">
                            <RechartsLineChart data={analyticsData.salesOverTimeData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" tickFormatter={(date) => format(parseISO(date), 'MMM d')} />
                                <YAxis />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Line type="monotone" dataKey="total" name="Sales (Rs.)" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }}/>
                            </RechartsLineChart>
                        </ResponsiveContainer>
                    </CardContent>
                 </Card>
                 
                 <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center"><Clock className="mr-2 h-5 w-5"/>Peak Ordering Hours</CardTitle>
                    </CardHeader>
                     <CardContent className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <RechartsBarChart data={analyticsData.peakHoursData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="hour" />
                                <YAxis allowDecimals={false} />
                                <Tooltip cursor={{fill: 'hsl(var(--muted))'}}/>
                                <Legend />
                                <Bar dataKey="orders" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                            </RechartsBarChart>
                        </ResponsiveContainer>
                    </CardContent>
                 </Card>
            </div>
            
            {/* Secondary Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center"><Star className="mr-2 h-5 w-5"/>Top Selling Items</CardTitle>
                        <CardDescription>By revenue in the selected period.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Item</TableHead>
                                    <TableHead className="text-right">Revenue</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {analyticsData.topSellingItems.map(item => (
                                <TableRow key={item.name}>
                                    <TableCell className="font-medium">{item.name}</TableCell>
                                    <TableCell className="text-right">Rs.{item.revenue.toFixed(2)}</TableCell>
                                </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center"><ListChecks className="mr-2 h-5 w-5"/>Order Types</CardTitle>
                        <CardDescription>Distribution of Dine-in vs. Delivery orders.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[250px]">
                         <ResponsiveContainer width="100%" height="100%">
                            <RechartsPieChart>
                                <Tooltip />
                                <Pie
                                data={analyticsData.orderTypeChartData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                {analyticsData.orderTypeChartData.map((entry, index) => (
                                    <Cell key={`cell-type-${index}`} fill={COLORS_TYPE[index % COLORS_TYPE.length]} />
                                ))}
                                </Pie>
                            </RechartsPieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </>
        )}
      </div>
    </AppLayout>
  );
}

    