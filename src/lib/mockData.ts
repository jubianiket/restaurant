
import type { MenuItem, Order, OrderItem, CustomerDetails, OrderType } from '@/types';
import { subDays, subHours } from 'date-fns';

const DEMO_USER_ID = "admin@example.com";
const OTHER_USER_ID = "user@example.com";

export const mockMenuItems: MenuItem[] = [
  { id: '1', name: 'Margherita Pizza', description: 'Classic cheese and tomato.', price: 299, category: 'Pizza', imageUrl: 'https://placehold.co/600x400.png', dataAiHint: 'pizza margherita', userId: DEMO_USER_ID },
  { id: '2', name: 'Pepperoni Pizza', description: 'Spicy pepperoni & cheese.', price: 349, category: 'Pizza', imageUrl: 'https://placehold.co/600x400.png', dataAiHint: 'pizza pepperoni', userId: DEMO_USER_ID },
  { id: '3', name: 'Caesar Salad', description: 'Crisp romaine, croutons, Parmesan.', price: 220, category: 'Salads', imageUrl: 'https://placehold.co/600x400.png', dataAiHint: 'caesar salad', userId: DEMO_USER_ID },
  { id: '4', name: 'Spaghetti Carbonara', description: 'Creamy egg sauce, pancetta.', price: 380, category: 'Pasta', imageUrl: 'https://placehold.co/600x400.png', dataAiHint: 'spaghetti carbonara', userId: DEMO_USER_ID },
  { id: '5', name: 'Cheeseburger', description: 'Beef patty, cheddar, lettuce.', price: 310, category: 'Burgers', imageUrl: 'https://placehold.co/600x400.png', dataAiHint: 'cheeseburger fries', userId: DEMO_USER_ID },
  { id: '6', name: 'Coca-Cola', description: 'Classic soft drink.', price: 60, category: 'Drinks', imageUrl: 'https://placehold.co/300x300.png', dataAiHint: 'coca cola', userId: DEMO_USER_ID },
  { id: '7', name: 'Veggie Burger', description: 'Plant-based patty, all the fixings.', price: 280, category: 'Burgers', imageUrl: 'https://placehold.co/600x400.png', dataAiHint: 'veggie burger', userId: DEMO_USER_ID },
  { id: '8', name: 'Alfredo Pasta', description: 'Fettuccine in a creamy parmesan sauce.', price: 360, category: 'Pasta', imageUrl: 'https://placehold.co/600x400.png', dataAiHint: 'alfredo pasta', userId: DEMO_USER_ID },
  { id: '9', name: 'Paneer Tikka', description: 'Tandoori spiced paneer skewers.', price: 250, category: 'Starters', imageUrl: 'https://placehold.co/600x400.png', dataAiHint: 'paneer tikka', userId: OTHER_USER_ID },
  { id: '10', name: 'Chicken Wings', description: 'Spicy buffalo wings with dip.', price: 320, category: 'Starters', imageUrl: 'https://placehold.co/600x400.png', dataAiHint: 'chicken wings', userId: OTHER_USER_ID },
];

const generateRandomDate = (daysAgo: number) => {
    const day = subDays(new Date(), Math.floor(Math.random() * daysAgo));
    const hour = Math.floor(Math.random() * 24);
    return subHours(day, hour).toISOString();
};

const getRandomItemsForOrder = (userId: string): OrderItem[] => {
    const userMenu = mockMenuItems.filter(item => item.userId === userId);
    const orderItems: OrderItem[] = [];
    const numItems = Math.floor(Math.random() * 3) + 1;

    for (let i = 0; i < numItems; i++) {
        const item = userMenu[Math.floor(Math.random() * userMenu.length)];
        const existing = orderItems.find(oi => oi.id === item.id);
        if (!existing) {
            orderItems.push({ ...item, quantity: Math.floor(Math.random() * 2) + 1 });
        }
    }
    return orderItems;
};

const customerProfiles: { phone: string, buildings?: {building: string, flat: string}[] }[] = [
    { phone: "+919876543210", buildings: [{building: "Tower A", flat: "101"}, {building: "Tower B", flat: "503"}] },
    { phone: "+919876543211" },
    { phone: "+919876543212", buildings: [{building: "Green View Apartments", flat: "202"}] },
    { phone: "+919876543213" },
    { phone: "+919876543214", buildings: [{building: "Sunset Villas", flat: "12"}] },
];

const orderTypes: OrderType[] = ['delivery', 'dine-in'];
const orderStatuses: Order['status'][] = ['completed', 'pending', 'confirmed', 'cancelled', 'delivered'];

export const mockOrders: Order[] = Array.from({ length: 50 }, (_, i) => {
  const assignedUserId = DEMO_USER_ID; 
  const items = getRandomItemsForOrder(assignedUserId);
  const totalCost = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  const customerProfile = customerProfiles[i % customerProfiles.length];
  const type = orderTypes[i % orderTypes.length];

  let customerDetails: CustomerDetails;
  if (type === 'delivery' && customerProfile.buildings && customerProfile.buildings.length > 0) {
      const address = customerProfile.buildings[0];
      customerDetails = { phone: customerProfile.phone, building: address.building, flat: address.flat };
  } else { // Dine-in or delivery for customer with no saved address
      customerDetails = { phone: customerProfile.phone, tableNumber: type === 'dine-in' ? ((i % 12) + 1).toString() : undefined };
  }

  return {
    id: `ORD-${1001 + i}`,
    type,
    customerDetails,
    items,
    totalCost,
    status: i < 40 ? 'completed' : orderStatuses[i % orderStatuses.length], // most are completed
    createdAt: generateRandomDate(30), // orders within the last 30 days
    userId: assignedUserId,
  };
});

  