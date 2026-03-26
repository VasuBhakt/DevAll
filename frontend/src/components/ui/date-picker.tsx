"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
  date?: Date;
  setDate: (date?: Date) => void;
  placeholder?: string;
  className?: string;
}

export function DatePicker({
  date,
  setDate,
  placeholder = "Pick a date",
  className,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div className="relative group">
          <Button
            type="button"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal h-11 bg-background/50 border-border/80 pr-10 hover:bg-background/80 transition-all",
              !date && "text-foreground/30",
              className
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : <span>{placeholder}</span>}
          </Button>
          {date && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDate(undefined);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted transition-colors cursor-pointer"
            >
              <X className="h-3.5 w-3.5 opacity-50" />
            </button>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 rounded-2xl shadow-2xl border-border/40"
        align="start"
      >
        <Calendar
          mode="single"
          selected={date}
          onSelect={(d) => {
            setDate(d);
            setIsOpen(false);
          }}
          disabled={{ after: new Date() }}
          captionLayout="dropdown"
          startMonth={new Date(1900, 0)}
          endMonth={new Date()}
          initialFocus
          className="p-3"
        />
      </PopoverContent>
    </Popover>
  );
}
