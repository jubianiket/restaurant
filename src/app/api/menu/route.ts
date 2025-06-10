
import { NextResponse } from 'next/server';
import { getMenuItems } from '@/lib/menuService'; // Use the primary getMenuItems
import type { MenuItem } from '@/types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      // Fallback: if no specific userId is provided, return the menu for "admin@example.com"
      // This could be an empty array or an error if a specific user context is always required.
      const defaultMenuItems = getMenuItems("admin@example.com");
      return NextResponse.json(defaultMenuItems);
    }

    const menuItems: MenuItem[] = getMenuItems(userId);
    return NextResponse.json(menuItems);
  } catch (error) {
    console.error("Failed to fetch menu items:", error);
    return NextResponse.json({ message: "Failed to load menu items" }, { status: 500 });
  }
}

    