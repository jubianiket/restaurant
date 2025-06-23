
"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table } from 'lucide-react';

interface TableSelectorProps {
  selectedTable: string | null;
  onSelectTable: (tableNumber: string) => void;
  tableCount?: number;
}

export default function TableSelector({
  selectedTable,
  onSelectTable,
  tableCount = 12,
}: TableSelectorProps) {
  const tables = Array.from({ length: tableCount }, (_, i) => (i + 1).toString());

  return (
    <Card className="shadow-lg">
      <CardContent className="p-6">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
          {tables.map((tableNumber) => (
            <Button
              key={tableNumber}
              variant={selectedTable === tableNumber ? 'default' : 'outline'}
              className="h-20 text-lg flex flex-col gap-1"
              onClick={() => onSelectTable(tableNumber)}
            >
              <Table size={24} />
              <span>{tableNumber}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
