
export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  portion?: string; // e.g., 'Half', 'Full', 'Regular'
  imageUrl?: string;
  dataAiHint?: string;
  userId?: string; // Email of the user who owns the menu item
}

export type OrderType = 'delivery' | 'dine-in'; // Removed 'take-away'

export interface OrderItem extends MenuItem {
  quantity: number;
}

export interface CustomerDetails {
  name?: string; // No longer required for delivery
  phone: string;
  building?: string;
  flat?: string;
  tableNumber?: string;
}

export interface Order {
  id: string;
  type: OrderType;
  customerDetails: CustomerDetails;
  items: OrderItem[];
  totalCost: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'completed' | 'cancelled';
  createdAt: string; // ISO date string
  userId?: string; // Email of the user who placed the order
}

export interface AuthUser {
  email: string;
  name?: string; // Add name to AuthUser
}

export interface StoredUser extends AuthUser {
  passwordHash: string; // In a real app, this would be a hash
}
