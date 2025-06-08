
import { NextResponse } from 'next/server';
import { getMenuItems, addMenuItem } from '@/lib/menuService';
import type { MenuItem } from '@/types';
import { z } from 'zod';

const menuItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  price: z.number().positive("Price must be positive"),
  category: z.string().min(1, "Category is required"),
  imageUrl: z.string().url().optional().or(z.literal('')),
  dataAiHint: z.string().optional(),
});

export async function GET() {
  try {
    const menuItems = getMenuItems();
    return NextResponse.json(menuItems);
  } catch (error) {
    console.error("Failed to fetch menu items for admin:", error);
    return NextResponse.json({ message: "Failed to load menu items" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parseResult = menuItemSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json({ message: "Invalid menu item data", errors: parseResult.error.flatten().fieldErrors }, { status: 400 });
    }
    
    const newItemData = parseResult.data;
    const createdItem = addMenuItem(newItemData);
    return NextResponse.json(createdItem, { status: 201 });
  } catch (error) {
    console.error("Failed to create menu item:", error);
    return NextResponse.json({ message: "Failed to create menu item", error: (error instanceof Error) ? error.message : "Unknown error" }, { status: 500 });
  }
}
