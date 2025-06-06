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
}
