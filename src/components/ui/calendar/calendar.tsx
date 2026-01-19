"use client";

import { useState, useRef } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Check } from "lucide-react";
import { addDays, format } from "date-fns";
import styles from "./styles.module.css";
import './style.modules.css';
import CalendarSvg from "@/Assets/svgs/CalendarSvg";
import DropdownSVG from "@/Assets/svgs/DropdownSVG";

export default function CalendarPicker() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [displayMonth, setDisplayMonth] = useState<Date>(new Date()); // Ensuring a valid initial state
  const [customDate, setCustomDate] = useState("Today");
  const [popoverOpen, setPopoverOpen] = useState(false);
  const monthRef = useRef(null); // Reference for select dropdown
  const yearRef = useRef(null); // Reference for select dropdown
  const years = Array.from({ length: 31 }, (_, i) => 2000 + i);
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const customDates = [
    { label: "Today", value: new Date() },
    { label: "Yesterday", value: addDays(new Date(), -1) },
    { label: "Last Week", value: addDays(new Date(), -7) },
  ];

  // Handle custom date selection
  const handleCustomDate = (label: string, date: Date) => {
    setSelectedDate(date);
    setDisplayMonth(date);
    setCustomDate(label);
  };

  return (
    <div className="flex flex-col items-center space-y-4 z-10 p-4">
      {/* Calendar Popover */}
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={`flex items-center gap-2 px-4 py-2 bg-white ${styles.toggleButton}`}
          >
            <CalendarSvg className="w-5 h-5 text-gray-500" />
            {customDate} {/* Shows selected date label */}
          </Button>
        </PopoverTrigger>

        <PopoverContent className={`w-[320px] p-0 relative ${styles.calendarPopover}`}>
          {/* Header */}
          <div className="flex justify-between p-4 items-center">
            <div>
              <h2 className="text-[20px] font-[600] text-[#24282E]">Calendar</h2>
              <p className="text-[14px] font-[500] text-[#727A90]">Lorem ipsum dolor</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-gray-500">
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white">
                <DropdownMenuItem className="text-gray-700">Settings</DropdownMenuItem>
                <DropdownMenuItem className="text-gray-700">Help</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <hr className="mb-4" />
          {/* Month & Year Selectors */}
          <div className="flex justify-between px-4 items-center">
            <div className="relative inline-flex items-center gap-2">
              <select
                ref={monthRef}
                value={months[displayMonth.getMonth()]}
                onChange={(e) => {
                  const newMonth = months.indexOf(e.target.value);
                  const newDate = new Date(displayMonth.getFullYear(), newMonth, 1);
                  setDisplayMonth(newDate);
                }}
                className="text-sm font-medium p-1 bg-transparent border-none focus:outline-none 
                   appearance-none pr-6 cursor-pointer"
              >
                {months.map((month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </select>
              <div
                className="absolute right-0 cursor-pointer"
                onClick={() => monthRef.current?.click()}
              >
                <DropdownSVG />
              </div>
            </div>

            <div className="relative inline-flex items-center gap-2">
              <select
                ref={yearRef}
                value={displayMonth.getFullYear()}
                onChange={(e) => {
                  const newYear = Number(e.target.value);
                  const newDate = new Date(newYear, displayMonth.getMonth(), 1);
                  setDisplayMonth(newDate);
                }}
                className="text-sm font-medium p-1 bg-transparent border-none focus:outline-none 
                   appearance-none pr-6 cursor-pointer"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              <div
                className="absolute right-0 cursor-pointer"
                onClick={() => yearRef.current?.click()}
              >
                <DropdownSVG />
              </div>
            </div>
          </div>

          {/* Calendar */}
          <div className="bg-red p-4">
            <Calendar
              mode="single"
              classNames={{
                day: "custom-day",
                day_selected: "selected-date",
                head: "custom-head",
              }}
              selected={selectedDate}
              onSelect={(date) => {
                if (date) handleCustomDate(format(date, "PPP"), date);
              }}
              month={displayMonth}
              onMonthChange={setDisplayMonth}
            />
          </div>
          <hr className="mb-4" />
          {/* Custom Date Options */}
          <div className="px-4 pb-4">
            <h3 className="text-[16px] font-[600] text-[#24282E]">Custom Dates</h3>
            <div className="mt-2 space-y-2">
              {customDates.map(({ label, value }) => (
                <Button
                  key={label}
                  variant="outline"
                  className={styles.customDateButton}
                  onClick={() => handleCustomDate(label, value)}
                >
                  <span>{label}</span>
                  {customDate === label && (
                    <Check className="w-4 h-4" />
                  )}
                </Button>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}