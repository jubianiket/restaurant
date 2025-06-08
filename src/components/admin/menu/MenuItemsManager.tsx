
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
<<<<<<< HEAD
<<<<<<< HEAD
import { Label } from '@/components/ui/label';
=======
>>>>>>> f50d88f (can you add a function to upload the menu items as excel or manually edi)
=======
import { Label } from '@/components/ui/label';
>>>>>>> 3a25f53 (Console Error)
import { toast } from "@/hooks/use-toast";
import { PlusCircle, Edit, Trash2, Upload, Loader2, AlertTriangle, FileText, ListFilter } from 'lucide-react';
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

export default function MenuItemsManager() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploading, setIsUploading] = useState(false);
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 3a25f53 (Console Error)
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);
<<<<<<< HEAD
=======
>>>>>>> f50d88f (can you add a function to upload the menu items as excel or manually edi)
=======
>>>>>>> 3a25f53 (Console Error)

  const fetchMenuItems = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/menu/items');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch menu items');
      }
      const data: MenuItem[] = await response.json();
      setMenuItems(data);
    } catch (err) {
      setError((err as Error).message);
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 3a25f53 (Console Error)
    if (hasMounted) {
      fetchMenuItems();
    }
  }, [fetchMenuItems, hasMounted]);
<<<<<<< HEAD
=======
    fetchMenuItems();
  }, [fetchMenuItems]);
>>>>>>> f50d88f (can you add a function to upload the menu items as excel or manually edi)
=======
>>>>>>> 3a25f53 (Console Error)

  const handleSaveMenuItem = async (data: MenuItemFormData, id?: string) => {
    const url = id ? `/api/admin/menu/items/${id}` : '/api/admin/menu/items';
    const method = id ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${id ? 'update' : 'add'} item`);
      }
      toast({ title: "Success", description: `Menu item ${id ? 'updated' : 'added'} successfully.` });
      await fetchMenuItems(); // Refresh list
    } catch (err) {
      console.error("Save error:", err);
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
      throw err; // Re-throw to keep dialog open or indicate failure
    }
  };

  const handleDeleteMenuItem = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/menu/items/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete item');
      }
      toast({ title: "Success", description: "Menu item deleted successfully." });
      await fetchMenuItems(); // Refresh list
    } catch (err) {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    }
  };

  const handleExcelUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

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
      event.target.value = ''; // Reset file input
    }
  };

<<<<<<< HEAD
<<<<<<< HEAD
  if (!hasMounted || (isLoading && menuItems.length === 0 && !error) ) {
=======
  const filteredMenuItems = menuItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading && !error && menuItems.length === 0) { // Show full page loader only on initial load
>>>>>>> f50d88f (can you add a function to upload the menu items as excel or manually edi)
=======
  if (!hasMounted || (isLoading && menuItems.length === 0 && !error) ) {
>>>>>>> 3a25f53 (Console Error)
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 3a25f53 (Console Error)
  const filteredMenuItems = menuItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

<<<<<<< HEAD
=======
>>>>>>> f50d88f (can you add a function to upload the menu items as excel or manually edi)
=======
>>>>>>> 3a25f53 (Console Error)
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center"><FileText className="mr-2" /> Menu Item Management</CardTitle>
          <CardDescription>Add, edit, delete, or bulk upload menu items using an Excel file.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="relative w-full sm:w-auto">
               <ListFilter className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
               <Input
                type="search"
                placeholder="Filter items by name or category..."
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
            <Label htmlFor="excel-upload" className="text-base font-medium block mb-2">Upload Excel File</Label>
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
                Replaces entire menu. Columns: Name, Description, Price, Category, ImageUrl (optional), DataAiHint (optional).
            </p>
          </div>
        </CardContent>
      </Card>

      {error && !isLoading && (
         <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center"><AlertTriangle className="mr-2"/> Error Loading Menu</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
            <Button onClick={fetchMenuItems} className="mt-2">Try Again</Button>
          </CardContent>
        </Card>
      )}
      
      {!isLoading && !error && filteredMenuItems.length === 0 && searchTerm && (
        <p className="text-center text-muted-foreground py-4">No menu items match your search term "{searchTerm}".</p>
      )}
      {!isLoading && !error && filteredMenuItems.length === 0 && !searchTerm && (
        <p className="text-center text-muted-foreground py-4">No menu items found. Add some items or upload an Excel file.</p>
      )}

      {filteredMenuItems.length > 0 && (
        <Card>
            <CardHeader>
                <CardTitle>Current Menu Items</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead className="w-16 hidden md:table-cell">Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-center w-32">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredMenuItems.map((item) => (
                    <TableRow key={item.id}>
                        <TableCell className="hidden md:table-cell">
                        {item.imageUrl ? (
                            <Image src={item.imageUrl} alt={item.name} width={40} height={40} className="rounded-md object-cover" data-ai-hint={item.dataAiHint || item.category.toLowerCase()}/>
                        ) : (
                            <div className="w-10 h-10 bg-muted rounded-md flex items-center justify-center text-xs">NoImg</div>
                        )}
                        </TableCell>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
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
                                This action cannot be undone. This will permanently delete the menu item "{item.name}".
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
<<<<<<< HEAD
<<<<<<< HEAD
=======

>>>>>>> f50d88f (can you add a function to upload the menu items as excel or manually edi)
=======
>>>>>>> 3a25f53 (Console Error)
