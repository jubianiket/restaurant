import type { MenuItem } from '@/types';
import MenuItemCard from './MenuItemCard';

interface MenuListProps {
  menuItems: MenuItem[];
  onAddToOrder: (item: MenuItem) => void;
}

export default function MenuList({ menuItems, onAddToOrder }: MenuListProps) {
  if (!menuItems || menuItems.length === 0) {
    return <p className="text-muted-foreground">No menu items available at the moment.</p>;
  }

  const categories = [...new Set(menuItems.map(item => item.category))];

  return (
    <div className="space-y-8">
      {categories.map(category => (
        <section key={category}>
          <h3 className="text-2xl font-headline font-semibold mb-4 text-primary/80 border-b-2 border-primary/20 pb-2">{category}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {menuItems.filter(item => item.category === category).map(item => (
              <MenuItemCard key={item.id} item={item} onAddToOrder={onAddToOrder} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
