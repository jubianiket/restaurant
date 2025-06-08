
import AppLayout from '@/components/layout/AppLayout';
import MenuItemsManager from '@/components/admin/menu/MenuItemsManager';
import { Separator } from '@/components/ui/separator';

export const metadata = {
  title: 'Manage Menu - Foodie Orders',
};

export default function AdminMenuPage() {
  return (
    <AppLayout>
      <div className="container mx-auto p-4 md:p-8">
        <h1 className="text-3xl md:text-4xl font-headline font-bold text-primary mb-2">
          Menu Administration
        </h1>
        <p className="text-muted-foreground mb-6">
          Manage your restaurant's menu items here. You can add, edit, delete items, or upload an Excel sheet for bulk updates.
        </p>
        <Separator className="mb-8" />
        <MenuItemsManager />
      </div>
    </AppLayout>
  );
}

