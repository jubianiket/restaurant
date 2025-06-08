<<<<<<< HEAD
<<<<<<< HEAD
import { Suspense } from 'react';
import OrderPage from './OrderPageInner';

export default function PageWrapper() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-lg">Loading Order Page...</div>}>
      <OrderPage />
    </Suspense>
  );
=======
export default function Home() {
  return <></>;
>>>>>>> 7d3cda9 (initial scaffold)
=======
"use client";

import { useState, useEffect, useMemo } from 'react';
import type { MenuItem, OrderItem, OrderType, CustomerDetails, Order } from '@/types';
import { mockMenuItems, mockOrders } from '@/lib/mockData';
import { useRouter, useSearchParams } from 'next/navigation';

import AppLayout from '@/components/layout/AppLayout';
import OrderTypeSelector from '@/components/order/OrderTypeSelector';
import CustomerDetailsForm from '@/components/order/CustomerDetailsForm';
import MenuList from '@/components/menu/MenuList';
import OrderSummary from '@/components/order/OrderSummary';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, ShoppingCart, User, Utensils, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function OrderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [orderType, setOrderType] = useState<OrderType | null>(null);
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails>({ name: '', phone: '', address: '' });
  const [currentOrderItems, setCurrentOrderItems] = useState<OrderItem[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null); // Stores ID of order being edited

  useEffect(() => {
    setMenuItems(mockMenuItems);
    const editOrderId = searchParams.get('edit');
    if (editOrderId) {
      const orderToEdit = mockOrders.find(o => o.id === editOrderId); // In real app, fetch order
      if (orderToEdit) {
        setIsEditing(editOrderId);
        setOrderType(orderToEdit.type);
        setCustomerDetails(orderToEdit.customerDetails);
        setCurrentOrderItems(orderToEdit.items.map(item => ({ ...item }))); // Ensure fresh copy
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
    // Basic validation
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
      id: isEditing || `ORD-${Date.now()}`, // Use existing ID if editing
      type: orderType,
      customerDetails,
      items: currentOrderItems,
      totalCost: totalPrice,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    // In a real app, this would send data to a backend
    console.log('Order Submitted:', newOrder);
    
    // Simulate saving to mockOrders (if not already there or updating)
    if(isEditing) {
      const index = mockOrders.findIndex(o => o.id === isEditing);
      if(index !== -1) mockOrders[index] = newOrder; else mockOrders.push(newOrder);
    } else {
       mockOrders.unshift(newOrder); // Add to the beginning for history view
    }
   
    setOrderSubmitted(true);
    toast({
      title: isEditing ? "Order Updated!" : "Order Submitted!",
      description: `Your order ${newOrder.id} has been successfully ${isEditing ? 'updated' : 'placed'}. Thank you!`,
    });

    // Optionally reset form or redirect
    // For now, just show success message. Can add a "New Order" button to reset.
    if (isEditing) router.push(`/orders/${newOrder.id}`);
  };

  const handleStartNewOrder = () => {
    setOrderType(null);
    setCustomerDetails({ name: '', phone: '', address: '' });
    setCurrentOrderItems([]);
    setOrderSubmitted(false);
    setIsEditing(null);
    router.replace('/'); // Clear edit query param
    toast({ title: "New Order Started", description: "Please fill in the details for your new order."});
  }

  const isSubmitDisabled = !orderType || !customerDetails.name || !customerDetails.phone || currentOrderItems.length === 0 || (orderType === 'delivery' && !customerDetails.address);

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
                <MenuList menuItems={menuItems} onAddToOrder={handleAddToOrder} />
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
                  disabled={isSubmitDisabled}
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
>>>>>>> 633c2f0 (Updated app)
}
