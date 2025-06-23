
"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, Loader2 } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';

interface TableSelectorProps {
  selectedTable: string | null;
  onSelectTable: (tableNumber: string) => void;
}

export default function TableSelector({
  selectedTable,
  onSelectTable,
}: TableSelectorProps) {
  const { settings, isLoading } = useSettings();
  const tableCount = settings.tableCount || 12;

  const tables = Array.from({ length: tableCount }, (_, i) => (i + 1).toString());

  if (isLoading) {
      return (
        <div className="flex items-center justify-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
  }

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
