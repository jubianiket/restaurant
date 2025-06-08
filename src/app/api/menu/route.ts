
import { NextResponse } from 'next/server';
import { getMenuItems } from '@/lib/menuService';
import type { MenuItem } from '@/types';

export async function GET() {
  try {
    // Simulate a network delay if needed
    // await new Promise(resolve => setTimeout(resolve, 500));
    const menuItems: MenuItem[] = getMenuItems();
    return NextResponse.json(menuItems);
  } catch (error) {
    console.error("Failed to fetch menu items:", error);
    return NextResponse.json({ message: "Failed to load menu items" }, { status: 500 });
  }
}
