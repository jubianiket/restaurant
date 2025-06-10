
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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ message: "User ID is required" }, { status: 400 });
    }

    const menuItems = getMenuItems(userId);
    return NextResponse.json(menuItems);
  } catch (error) {
    console.error("Failed to fetch menu items for admin:", error);
    return NextResponse.json({ message: "Failed to load menu items" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // userId is now expected to be part of the top-level body, not menuItemData
    const { userId, ...menuItemData } = body;

    if (!userId) {
      return NextResponse.json({ message: "User ID is required for adding an item" }, { status: 400 });
    }

    const parseResult = menuItemSchema.safeParse(menuItemData);

    if (!parseResult.success) {
      return NextResponse.json({ message: "Invalid menu item data", errors: parseResult.error.flatten().fieldErrors }, { status: 400 });
    }
    
    const newItemData = parseResult.data;
    // Pass userId explicitly to addMenuItem
    const createdItem = addMenuItem(newItemData, userId as string);
    return NextResponse.json(createdItem, { status: 201 });
  } catch (error) {
    console.error("Failed to create menu item:", error);
    return NextResponse.json({ message: "Failed to create menu item", error: (error instanceof Error) ? error.message : "Unknown error" }, { status: 500 });
  }
}
