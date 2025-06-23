
"use client";

import { useState, useEffect, useMemo } from 'react';
import type { MenuItem, OrderItem, OrderType, CustomerDetails, Order } from '@/types';
import { mockOrders } from '@/lib/mockData';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

import AppLayout from '@/components/layout/AppLayout';
import OrderTypeSelector from '@/components/order/OrderTypeSelector';
import CustomerDetailsForm from '@/components/order/CustomerDetailsForm';
import TableSelector from '@/components/order/TableSelector';
import MenuList from '@/components/menu/MenuList';
import OrderSummary from '@/components/order/OrderSummary';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { CheckCircle, ShoppingCart, User, Utensils, Send, Loader2, AlertTriangle, MessageSquareText, ThumbsUp, Table as TableIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from '@/components/ui/skeleton';

export default function CreateOrderClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { user, isLoading: authIsLoading } = useAuth();

  const [orderType, setOrderType] = useState<OrderType | null>(null);
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails>({ name: '', phone: '', building: '', flat: '', tableNumber: '' });
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [currentOrderItems, setCurrentOrderItems] = useState<OrderItem[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [menuLoading, setMenuLoading] = useState(true);
  const [menuError, setMenuError] = useState<string | null>(null);
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [lastSubmittedOrder, setLastSubmittedOrder] = useState<Order | null>(null);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isSendingSms, setIsSendingSms] = useState(false);

  useEffect(() => {
    if (!authIsLoading && !user) {
      router.replace('/'); 
    }
  }, [user, authIsLoading, router]);

  useEffect(() => {
    async function fetchUserMenuItems(userId: string) {
      setMenuLoading(true);
      setMenuError(null);
      setMenuItems([]); // Clear previous menu items
      try {
        const response = await fetch(`/api/menu?userId=${encodeURIComponent(userId)}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch menu for ${userId}: ${response.statusText}`);
        }
        const data: MenuItem[] = await response.json();
        setMenuItems(data);
      } catch (error) {
        console.error("Error fetching menu items:", error);
        setMenuError(error instanceof Error ? error.message : "An unknown error occurred while fetching the menu.");
        setMenuItems([]); // Ensure menu is empty on error
        toast({
          title: "Error Loading Menu",
          description: "Could not load menu items. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setMenuLoading(false);
      }
    }

    if (!authIsLoading && user && user.email) {
      fetchUserMenuItems(user.email);

      const editOrderId = searchParams.get('edit');
      if (editOrderId) {
        const orderToEdit = mockOrders.find(o => o.id === editOrderId && o.userId === user.email);
        if (orderToEdit) {
          setIsEditing(editOrderId);
          setOrderType(orderToEdit.type);
          setCustomerDetails(orderToEdit.customerDetails);
          setCurrentOrderItems(orderToEdit.items.map(item => ({ ...item })));
          if (orderToEdit.type === 'dine-in' && orderToEdit.customerDetails.tableNumber) {
            setSelectedTable(orderToEdit.customerDetails.tableNumber);
          }
          toast({ title: "Editing Order", description: `You are now editing order ${editOrderId}.`});
        } else {
          toast({ title: "Error", description: `Order ${editOrderId} not found or you don't have permission to edit it.`, variant: "destructive"});
          router.replace('/create-order');
        }
      }
    } else if (authIsLoading) {
      setMenuLoading(true); 
    } else if (!authIsLoading && !user) {
      setMenuItems([]);
      setMenuLoading(false);
    }
  }, [searchParams, toast, user, router, authIsLoading]);

  const handleTableSelect = (tableNumber: string) => {
    setSelectedTable(tableNumber);
    setCustomerDetails({
      name: `Table ${tableNumber}`,
      phone: '', // Dine-in may not require phone
      tableNumber,
    });
    toast({
      title: `Table ${tableNumber} selected`,
      description: "You can now add items to the order.",
    })
  };

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
    if (!user) {
        toast({ title: "Not Authenticated", description: "Please log in to submit an order.", variant: "destructive" });
        return;
    }
    if (!orderType) {
      toast({ title: "Missing Information", description: "Please select an order type.", variant: "destructive" });
      return;
    }

    let finalCustomerDetails = { ...customerDetails };

    if (orderType === 'delivery') {
      if (!customerDetails.phone || !customerDetails.building || !customerDetails.flat) {
        toast({ title: "Missing Information", description: "Please provide phone, building, and flat for delivery.", variant: "destructive" });
        return;
      }
      finalCustomerDetails.name = `Delivery to ${customerDetails.building}, ${customerDetails.flat}`;
    } else if (orderType === 'dine-in') {
      if (!selectedTable) {
        toast({ title: "Missing Information", description: "Please select a table for dine-in.", variant: "destructive" });
        return;
      }
    }
    
    if (currentOrderItems.length === 0) {
      toast({ title: "Empty Order", description: "Please add items to your order.", variant: "destructive" });
      return;
    }

    const newOrder: Order = {
      id: isEditing || `ORD-${Date.now()}`,
      type: orderType,
      customerDetails: finalCustomerDetails,
      items: currentOrderItems,
      totalCost: totalPrice,
      status: 'pending',
      createdAt: new Date().toISOString(),
      userId: user.email, 
    };

    console.log('Order Submitted:', newOrder);

    if(isEditing) {
      const index = mockOrders.findIndex(o => o.id === isEditing && o.userId === user.email);
      if(index !== -1) mockOrders[index] = newOrder; else mockOrders.push(newOrder); 
    } else {
       mockOrders.unshift(newOrder);
    }

    setLastSubmittedOrder(newOrder);
    setOrderSubmitted(true);
    toast({
      title: isEditing ? "Order Updated!" : "Order Submitted!",
      description: `Your order ${newOrder.id} has been successfully ${isEditing ? 'updated' : 'placed'}. Thank you!`,
    });

    if (isEditing) router.push(`/orders/${newOrder.id}`);
  };

  const handleStartNewOrder = () => {
    setOrderType(null);
    setCustomerDetails({ name: '', phone: '', building: '', flat: '', tableNumber: '' });
    setCurrentOrderItems([]);
    setOrderSubmitted(false);
    setLastSubmittedOrder(null);
    setSelectedTable(null);
    setIsEditing(null);
    router.replace('/create-order');
    toast({ title: "New Order Started", description: "Please fill in the details for your new order."});
  }

  const handleSendSmsConfirmation = async (order: Order | null) => {
    if (!order) return;

    if (!order.customerDetails.phone || !order.customerDetails.phone.startsWith('+')) {
      toast({
        title: "Cannot Send SMS",
        description: "No valid phone number provided (must be in E.164 format, e.g., +12223334444).",
        variant: "destructive",
      });
      return;
    }
    
    let recipientPhoneNumber = order.customerDetails.phone;
    
    setIsSendingSms(true);
    try {
      const smsMessage = `Your Foodie Order ${order.id} for Rs.${order.totalCost.toFixed(2)} has been placed. Items: ${order.items.map(i => i.name).join(', ')}. Thank you!`;
      
      const response = await fetch('/api/send-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ to: recipientPhoneNumber, body: smsMessage }),
      });

      let result;
      let errorMessageFromApi;

      if (!response.ok) {
        try {
          result = await response.json();
          errorMessageFromApi = result.error || result.message;
        } catch (e) {
          const statusText = response.statusText ? `: ${response.statusText}` : '';
          errorMessageFromApi = `Server responded with ${response.status}${statusText}`;
        }
        const finalErrorMessage = (errorMessageFromApi && errorMessageFromApi.trim() !== `Server responded with ${response.status}:` && !errorMessageFromApi.endsWith('(Internal Server Error)'))
                                  ? errorMessageFromApi 
                                  : `Failed to send SMS. The server returned an error (status ${response.status}). Please check server logs for details.`;
        throw new Error(finalErrorMessage);
      }
      
      result = await response.json();

      if (result.success) {
        toast({
          title: "SMS Sent!",
          description: `SMS to ${order.customerDetails.phone} was sent. Message SID: ${result.messageSid}`,
        });
      } else {
        const detailedErrorMessage = result.error || result.message || 'Failed to send SMS (API returned error)';
        throw new Error(detailedErrorMessage);
      }
    } catch (error) {
      console.error("SMS sending error:", error);
      toast({
        title: "SMS Sending Failed",
        description: (error instanceof Error ? error.message : "Could not send SMS."),
        variant: "destructive",
      });
    } finally {
      setIsSendingSms(false);
    }
  };


  if (authIsLoading || !user && !authIsLoading) { 
    return (
      <div className="flex flex-grow items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  const isSubmitDisabled = !orderType || 
                           currentOrderItems.length === 0 || 
                           (orderType === 'delivery' && (!customerDetails.phone || !customerDetails.building || !customerDetails.flat)) ||
                           (orderType === 'dine-in' && !selectedTable);

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
    if (!menuItems || menuItems.length === 0) {
        return <p className="text-muted-foreground">No menu items available for you yet. Add some items via "Manage Menu".</p>;
    }
    return <MenuList menuItems={menuItems} onAddToOrder={handleAddToOrder} />;
  };

  const renderCustomerSection = () => {
    if (!orderType) return null;

    if (orderType === 'dine-in') {
      return (
        <section id="table-selection">
          <h2 className="text-xl md:text-2xl font-headline font-semibold mb-4 flex items-center"><TableIcon size={24} className="mr-3 text-primary/70" />2. Select a Table</h2>
          <TableSelector
            selectedTable={selectedTable}
            onSelectTable={handleTableSelect}
          />
        </section>
      );
    }
    
    if (orderType === 'delivery') {
      return (
        <section id="customer-details">
          <h2 className="text-xl md:text-2xl font-headline font-semibold mb-4 flex items-center"><User size={24} className="mr-3 text-primary/70" />2. Delivery Details</h2>
          <CustomerDetailsForm
            details={customerDetails}
            onDetailsChange={setCustomerDetails}
            orderType={orderType}
          />
        </section>
      );
    }
    
    return null;
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

        {orderSubmitted && !isEditing && lastSubmittedOrder ? (
          <Alert variant="default" className="bg-green-100 border-green-400 text-green-700 dark:bg-green-900 dark:border-green-700 dark:text-green-300">
            <CheckCircle className="h-5 w-5" />
            <AlertTitle className="font-bold">Order Placed Successfully!</AlertTitle>
            <AlertDescription>
              Your order ID is <strong>{lastSubmittedOrder.id}</strong>. Thank you for choosing Foodie Orders!
              <div className="mt-4 flex flex-wrap gap-2">
                <Button onClick={handleStartNewOrder} variant="default" className="bg-green-600 hover:bg-green-700 text-white">
                  Create Another Order
                </Button>
                <Button onClick={() => router.push('/history')} variant="outline" className="border-green-600 text-green-700 hover:bg-green-50 dark:border-green-500 dark:text-green-300 dark:hover:bg-green-800">
                  View Order History
                </Button>
                <Button 
                  onClick={() => handleSendSmsConfirmation(lastSubmittedOrder)} 
                  variant="outline" 
                  className="border-blue-600 text-blue-700 hover:bg-blue-50 dark:border-blue-500 dark:text-blue-300 dark:hover:bg-blue-800"
                  disabled={!lastSubmittedOrder.customerDetails.phone || !lastSubmittedOrder.customerDetails.phone.startsWith('+') || isSendingSms}
                >
                  {isSendingSms ? (
                    <>
                      <Loader2 size={16} className="mr-2 animate-spin" /> Sending SMS...
                    </>
                  ) : (
                    <>
                      <MessageSquareText size={16} className="mr-2" /> Send SMS Confirmation
                    </>
                  )}
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <section id="order-type">
              <h2 className="text-xl md:text-2xl font-headline font-semibold mb-4 flex items-center"><Utensils size={24} className="mr-3 text-primary/70" />1. Select Order Type</h2>
              <OrderTypeSelector selectedType={orderType} onSelectType={(type) => {
                setOrderType(type);
                setSelectedTable(null); // Reset table selection when type changes
                setCustomerDetails({ name: '', phone: '', building: '', flat: '', tableNumber: '' }); // Reset details
              }} />
            </section>

            <Separator />

            {renderCustomerSection()}

            <Separator />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              <section className="lg:col-span-2" id="menu-items">
                <h2 className="text-xl md:text-2xl font-headline font-semibold mb-4 flex items-center"><ShoppingCart size={24} className="mr-3 text-primary/70" />3. Choose Your Items</h2>
                {renderMenuContent()}
              </section>

              <section className="lg:col-span-1 sticky top-6" id="order-summary">
                <h2 className="text-xl md:text-2xl font-headline font-semibold mb-4">4. Order Summary</h2>
                 {orderType === 'dine-in' && selectedTable && (
                  <div className="mb-4 flex items-center justify-center text-center p-3 rounded-lg bg-accent text-accent-foreground">
                    <ThumbsUp size={20} className="mr-2"/>
                    <span className="font-bold text-lg">Selected: Table {selectedTable}</span>
                  </div>
                 )}
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
