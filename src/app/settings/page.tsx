
"use client";

import { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Loader2, Save } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSettings } from '@/hooks/useSettings';
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const { user, isLoading: authIsLoading } = useAuth();
  const router = useRouter();
  const { settings, setTableCount, isLoading: settingsIsLoading } = useSettings();
  const { toast } = useToast();

  const [localTableCount, setLocalTableCount] = useState<number | string>('');

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

  const handleSave = () => {
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
                    <Button onClick={handleSave}>
                        <Save className="mr-2 h-4 w-4" /> Save
                    </Button>
                </div>
            </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
