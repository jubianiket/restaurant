
import { Suspense } from 'react';
import CreateOrderClient from './CreateOrderClient';
import { Loader2 } from 'lucide-react';

// This is the main page component for the /create-order route.
// It's a Server Component that wraps the client-side logic in Suspense.
export default function CreateOrderPage() {
  return (
    <Suspense 
      fallback={
        <div className="flex flex-grow items-center justify-center min-h-screen bg-background">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
      }
    >
      <CreateOrderClient />
    </Suspense>
  );
}
