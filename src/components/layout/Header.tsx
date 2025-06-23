
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Home, History, LayoutDashboard, Settings, LogIn, LogOut, UserCircle, Loader2, UserPlus, UtensilsCrossed, PanelLeft } from "lucide-react";


// This component has been repurposed to be the main Sidebar Navigation.
export default function HeaderAsSidebarNav() {
    const { user, logout, isLoading } = useAuth();
    const pathname = usePathname();
    const { toggleSidebar } = useSidebar();
  
    const isActive = (path: string) => pathname === path;

    return (
        <Sidebar>
            <SidebarHeader>
                <Link href={user ? "/create-order" : "/"} className="flex items-center gap-2">
                    <UtensilsCrossed size={28} />
                    <span className="font-headline font-bold text-xl group-data-[collapsible=icon]:hidden">
                        Foodie Orders
                    </span>
                </Link>
            </SidebarHeader>

            <SidebarContent>
                <SidebarMenu>
                    {isLoading ? (
                        <div className="flex justify-center items-center p-4">
                            <Loader2 className="animate-spin" />
                        </div>
                    ) : user ? (
                        <>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={isActive("/create-order")} tooltip={{children: "New Order"}}>
                                    <Link href="/create-order">
                                        <Home />
                                        <span className="group-data-[collapsible=icon]:hidden">New Order</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={isActive("/history")} tooltip={{children: "Order History"}}>
                                    <Link href="/history">
                                        <History />
                                        <span className="group-data-[collapsible=icon]:hidden">Order History</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={isActive("/admin/dashboard")} tooltip={{children: "My Dashboard"}}>
                                    <Link href="/admin/dashboard">
                                        <LayoutDashboard />
                                        <span className="group-data-[collapsible=icon]:hidden">My Dashboard</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={isActive("/admin/menu")} tooltip={{children: "Manage Menu"}}>
                                    <Link href="/admin/menu">
                                        <Settings />
                                        <span className="group-data-[collapsible=icon]:hidden">Manage Menu</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </>
                    ) : (
                        <>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={isActive("/")} tooltip={{children: "Sign In"}}>
                                    <Link href="/">
                                        <LogIn />
                                        <span className="group-data-[collapsible=icon]:hidden">Sign In</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={isActive("/signup")} tooltip={{children: "Sign Up"}}>
                                    <Link href="/signup">
                                        <UserPlus />
                                        <span className="group-data-[collapsible=icon]:hidden">Sign Up</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </>
                    )}
                </SidebarMenu>
            </SidebarContent>

            <SidebarFooter>
                {user && (
                    <div className="flex flex-col gap-2 p-2">
                        <div className="flex items-center gap-2 p-2 rounded-md text-sm">
                            <UserCircle />
                            <span className="truncate group-data-[collapsible=icon]:hidden">{user.email}</span>
                        </div>
                        <SidebarMenuButton onClick={logout} variant="outline" className="w-full justify-start">
                            <LogOut />
                            <span className="group-data-[collapsible=icon]:hidden">Sign Out</span>
                        </SidebarMenuButton>
                    </div>
                )}
                <div className="hidden border-t border-sidebar-border md:block">
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton onClick={toggleSidebar}>
                                <PanelLeft />
                                <span className="group-data-[collapsible=icon]:hidden">
                                    Collapse
                                </span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}
