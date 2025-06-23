
"use client";

import type { MenuItem } from '@/types';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { useEffect, useState } from 'react';
import { useToast } from "@/hooks/use-toast";

const menuItemFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  price: z.preprocess(
    (val) => (typeof val === 'string' ? parseFloat(val) : val),
    z.number({ invalid_type_error: "Price must be a number" }).positive("Price must be a positive number")
  ),
  category: z.string().min(1, "Category is required"),
  portion: z.string().optional(),
  imageUrl: z.string().url("Must be a valid URL").optional().or(z.literal('')),
  dataAiHint: z.string().optional(),
});

export type MenuItemFormData = z.infer<typeof menuItemFormSchema>;

interface MenuItemFormDialogProps {
  mode: 'add' | 'edit';
  initialData?: MenuItem | null;
  onSave: (data: MenuItemFormData, id?: string) => Promise<void>;
  triggerButton: React.ReactNode;
}

export default function MenuItemFormDialog({ mode, initialData, onSave, triggerButton }: MenuItemFormDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MenuItemFormData>({
    resolver: zodResolver(menuItemFormSchema),
    defaultValues: initialData ? {
      ...initialData,
      portion: initialData.portion || '',
      imageUrl: initialData.imageUrl || '',
      description: initialData.description || '',
      dataAiHint: initialData.dataAiHint || '',
    } : {
      name: '',
      description: '',
      price: 0,
      category: '',
      portion: '',
      imageUrl: '',
      dataAiHint: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && initialData) {
        reset({
          ...initialData,
          portion: initialData.portion || '',
          imageUrl: initialData.imageUrl || '',
          description: initialData.description || '',
          dataAiHint: initialData.dataAiHint || '',
        });
      } else if (mode === 'add') {
        reset({ name: '', description: '', price: 0, category: '', portion: '', imageUrl: '', dataAiHint: '' });
      }
    }
  }, [isOpen, mode, initialData, reset]);

  const onSubmit = async (data: MenuItemFormData) => {
    try {
      await onSave(data, initialData?.id);
      setIsOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${mode === 'add' ? 'add' : 'update'} menu item. ${(error as Error).message}`,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{triggerButton}</DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>{mode === 'add' ? 'Add New' : 'Edit'} Menu Item</DialogTitle>
            <DialogDescription>
              {mode === 'add' ? 'Fill in the details for the new menu item.' : 'Update the details of the menu item.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <Input id="name" {...register("name")} className="col-span-3" />
              {errors.name && <p className="col-span-4 text-red-500 text-sm text-right">{errors.name.message}</p>}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">Description</Label>
              <Textarea id="description" {...register("description")} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">Price</Label>
              <Input id="price" type="number" step="0.01" {...register("price")} className="col-span-3" />
              {errors.price && <p className="col-span-4 text-red-500 text-sm text-right">{errors.price.message}</p>}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">Category</Label>
              <Input id="category" {...register("category")} className="col-span-3" />
              {errors.category && <p className="col-span-4 text-red-500 text-sm text-right">{errors.category.message}</p>}
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="portion" className="text-right">Portion</Label>
              <Input id="portion" {...register("portion")} className="col-span-3" placeholder="e.g. Full, Half, 250ml" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="imageUrl" className="text-right">Image URL</Label>
              <Input id="imageUrl" {...register("imageUrl")} className="col-span-3" placeholder="https://placehold.co/600x400.png" />
              {errors.imageUrl && <p className="col-span-4 text-red-500 text-sm text-right">{errors.imageUrl.message}</p>}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dataAiHint" className="text-right">AI Hint</Label>
              <Input id="dataAiHint" {...register("dataAiHint")} className="col-span-3" placeholder="e.g., pizza pepperoni" />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (mode === 'add' ? 'Adding...' : 'Saving...') : (mode === 'add' ? 'Add Item' : 'Save Changes')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
