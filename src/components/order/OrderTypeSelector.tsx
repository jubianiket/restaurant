"use client";

import type { OrderType } from '@/types';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck, Utensils, ShoppingBag } from 'lucide-react';

interface OrderTypeSelectorProps {
  selectedType: OrderType | null;
  onSelectType: (type: OrderType) => void;
}

const orderTypeOptions = [
  { value: 'delivery' as OrderType, label: 'Delivery', Icon: Truck },
  { value: 'dine-in' as OrderType, label: 'Dine-in', Icon: Utensils },
  { value: 'take-away' as OrderType, label: 'Take Away', Icon: ShoppingBag },
];

export default function OrderTypeSelector({ selectedType, onSelectType }: OrderTypeSelectorProps) {
  return (
    <Card className="shadow-lg">
      <CardContent className="p-6">
        <RadioGroup
          value={selectedType ?? undefined}
          onValueChange={(value) => onSelectType(value as OrderType)}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {orderTypeOptions.map(({ value, label, Icon }) => (
            <Label
              key={value}
              htmlFor={`orderType-${value}`}
              className={`flex flex-col items-center justify-center p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md
                ${selectedType === value ? 'border-primary ring-2 ring-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}
            >
              <RadioGroupItem value={value} id={`orderType-${value}`} className="sr-only" />
              <Icon className={`mb-2 h-8 w-8 ${selectedType === value ? 'text-primary' : 'text-foreground/70'}`} />
              <span className={`text-lg font-medium ${selectedType === value ? 'text-primary' : 'text-foreground'}`}>{label}</span>
            </Label>
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  );
}
