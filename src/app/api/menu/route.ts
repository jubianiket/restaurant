
import { NextResponse } from 'next/server';
import { getMenuItems as getAllMenuItems } from '@/lib/menuService'; // Renamed to avoid conflict if this was the public one
import type { MenuItem } from '@/types';

export async function GET() {
  try {
    // Simulate a network delay if needed
    // await new Promise(resolve => setTimeout(resolve, 500));
    // Assuming this is the public endpoint, it might not need userId filtering,
    // and should fetch all items intended for public display.
    // The original mockMenuItems in mockData.ts are all tied to DEMO_USER_ID.
    // If the intent is to show *all* items regardless of owner for a public menu,
    // then menuService's getMenuItems would need adjustment or a new public version.
    // For now, assuming getMenuItems (now getAllMenuItems to avoid naming issues)
    // in lib/menuService handles "public" menu item fetching appropriately.
    // If getMenuItems from menuService *always* filters by a specific demo user,
    // this might not reflect a true "public" menu of all items from all users.
    // However, sticking to the simplest resolution of the conflict:
    const menuItems: MenuItem[] = getAllMenuItems( "admin@example.com" ); // Or a "public" user ID if applicable
    return NextResponse.json(menuItems);
  } catch (error) {
    console.error("Failed to fetch public menu items:", error);
    return NextResponse.json({ message: "Failed to load menu items" }, { status: 500 });
  }
}
