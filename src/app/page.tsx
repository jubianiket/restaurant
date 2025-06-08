
"use client";

import { useState, useEffect, useMemo } from 'react';
import type { MenuItem, OrderItem, OrderType, CustomerDetails, Order } from '@/types';
// mockMenuItems and mockOrders are no longer directly used for menu, mockOrders still for editing
import { mockOrders } from '@/lib/mockData'; 
import { useRouter, useSearchParams } from 'next/navigation';

import AppLayout from '@/components/layout/AppLayout';
import OrderTypeSelector from '@/components/order/OrderTypeSelector';
import CustomerDetailsForm from '@/components/order/CustomerDetailsForm';
import MenuList from '@/components/menu/MenuList';
import OrderSummary from '@/components/order/OrderSummary';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { CheckCircle, ShoppingCart, User, Utensils, Send, Loader2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from '@/components/ui/skeleton';

export default function OrderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [orderType, setOrderType] = useState<OrderType | null>(null);
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails>({ name: '', phone: '', address: '' });
  const [currentOrderItems, setCurrentOrderItems] = useState<OrderItem[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [menuLoading, setMenuLoading] = useState(true);
  const [menuError, setMenuError] = useState<string | null>(null);
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMenuItems() {
      setMenuLoading(true);
      setMenuError(null);
      try {
        const response = await fetch('/api/menu');
        if (!response.ok) {
          throw new Error(`Failed to fetch menu: ${response.statusText}`);
        }
        const data: MenuItem[] = await response.json();
        setMenuItems(data);
      } catch (error) {
        console.error("Error fetching menu items:", error);
        setMenuError(error instanceof Error ? error.message : "An unknown error occurred while fetching the menu.");
        toast({
          title: "Error Loading Menu",
          description: "Could not load menu items. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setMenuLoading(false);
      }
    }

    fetchMenuItems();

    const editOrderId = searchParams.get('edit');
    if (editOrderId) {
      const orderToEdit = mockOrders.find(o => o.id === editOrderId); 
      if (orderToEdit) {
        setIsEditing(editOrderId);
        setOrderType(orderToEdit.type);
        setCustomerDetails(orderToEdit.customerDetails);
        setCurrentOrderItems(orderToEdit.items.map(item => ({ ...item }))); 
        toast({ title: "Editing Order", description: `You are now editing order ${editOrderId}.`});
      } else {
        toast({ title: "Error", description: `Order ${editOrderId} not found for editing.`, variant: "destructive"});
      }
    }
  }, [searchParams, toast]);

  const handleAddToOrder = (itemToAdd: MenuItem) => {
    setCurrentOrderItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === itemToAdd.id);
      if (existingItem) {
        return prevItems.map(item =>
          item.id === itemToAdd.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevItems, { ...itemToAdd, quantity: 1 }];
    });
    toast({
      title: `${itemToAdd.name} added!`,
      description: "Item successfully added to your order.",
    });
  };

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveFromOrder(itemId);
      return;
    }
    setCurrentOrderItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const handleRemoveFromOrder = (itemId: string) => {
    setCurrentOrderItems(prevItems => prevItems.filter(item => item.id !== itemId));
     toast({
      title: `Item removed`,
      description: "Item successfully removed from your order.",
      variant: "destructive"
    });
  };

  const totalPrice = useMemo(() => {
    return currentOrderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [currentOrderItems]);

  const handleSubmitOrder = () => {
    if (!orderType) {
      toast({ title: "Missing Information", description: "Please select an order type.", variant: "destructive" });
      return;
    }
    if (!customerDetails.name || !customerDetails.phone) {
      toast({ title: "Missing Information", description: "Please enter customer name and phone number.", variant: "destructive" });
      return;
    }
    if (orderType === 'delivery' && !customerDetails.address) {
      toast({ title: "Missing Information", description: "Please enter a delivery address.", variant: "destructive" });
      return;
    }
    if (currentOrderItems.length === 0) {
      toast({ title: "Empty Order", description: "Please add items to your order.", variant: "destructive" });
      return;
    }

    const newOrder: Order = {
      id: isEditing || `ORD-${Date.now()}`,
      type: orderType,
      customerDetails,
      items: currentOrderItems,
      totalCost: totalPrice,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    console.log('Order Submitted:', newOrder);
    
    if(isEditing) {
      const index = mockOrders.findIndex(o => o.id === isEditing);
      if(index !== -1) mockOrders[index] = newOrder; else mockOrders.push(newOrder);
    } else {
       mockOrders.unshift(newOrder); 
    }
   
    setOrderSubmitted(true);
    toast({
      title: isEditing ? "Order Updated!" : "Order Submitted!",
      description: `Your order ${newOrder.id} has been successfully ${isEditing ? 'updated' : 'placed'}. Thank you!`,
    });

    if (isEditing) router.push(`/orders/${newOrder.id}`);
  };

  const handleStartNewOrder = () => {
    setOrderType(null);
    setCustomerDetails({ name: '', phone: '', address: '' });
    setCurrentOrderItems([]);
    setOrderSubmitted(false);
    setIsEditing(null);
    router.replace('/'); 
    toast({ title: "New Order Started", description: "Please fill in the details for your new order."});
  }

  const isSubmitDisabled = !orderType || !customerDetails.name || !customerDetails.phone || currentOrderItems.length === 0 || (orderType === 'delivery' && !customerDetails.address);
  
  const renderMenuContent = () => {
    if (menuLoading) {
      return (
        <div className="space-y-8">
          {[...Array(2)].map((_, catIndex) => (
            <section key={catIndex}>
              <Skeleton className="h-8 w-1/3 mb-4" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(2)].map((_, itemIndex) => (
                  <Card key={itemIndex} className="flex flex-col overflow-hidden shadow-lg h-full">
                    <Skeleton className="relative w-full h-48" />
                    <CardHeader>
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2 mt-1" />
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <Skeleton className="h-4 w-full mb-1" />
                      <Skeleton className="h-4 w-2/3" />
                    </CardContent>
                    <CardFooter className="flex justify-between items-center pt-4">
                      <Skeleton className="h-8 w-1/4" />
                      <Skeleton className="h-9 w-20" />
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </section>
          ))}
        </div>
      );
    }

    if (menuError) {
      return (
        <Alert variant="destructive">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle>Error Loading Menu</AlertTitle>
          <AlertDescription>
            {menuError} Please try refreshing the page or contact support if the problem persists.
          </AlertDescription>
        </Alert>
      );
    }
    return <MenuList menuItems={menuItems} onAddToOrder={handleAddToOrder} />;
  };


  return (
    <AppLayout>
      <div className="container mx-auto p-4 md:p-8 space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl md:text-4xl font-headline font-bold text-primary">
            {isEditing ? `Editing Order: ${isEditing}` : "Create New Order"}
          </h1>
          {(orderSubmitted || isEditing) && (
            <Button onClick={handleStartNewOrder} variant="outline">Start New Order</Button>
          )}
        </div>

        {orderSubmitted && !isEditing ? (
          <Alert variant="default" className="bg-green-100 border-green-400 text-green-700 dark:bg-green-900 dark:border-green-700 dark:text-green-300">
            <CheckCircle className="h-5 w-5" />
            <AlertTitle className="font-bold">Order Placed Successfully!</AlertTitle>
            <AlertDescription>
              Your order ID is <strong>{mockOrders[0]?.id}</strong>. Thank you for choosing Foodie Orders!
              <div className="mt-4">
                <Button onClick={handleStartNewOrder} variant="default" className="bg-green-600 hover:bg-green-700 text-white">
                  Create Another Order
                </Button>
                <Button onClick={() => router.push('/history')} variant="outline" className="ml-2 border-green-600 text-green-700 hover:bg-green-50">
                  View Order History
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <section id="order-type">
              <h2 className="text-xl md:text-2xl font-headline font-semibold mb-4 flex items-center"><Utensils size={24} className="mr-3 text-primary/70" />1. Select Order Type</h2>
              <OrderTypeSelector selectedType={orderType} onSelectType={setOrderType} />
            </section>

            <Separator />

            <section id="customer-details">
              <h2 className="text-xl md:text-2xl font-headline font-semibold mb-4 flex items-center"><User size={24} className="mr-3 text-primary/70" />2. Customer Details</h2>
              <CustomerDetailsForm
                details={customerDetails}
                onDetailsChange={setCustomerDetails}
                orderType={orderType}
              />
            </section>

            <Separator />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              <section className="lg:col-span-2" id="menu-items">
                <h2 className="text-xl md:text-2xl font-headline font-semibold mb-4 flex items-center"><ShoppingCart size={24} className="mr-3 text-primary/70" />3. Choose Your Items</h2>
                {renderMenuContent()}
              </section>

              <section className="lg:col-span-1 sticky top-6" id="order-summary">
                <h2 className="text-xl md:text-2xl font-headline font-semibold mb-4">4. Order Summary</h2>
                <OrderSummary
                  items={currentOrderItems}
                  totalPrice={totalPrice}
                  onUpdateQuantity={handleUpdateQuantity}
                  onRemoveItem={handleRemoveFromOrder}
                />
                <Button 
                  onClick={handleSubmitOrder} 
                  className="w-full mt-6 text-lg py-6"
                  disabled={isSubmitDisabled || menuLoading || !!menuError}
                >
                  <Send size={20} className="mr-2" />
                  {isEditing ? "Update Order" : "Submit Order"}
                </Button>
              </section>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
