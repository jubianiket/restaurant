
"use client";

import type { CustomerDetails, OrderType } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Phone, User, MapPin, Hash } from 'lucide-react'; // Added Hash for table number

interface CustomerDetailsFormProps {
  details: CustomerDetails;
  onDetailsChange: (details: CustomerDetails) => void;
  orderType: OrderType | null;
}

export default function CustomerDetailsForm({ details, onDetailsChange, orderType }: CustomerDetailsFormProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onDetailsChange({ ...details, [e.target.name]: e.target.value });
  };

  return (
    <Card className="shadow-lg">
      <CardContent className="p-6 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name" className="flex items-center gap-2 text-base">
            <User size={18} /> Name
          </Label>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder="Enter customer name"
            value={details.name}
            onChange={handleChange}
            required
            className="text-base"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone" className="flex items-center gap-2 text-base">
            <Phone size={18} /> Phone Number
          </Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            placeholder="e.g., +12223334444 (E.164 format)"
            value={details.phone}
            onChange={handleChange}
            required
            className="text-base"
          />
        </div>
        {orderType === 'delivery' && (
          <div className="space-y-2">
            <Label htmlFor="address" className="flex items-center gap-2 text-base">
              <MapPin size={18} /> Delivery Address
            </Label>
            <Input
              id="address"
              name="address"
              type="text"
              placeholder="Enter delivery address"
              value={details.address ?? ''}
              onChange={handleChange}
              required={orderType === 'delivery'}
              className="text-base"
            />
          </div>
        )}
        {orderType === 'dine-in' && (
          <div className="space-y-2">
            <Label htmlFor="tableNumber" className="flex items-center gap-2 text-base">
              <Hash size={18} /> Table Number
            </Label>
            <Input
              id="tableNumber"
              name="tableNumber"
              type="text"
              placeholder="Enter table number"
              value={details.tableNumber ?? ''}
              onChange={handleChange}
              required={orderType === 'dine-in'}
              className="text-base"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
