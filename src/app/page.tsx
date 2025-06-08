import { Suspense } from 'react';
import OrderPage from './OrderPageInner';

export default function PageWrapper() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-lg">Loading Order Page...</div>}>
      <OrderPage />
    </Suspense>
  );
}
