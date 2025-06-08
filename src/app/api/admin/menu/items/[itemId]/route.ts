
import { NextResponse } from 'next/server';
import { getMenuItemById, updateMenuItem, deleteMenuItem } from '@/lib/menuService';
import type { MenuItem } from '@/types';
import { z } from 'zod';

const menuItemUpdateSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  description: z.string().optional(),
  price: z.number().positive("Price must be positive").optional(),
  category: z.string().min(1, "Category is required").optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
  dataAiHint: z.string().optional(),
});


interface Params {
  params: { itemId: string };
}

export async function GET(request: Request, { params }: Params) {
  try {
    const { itemId } = params;
    const menuItem = getMenuItemById(itemId);
    if (!menuItem) {
      return NextResponse.json({ message: "Menu item not found" }, { status: 404 });
    }
    return NextResponse.json(menuItem);
  } catch (error) {
    console.error(`Failed to fetch menu item ${params.itemId}:`, error);
    return NextResponse.json({ message: "Failed to load menu item" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const { itemId } = params;
    const body = await request.json();
    const parseResult = menuItemUpdateSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json({ message: "Invalid menu item data for update", errors: parseResult.error.flatten().fieldErrors }, { status: 400 });
    }

    const updatedItemData = parseResult.data;
    const updatedItem = updateMenuItem(itemId, updatedItemData);

    if (!updatedItem) {
      return NextResponse.json({ message: "Menu item not found for update" }, { status: 404 });
    }
    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error(`Failed to update menu item ${params.itemId}:`, error);
    return NextResponse.json({ message: "Failed to update menu item", error: (error instanceof Error) ? error.message : "Unknown error" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    const { itemId } = params;
    const success = deleteMenuItem(itemId);
    if (!success) {
      return NextResponse.json({ message: "Menu item not found for deletion" }, { status: 404 });
    }
    return NextResponse.json({ message: "Menu item deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error(`Failed to delete menu item ${params.itemId}:`, error);
    return NextResponse.json({ message: "Failed to delete menu item" }, { status: 500 });
  }
}
