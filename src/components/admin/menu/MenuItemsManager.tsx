
"use client";

import { useEffect, useState, useCallback } from 'react';
import type { MenuItem } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from '@/components/ui/label';
import { toast } from "@/hooks/use-toast";
import { PlusCircle, Edit, Trash2, Upload, Loader2, AlertTriangle, FileText, ListFilter, UserX, QrCode } from 'lucide-react';
import MenuItemFormDialog, { type MenuItemFormData } from './MenuItemFormDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { QRCodeSVG } from 'qrcode.react';

export default function MenuItemsManager() {
  const { user, isLoading: authLoading } = useAuth();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [publicMenuUrl, setPublicMenuUrl] = useState<string | null>(null);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && user?.email && menuItems.length > 0) {
      setPublicMenuUrl(`${window.location.origin}/menu/${encodeURIComponent(user.email)}`);
    } else {
      setPublicMenuUrl(null);
    }
  }, [user, menuItems]);

  const fetchMenuItems = useCallback(async () => {
    if (!user || !user.email) {
      if (!authLoading) {
          setError("You must be logged in to manage menu items.");
          setIsLoading(false);
          setMenuItems([]);
      }
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/menu/items?userId=${encodeURIComponent(user.email)}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch your menu items');
      }
      const data: MenuItem[] = await response.json();
      setMenuItems(data);
    } catch (err) {
      setError((err as Error).message);
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [user, authLoading, toast]);

  useEffect(() => {
    if (hasMounted) {
      fetchMenuItems();
    }
  }, [fetchMenuItems, hasMounted]);

  const handleSaveMenuItem = async (data: MenuItemFormData, id?: string) => {
    if (!user || !user.email) {
      toast({ title: "Error", description: "You must be logged in.", variant: "destructive" });
      throw new Error("User not authenticated");
    }
    const url = id ? `/api/admin/menu/items/${id}` : '/api/admin/menu/items';
    const method = id ? 'PUT' : 'POST';

    const payload = { ...data, userId: user.email };

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${id ? 'update' : 'add'} item`);
      }
      toast({ title: "Success", description: `Menu item ${id ? 'updated' : 'added'} successfully.` });
      await fetchMenuItems();
    } catch (err) {
      console.error("Save error:", err);
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
      throw err;
    }
  };

  const handleDeleteMenuItem = async (id: string) => {
    if (!user || !user.email) {
      toast({ title: "Error", description: "You must be logged in.", variant: "destructive" });
      return;
    }
    try {
      const response = await fetch(`/api/admin/menu/items/${id}?userId=${encodeURIComponent(user.email)}`, { method: 'DELETE' });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete item');
      }
      toast({ title: "Success", description: "Menu item deleted successfully." });
      await fetchMenuItems();
    } catch (err) {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    }
  };

  const handleExcelUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !user.email) {
      toast({ title: "Error", description: "You must be logged in to upload.", variant: "destructive" });
      return;
    }
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', user.email);

    try {
      const response = await fetch('/api/admin/menu/upload', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Failed to upload Excel file.');
      }
      toast({ title: "Success", description: result.message });
      if (result.warnings && result.warnings.length > 0) {
        toast({
            title: "Upload Warnings",
            description: (
                <div className="max-h-40 overflow-y-auto">
                    {result.warnings.map((warn: string, i: number) => <p key={i} className="text-xs">{warn}</p>)}
                </div>
            ),
            variant: "default",
            duration: 10000,
         });
      }
      await fetchMenuItems();
    } catch (err) {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  if (!hasMounted || (isLoading && menuItems.length === 0 && !error) ) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user && !authLoading) {
    return (
        <Card className="border-destructive">
            <CardHeader>
                <CardTitle className="text-destructive flex items-center"><UserX className="mr-2"/> Access Denied</CardTitle>
            </CardHeader>
            <CardContent>
                <p>You need to be logged in to manage menu items. Please log in and try again.</p>
            </CardContent>
        </Card>
    );
  }

  const filteredMenuItems = menuItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center"><FileText className="mr-2" /> Your Menu Items</CardTitle>
            <CardDescription>Add, edit, delete, or bulk upload your menu items using an Excel file.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="relative w-full sm:w-auto">
                 <ListFilter className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                 <Input
                  type="search"
                  placeholder="Filter your items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-full sm:w-80"
                />
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                 <MenuItemFormDialog
                    mode="add"
                    onSave={handleSaveMenuItem}
                    triggerButton={
                      <Button className="w-full sm:w-auto">
                        <PlusCircle size={18} className="mr-2" /> Add New Item
                      </Button>
                    }
                  />
              </div>
            </div>
            <Separator />
             <div>
              <Label htmlFor="excel-upload" className="text-base font-medium block mb-2">Upload Excel File (Replaces Your Current Menu)</Label>
              <div className="flex items-center gap-2">
                  <Input
                      id="excel-upload"
                      type="file"
                      accept=".xlsx, .xls"
                      onChange={handleExcelUpload}
                      disabled={isUploading}
                      className="max-w-xs"
                  />
                  {isUploading && <Loader2 className="h-5 w-5 animate-spin" />}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                  Columns: Name, Price, Category, Portion (optional), Description (optional), ImageUrl (optional), DataAiHint (optional).
              </p>
            </div>
          </CardContent>
        </Card>

        {publicMenuUrl && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center"><QrCode className="mr-2 text-primary"/> Share Your Public Menu</CardTitle>
              <CardDescription>Scan this QR code to view your public menu on any device.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center p-4">
              <div className="bg-white p-3 rounded-lg shadow-md inline-block">
                <QRCodeSVG value={publicMenuUrl} size={192} includeMargin={true} />
              </div>
              <a
                href={publicMenuUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 text-sm text-primary hover:underline break-all text-center"
              >
                {publicMenuUrl}
              </a>
            </CardContent>
          </Card>
        )}
      </div>


      {error && !isLoading && (
         <Card className="border-destructive lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center"><AlertTriangle className="mr-2"/> Error Loading Your Menu</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
            <Button onClick={fetchMenuItems} className="mt-2">Try Again</Button>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && filteredMenuItems.length === 0 && searchTerm && (
        <p className="text-center text-muted-foreground py-4 lg:col-span-3">No items in your menu match "{searchTerm}".</p>
      )}
      {!isLoading && !error && filteredMenuItems.length === 0 && !searchTerm && !publicMenuUrl && (
         <p className="text-center text-muted-foreground py-4 lg:col-span-3">Your menu is empty. Add some items or upload an Excel file.</p>
      )}

      {filteredMenuItems.length > 0 && (
        <Card className="lg:col-span-3">
            <CardHeader>
                <CardTitle>Your Current Menu Items List</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead className="w-16 hidden md:table-cell">Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Portion</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-center w-32">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredMenuItems.map((item) => (
                    <TableRow key={item.id}>
                        <TableCell className="hidden md:table-cell">
                        {item.imageUrl ? (
                            <Image src={item.imageUrl} alt={item.name} width={40} height={40} className="rounded-md object-cover" data-ai-hint={item.dataAiHint || item.category?.toLowerCase() || 'food item'}/>
                        ) : (
                            <div className="w-10 h-10 bg-muted rounded-md flex items-center justify-center text-xs">NoImg</div>
                        )}
                        </TableCell>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell>{item.portion || '-'}</TableCell>
                        <TableCell className="text-right">Rs.{item.price.toFixed(2)}</TableCell>
                        <TableCell className="text-center">
                        <MenuItemFormDialog
                            mode="edit"
                            initialData={item}
                            onSave={handleSaveMenuItem}
                            triggerButton={
                            <Button variant="ghost" size="icon" className="hover:text-primary">
                                <Edit size={16} />
                            </Button>
                            }
                        />
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="hover:text-destructive">
                                <Trash2 size={16} />
                            </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the menu item "{item.name}" from your menu.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteMenuItem(item.id)} className="bg-destructive hover:bg-destructive/90">
                                Delete
                                </AlertDialogAction>
                            </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
