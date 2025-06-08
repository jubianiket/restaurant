<<<<<<< HEAD

=======
>>>>>>> 633c2f0 (Updated app)
"use client";

import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Printer } from 'lucide-react';

export default function PrintBillButton({ orderId }: { orderId: string }) {
  const { toast } = useToast();

  const handlePrint = () => {
<<<<<<< HEAD
    // This will trigger the browser's print dialog
    window.print();
    
    toast({
      title: "Print Bill",
      description: `Attempting to print bill for order ${orderId}. Please use your browser's print options.`,
=======
    // In a real app, this would trigger browser print or generate a PDF.
    // For this scaffold, we'll just show a toast.
    console.log(`Printing bill for order ${orderId}...`);
    toast({
      title: "Print Bill",
      description: `Bill for order ${orderId} sent to printer (simulated).`,
>>>>>>> 633c2f0 (Updated app)
      variant: "default",
    });
  };

  return (
<<<<<<< HEAD
    <Button onClick={handlePrint} variant="outline" data-testid="print-bill-button">
=======
    <Button onClick={handlePrint} variant="outline">
>>>>>>> 633c2f0 (Updated app)
      <Printer size={18} className="mr-2" />
      Print Bill
    </Button>
  );
}
