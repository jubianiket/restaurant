
"use client";

import { useEffect, useMemo } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Loader2, DollarSign, ShoppingCart, PieChart, ListChecks } from 'lucide-react';
import { mockOrders } from '@/lib/mockData'; // Assuming orders are available here
import type { Order } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Pie, PieChart as RechartsPieChart, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Separator } from '@/components/ui/separator';

const COLORS_STATUS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#FF5733'];
const COLORS_TYPE = ['#A0E7E5', '#FBE7C6', '#86E3CE'];


export default function AdminDashboardPage() {
  const { user, isLoading: authIsLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authIsLoading && !user) {
      router.replace('/'); // Redirect to login
    }
  }, [user, authIsLoading, router]);

  const analyticsData = useMemo(() => {
    if (!user) return null; // Only calculate if user is logged in

    const orders: Order[] = mockOrders; // In a real app, fetch this or pass as props

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalCost, 0);

    const orderStatusCounts = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<Order['status'], number>);

    const orderStatusChartData = Object.entries(orderStatusCounts).map(([name, value]) => ({ name, value }));

    const orderTypeCounts = orders.reduce((acc, order) => {
      acc[order.type] = (acc[order.type] || 0) + 1;
      return acc;
    }, {} as Record<Order['type'], number>);
    
    const orderTypeChartData = Object.entries(orderTypeCounts).map(([name, value]) => ({ name, value }));

    return {
      totalOrders,
      totalRevenue,
      orderStatusChartData,
      orderTypeChartData,
    };
  }, [user]);

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
        <h1 className="text-3xl md:text-4xl font-headline font-bold text-primary mb-2">
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground mb-6">
          Overview of your restaurant's performance and order statistics.
        </p>
        <Separator className="mb-8" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Rs.{analyticsData.totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                from all orders
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
                processed in total
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
      </div>
    </AppLayout>
  );
}
