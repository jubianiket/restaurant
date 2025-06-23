
import { NextResponse } from 'next/server';
import { getMenuItemById, updateMenuItem, deleteMenuItem } from '@/lib/menuService';
import type { MenuItem } from '@/types';
import { z } from 'zod';

const menuItemUpdateSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  description: z.string().optional(),
  price: z.number().positive("Price must be positive").optional(),
  category: z.string().min(1, "Category is required").optional(),
  portion: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
  dataAiHint: z.string().optional(),
});

interface Params {
  params: { itemId: string };
}

export async function GET(request: Request, { params }: Params) {
  try {
    const { itemId } = params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ message: "User ID is required" }, { status: 400 });
    }

    const menuItem = await getMenuItemById(itemId, userId);
    if (!menuItem) {
      return NextResponse.json({ message: "Menu item not found or you don't have permission" }, { status: 404 });
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
    const { userId, ...updatedItemDataFromRequest } = body;

    if (!userId) {
      return NextResponse.json({ message: "User ID is required for updating an item" }, { status: 400 });
    }

    const parseResult = menuItemUpdateSchema.safeParse(updatedItemDataFromRequest);

    if (!parseResult.success) {
      return NextResponse.json({ message: "Invalid menu item data for update", errors: parseResult.error.flatten().fieldErrors }, { status: 400 });
    }

    const validatedData = parseResult.data;
    const updatedItem = await updateMenuItem(itemId, validatedData, userId as string);

    if (!updatedItem) {
      return NextResponse.json({ message: "Menu item not found for update or you don't have permission" }, { status: 404 });
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
    const { searchParams } = new URL(request.url); // userId from query params for DELETE
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ message: "User ID is required for deleting an item" }, { status: 400 });
    }

    const success = await deleteMenuItem(itemId, userId);
    if (!success) {
      return NextResponse.json({ message: "Menu item not found for deletion or you don't have permission" }, { status: 404 });
    }
    return NextResponse.json({ message: "Menu item deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error(`Failed to delete menu item ${params.itemId}:`, error);
    return NextResponse.json({ message: "Failed to delete menu item" }, { status: 500 });
  }
}
