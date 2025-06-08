
import { NextResponse } from 'next/server';
<<<<<<< HEAD
import { getMenuItems } from '@/lib/menuService';
import type { MenuItem } from '@/types';

export async function GET() {
  try {
    // Simulate a network delay if needed
    // await new Promise(resolve => setTimeout(resolve, 500));
    const menuItems: MenuItem[] = getMenuItems();
=======
import { mockMenuItems } from '@/lib/mockData';
import type { MenuItem } from '@/types';

export async function GET() {
  // In a real application, you would fetch data from your database here.
  // For example, using Prisma, Supabase, or any other ORM/client.
  // const menuItemsFromDb = await db.menuItem.findMany();
  // For now, we're returning mock data.
  try {
    // Simulate a network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    const menuItems: MenuItem[] = mockMenuItems;
>>>>>>> b395a2a (I see this error with the app, reported by NextJS, please fix it. The er)
    return NextResponse.json(menuItems);
  } catch (error) {
    console.error("Failed to fetch menu items:", error);
    return NextResponse.json({ message: "Failed to load menu items" }, { status: 500 });
  }
}
