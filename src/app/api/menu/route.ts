
import { NextResponse } from 'next/server';
<<<<<<< HEAD
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
=======
import { getMenuItems } from '@/lib/menuService';
>>>>>>> f50d88f (can you add a function to upload the menu items as excel or manually edi)
import type { MenuItem } from '@/types';

export async function GET() {
  try {
<<<<<<< HEAD
    // Simulate a network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    const menuItems: MenuItem[] = mockMenuItems;
>>>>>>> b395a2a (I see this error with the app, reported by NextJS, please fix it. The er)
=======
    // Simulate a network delay if needed
    // await new Promise(resolve => setTimeout(resolve, 500));
    const menuItems: MenuItem[] = getMenuItems();
>>>>>>> f50d88f (can you add a function to upload the menu items as excel or manually edi)
    return NextResponse.json(menuItems);
  } catch (error) {
    console.error("Failed to fetch menu items:", error);
    return NextResponse.json({ message: "Failed to load menu items" }, { status: 500 });
  }
}
