
"use client";

import { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Loader2, Save, PlusCircle, Trash2, Building, Home, FileUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSettings } from '@/hooks/useSettings';
import { useToast } from "@/hooks/use-toast";
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import * as xlsx from 'xlsx';

export default function SettingsPage() {
  const { user, isLoading: authIsLoading } = useAuth();
  const router = useRouter();
  const { settings, setTableCount, addBuilding, removeBuilding, addFlat, removeFlat, setBuildingsAndFlats, isLoading: settingsIsLoading } = useSettings();
  const { toast } = useToast();

  const [localTableCount, setLocalTableCount] = useState<number | string>('');
  const [newBuilding, setNewBuilding] = useState('');
  const [newFlat, setNewFlat] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!authIsLoading && !user) {
      router.replace('/');
    }
  }, [user, authIsLoading, router]);

  useEffect(() => {
    if (settings.tableCount) {
        setLocalTableCount(settings.tableCount);
    }
  }, [settings.tableCount]);

  const handleSaveTableCount = () => {
    const newCount = typeof localTableCount === 'string' ? parseInt(localTableCount, 10) : localTableCount;
    if (isNaN(newCount) || newCount <= 0 || newCount > 100) {
        toast({
            title: "Invalid Number",
            description: "Please enter a valid number of tables between 1 and 100.",
            variant: "destructive"
        });
        return;
    }
    setTableCount(newCount);
    toast({
        title: "Settings Saved",
        description: `Number of tables has been set to ${newCount}.`
    });
  };

  const handleAddBuilding = () => {
    if (!newBuilding.trim()) {
        toast({ title: "Invalid Input", description: "Building name cannot be empty.", variant: "destructive" });
        return;
    }
    addBuilding(newBuilding.trim());
    toast({ title: "Building Added", description: `"${newBuilding.trim()}" has been added.` });
    setNewBuilding('');
  };

  const handleAddFlat = () => {
    if (!newFlat.trim()) {
        toast({ title: "Invalid Input", description: "Flat number cannot be empty.", variant: "destructive" });
        return;
    }
    addFlat(newFlat.trim());
    toast({ title: "Flat Number Added", description: `"${newFlat.trim()}" has been added.` });
    setNewFlat('');
  };
  
  const handleLocationUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                if (!data) throw new Error("File data is empty.");
                
                const workbook = xlsx.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                 if (!sheetName) throw new Error("Excel file has no sheets.");

                const worksheet = workbook.Sheets[sheetName];
                const json = xlsx.utils.sheet_to_json(worksheet) as any[];

                const buildings = new Set<string>();
                const flats = new Set<string>();

                json.forEach((row) => {
                    const building = row['Building'] || row['building'];
                    const flat = row['Flat'] || row['flat'] || row['Flat No'] || row['flat no'];

                    if (building && typeof building === 'string' && building.trim()) {
                        buildings.add(building.trim());
                    }
                    if (flat && (typeof flat === 'string' || typeof flat === 'number') && String(flat).trim()) {
                        flats.add(String(flat).trim());
                    }
                });

                if (buildings.size === 0 && flats.size === 0) {
                    toast({
                        title: "No Data Found",
                        description: "The Excel file is empty or the columns 'Building' and 'Flat' are missing.",
                        variant: "destructive",
                    });
                    return;
                }
                
                setBuildingsAndFlats(Array.from(buildings), Array.from(flats));

                toast({
                    title: "Upload Successful",
                    description: `${buildings.size} buildings and ${flats.size} flats have been updated.`,
                });

            } catch (error) {
                console.error("Excel processing error:", error);
                toast({
                    title: "Processing Failed",
                    description: error instanceof Error ? error.message : "Could not process the Excel file.",
                    variant: "destructive",
                });
            } finally {
                setIsUploading(false);
                event.target.value = '';
            }
        };
        reader.onerror = (err) => {
            console.error("File Read Error:", err);
            toast({
                title: "File Read Error",
                description: "Could not read the uploaded file.",
                variant: "destructive"
            });
            setIsUploading(false);
            event.target.value = '';
        };
        reader.readAsArrayBuffer(file);
    } catch (error) {
         console.error("Upload initiation error:", error);
         toast({
            title: "Upload Failed",
            description: "An unexpected error occurred during upload.",
            variant: "destructive"
        });
        setIsUploading(false);
        event.target.value = '';
    }
  };

  if (authIsLoading || !user || settingsIsLoading) {
    return (
      <div className="flex flex-grow items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto p-4 md:p-8 space-y-6">
        <h1 className="text-3xl md:text-4xl font-headline font-bold text-primary">Settings</h1>
        <p className="text-muted-foreground">Manage your restaurant's operational settings.</p>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Table Management</CardTitle>
                        <CardDescription>Set the total number of tables available for dine-in orders.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-end gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="table-count">Number of Tables</Label>
                                <Input 
                                    id="table-count"
                                    type="number"
                                    value={localTableCount}
                                    onChange={(e) => setLocalTableCount(e.target.value)}
                                    placeholder="e.g., 12"
                                    className="w-48"
                                    min="1"
                                    max="100"
                                />
                            </div>
                            <Button onClick={handleSaveTableCount}>
                                <Save className="mr-2 h-4 w-4" /> Save
                            </Button>
                        </div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Bulk Upload Locations</CardTitle>
                        <CardDescription>
                            Upload an Excel file to replace your current list of buildings and flats.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <Label htmlFor="location-upload" className="flex items-center"><FileUp className="mr-2 h-4 w-4" />Upload Excel File</Label>
                            <Input
                                id="location-upload"
                                type="file"
                                accept=".xlsx, .xls"
                                onChange={handleLocationUpload}
                                disabled={isUploading}
                            />
                            {isUploading && <Loader2 className="h-5 w-5 animate-spin mt-2" />}
                            <p className="text-xs text-muted-foreground pt-1">
                                Your file should contain 'Building' and/or 'Flat' columns. This will replace existing lists.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Delivery Location Management</CardTitle>
                    <CardDescription>Manage the list of buildings and flat numbers for delivery order dropdowns.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Building Management */}
                    <div className="space-y-3">
                        <Label className="text-base font-medium flex items-center"><Building className="mr-2 h-5 w-5"/>Manage Buildings</Label>
                        <div className="flex items-center gap-2">
                            <Input 
                                value={newBuilding}
                                onChange={(e) => setNewBuilding(e.target.value)}
                                placeholder="Enter building name"
                                onKeyDown={(e) => e.key === 'Enter' && handleAddBuilding()}
                            />
                            <Button onClick={handleAddBuilding} size="icon"><PlusCircle className="h-4 w-4"/></Button>
                        </div>
                        <div className="flex flex-wrap gap-2 pt-2 border-t mt-3">
                            {settings.buildings.length > 0 ? settings.buildings.map(b => (
                                <Badge key={b} variant="secondary" className="flex items-center gap-1 text-sm py-1">
                                    {b}
                                    <Button variant="ghost" size="icon" className="h-5 w-5 hover:bg-destructive/20 hover:text-destructive rounded-full" onClick={() => removeBuilding(b)}>
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                </Badge>
                            )) : <p className="text-sm text-muted-foreground">No buildings added yet.</p>}
                        </div>
                    </div>
                    
                    <Separator/>

                    {/* Flat Management */}
                    <div className="space-y-3">
                        <Label className="text-base font-medium flex items-center"><Home className="mr-2 h-5 w-5"/>Manage Flat Numbers</Label>
                         <div className="flex items-center gap-2">
                            <Input 
                                value={newFlat}
                                onChange={(e) => setNewFlat(e.target.value)}
                                placeholder="Enter flat number"
                                onKeyDown={(e) => e.key === 'Enter' && handleAddFlat()}
                            />
                            <Button onClick={handleAddFlat} size="icon"><PlusCircle className="h-4 w-4"/></Button>
                        </div>
                        <div className="flex flex-wrap gap-2 pt-2 border-t mt-3 max-h-40 overflow-y-auto">
                            {settings.flats.length > 0 ? settings.flats.map(f => (
                                <Badge key={f} variant="secondary" className="flex items-center gap-1 text-sm py-1">
                                    {f}
                                    <Button variant="ghost" size="icon" className="h-5 w-5 hover:bg-destructive/20 hover:text-destructive rounded-full" onClick={() => removeFlat(f)}>
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                </Badge>
                            )) : <p className="text-sm text-muted-foreground">No flat numbers added yet.</p>}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </AppLayout>
  );
}
