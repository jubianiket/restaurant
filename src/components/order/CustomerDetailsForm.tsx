
"use client";

import type { CustomerDetails, OrderType } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Phone, Building, Home, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSettings } from '@/hooks/useSettings';

interface CustomerDetailsFormProps {
  details: CustomerDetails;
  onDetailsChange: (details: CustomerDetails) => void;
  orderType: OrderType | null;
}

export default function CustomerDetailsForm({ details, onDetailsChange, orderType }: CustomerDetailsFormProps) {
  const { settings, isLoading } = useSettings();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onDetailsChange({ ...details, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name: 'building' | 'flat') => (value: string) => {
    onDetailsChange({ ...details, [name]: value });
  };

  if (orderType !== 'delivery') {
    return null;
  }
  
  if (isLoading) {
    return (
        <Card className="shadow-lg">
            <CardContent className="p-6 flex items-center justify-center h-[116px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </CardContent>
        </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row gap-4 sm:items-end">
          <div className="flex-1 space-y-2 min-w-[150px]">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone size={16} /> Phone Number
            </Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="e.g., +12223334444"
              value={details.phone}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="flex-1 space-y-2">
            <Label htmlFor="building" className="flex items-center gap-2">
              <Building size={16} /> Building
            </Label>
            <Select
              name="building"
              value={details.building}
              onValueChange={handleSelectChange('building')}
              required
              disabled={settings.buildings.length === 0}
            >
              <SelectTrigger id="building">
                <SelectValue placeholder="Select building" />
              </SelectTrigger>
              <SelectContent>
                {settings.buildings.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 space-y-2">
            <Label htmlFor="flat" className="flex items-center gap-2">
              <Home size={16} /> Flat No
            </Label>
             <Select
              name="flat"
              value={details.flat}
              onValueChange={handleSelectChange('flat')}
              required
              disabled={settings.flats.length === 0}
            >
              <SelectTrigger id="flat">
                <SelectValue placeholder="Select flat" />
              </SelectTrigger>
              <SelectContent>
                {settings.flats.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
