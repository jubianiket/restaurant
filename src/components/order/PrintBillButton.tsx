
"use client";

import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Printer } from 'lucide-react';

export default function PrintBillButton({ orderId }: { orderId: string }) {
  const { toast } = useToast();

  const handlePrint = () => {
    // This will trigger the browser's print dialog
    window.print();
    
    toast({
      title: "Print Bill",
      description: `Attempting to print bill for order ${orderId}. Please use your browser's print options.`,
      variant: "default",
    });
  };

  return (
    <Button onClick={handlePrint} variant="outline" data-testid="print-bill-button">
      <Printer size={18} className="mr-2" />
      Print Bill
    </Button>
  );
}
