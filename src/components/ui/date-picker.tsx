
import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';

interface DatePickerWithRangeProps {
  date: { from: Date; to: Date };
  onDateChange: (range: { from: Date; to: Date } | undefined) => void;
}

export const DatePickerWithRange: React.FC<DatePickerWithRangeProps> = ({ date, onDateChange }) => {
  const handleFromDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    onDateChange({ from: newDate, to: date.to });
  };

  const handleToDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    onDateChange({ from: date.from, to: newDate });
  };

  return (
    <div className="flex items-center gap-2">
      <Calendar className="h-4 w-4" />
      <input
        type="date"
        value={date.from.toISOString().split('T')[0]}
        onChange={handleFromDateChange}
        className="px-3 py-1 border rounded"
      />
      <span>to</span>
      <input
        type="date"
        value={date.to.toISOString().split('T')[0]}
        onChange={handleToDateChange}
        className="px-3 py-1 border rounded"
      />
    </div>
  );
};
