
import type { MenuItem, Order, OrderItem, CustomerDetails, OrderType } from '@/types';

const DEMO_USER_ID = "admin@example.com"; // Default user for initial mock data

export const mockMenuItems: MenuItem[] = [
  {
    id: '1',
    name: 'Margherita Pizza',
    description: 'Classic cheese and tomato pizza with fresh basil.',
    price: 12.99,
    category: 'Pizza',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'pizza margherita',
    userId: DEMO_USER_ID,
  },
  {
    id: '2',
    name: 'Pepperoni Pizza',
    description: 'Pizza with spicy pepperoni and mozzarella cheese.',
    price: 14.99,
    category: 'Pizza',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'pizza pepperoni',
    userId: DEMO_USER_ID,
  },
  {
    id: '3',
    name: 'Caesar Salad',
    description: 'Crisp romaine lettuce, croutons, Parmesan, and Caesar dressing.',
    price: 9.50,
    category: 'Salads',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'caesar salad',
    userId: DEMO_USER_ID,
  },
  {
    id: '4',
    name: 'Spaghetti Carbonara',
    description: 'Pasta with creamy egg sauce, pancetta, and Parmesan.',
    price: 15.00,
    category: 'Pasta',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'spaghetti carbonara',
    userId: DEMO_USER_ID,
  },
  {
    id: '5',
    name: 'Cheeseburger',
    description: 'Juicy beef patty with cheddar cheese, lettuce, tomato, and onion.',
    price: 11.99,
    category: 'Burgers',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'cheeseburger fries',
    userId: DEMO_USER_ID,
  },
  {
    id: '6',
    name: 'Coca-Cola',
    description: 'Classic Coca-Cola soft drink.',
    price: 2.50,
    category: 'Drinks',
    imageUrl: 'https://placehold.co/300x300.png',
    dataAiHint: 'coca cola',
    userId: DEMO_USER_ID,
  },
];

const generateMockOrderItems = (count: number, userId: string): OrderItem[] => {
  const items: OrderItem[] = [];
  // Filter available items by userId, or use all if no specific items for this user
  const userSpecificMenuItems = mockMenuItems.filter(item => item.userId === userId);
  const availableItems = userSpecificMenuItems.length > 0 ? [...userSpecificMenuItems] : [...mockMenuItems];

  for (let i = 0; i < count; i++) {
    if (availableItems.length === 0) break;
    const randomIndex = Math.floor(Math.random() * availableItems.length);
    const selectedItem = availableItems.splice(randomIndex, 1)[0];
    items.push({
      ...selectedItem,
      quantity: Math.floor(Math.random() * 3) + 1,
    });
  }
  return items;
};

const mockCustomerDetails = (): CustomerDetails[] => [
  { name: 'Alice Smith', phone: '555-0101', address: '123 Main St, Anytown, USA', tableNumber: '5A' },
  { name: 'Bob Johnson', phone: '555-0102', tableNumber: '12' },
  { name: 'Charlie Brown', phone: '555-0103', address: '456 Oak Ave, Anytown, USA' },
];

const orderTypes: OrderType[] = ['delivery', 'dine-in']; // Removed 'take-away'
const orderStatuses: Order['status'][] = ['completed', 'pending', 'confirmed', 'cancelled'];


export const mockOrders: Order[] = Array.from({ length: 5 }, (_, i) => {
  const assignedUserId = DEMO_USER_ID; // Assign initial mock orders to the demo admin
  const items = generateMockOrderItems(Math.floor(Math.random() * 3) + 1, assignedUserId);
  const totalCost = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const customer = mockCustomerDetails()[i % mockCustomerDetails().length];
  const type = orderTypes[i % orderTypes.length];

  return {
    id: `ORD-${1001 + i}`,
    type: type,
    customerDetails: {
      name: customer.name,
      phone: customer.phone,
      address: type === 'delivery' ? customer.address || '789 Pine Ln, Anytown, USA' : undefined,
      tableNumber: type === 'dine-in' ? customer.tableNumber || `T${i + 1}` : undefined,
    },
    items,
    totalCost,
    status: orderStatuses[i % orderStatuses.length],
    createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
    userId: assignedUserId,
  };
});
