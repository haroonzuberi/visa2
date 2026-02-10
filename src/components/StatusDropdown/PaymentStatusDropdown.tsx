"use client";

import { useState, useRef, useLayoutEffect } from "react";
import { ChevronDown } from "lucide-react";
import { putAPIWithAuth } from "@/utils/api";
import { toast } from "react-toastify";

const PAYMENT_STATUS_OPTIONS = ["pending", "paid", "refunded", "cancelled"] as const;

type PaymentStatus = (typeof PAYMENT_STATUS_OPTIONS)[number];

interface PaymentStatusDropdownProps {
  status: string;
  applicationId: string | number;
  onStatusChange?: (newStatus: PaymentStatus) => void;
  className?: string;
}

const formatStatus = (status: string) =>
  status.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

const getPaymentStatusStyle = (status: string) => {
  switch (status.toLowerCase()) {
    case "paid":
      return "bg-[#ECFBF3] text-[#42DA82] text-[10px] font-[600] border-[1px] rounded-[100px] text-nowrap border-[#42DA82]";
    case "refunded":
      return "bg-[#E6F5FE] text-[#019BF4] text-[10px] font-[600] border-[1px] rounded-[100px] text-nowrap border-[#B0E0FC]";
    case "cancelled":
      return "bg-[#FDEDED] text-[#D32F2F] text-[10px] font-[600] border-[1px] rounded-[100px] text-nowrap border-[#F5C6C6]";
    case "pending":
    default:
      return "bg-[#F3F4F6] text-[#6B7280] text-[10px] font-[600] border-[1px] rounded-[100px] text-nowrap border-[#D1D5DB]";
  }
};

export default function PaymentStatusDropdown({
  status = "pending",
  applicationId,
  onStatusChange,
  className = "",
}: PaymentStatusDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(status as PaymentStatus);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    openUpward: false,
  });
  const buttonRef = useRef<HTMLButtonElement>(null);

  useLayoutEffect(() => {
    if (!isOpen || !buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const dropdownHeight = 200;
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUpward = spaceBelow < dropdownHeight && rect.top > spaceBelow;
    setDropdownPosition({
      top: openUpward ? rect.top : rect.bottom,
      left: rect.left,
      openUpward,
    });
  }, [isOpen]);

  // Keep local status in sync if parent changes it externally
  if (status !== currentStatus) {
    // simple sync without causing re-render loops
    // eslint-disable-next-line react-hooks/rules-of-hooks
    setCurrentStatus(status as PaymentStatus);
  }

  const handleStatusChange = async (newStatus: PaymentStatus) => {
    if (newStatus === currentStatus || isUpdating) return;

    setIsUpdating(true);
    try {
      const response: any = await putAPIWithAuth(`applications/${applicationId}`, {
        payment_status: newStatus,
      });

      if (response?.success) {
        toast.success("Payment status updated successfully");
        setCurrentStatus(newStatus);
        onStatusChange?.(newStatus);
      } else {
        toast.error(
          response?.data?.message || "Failed to update payment status"
        );
      }
    } catch (error: any) {
      console.error("Error updating payment status:", error);
      toast.error(error?.message || "Failed to update payment status");
    } finally {
      setIsUpdating(false);
      setIsOpen(false);
    }
  };

  const displayStatus = currentStatus || "pending";

  return (
    <div className={`relative ${className}`}>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        disabled={isUpdating}
        className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${getPaymentStatusStyle(
          displayStatus
        )} ${
          isUpdating ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
        }`}
      >
        {formatStatus(displayStatus)}
        <ChevronDown className="w-3 h-3" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-[100]"
            onClick={() => setIsOpen(false)}
          />
          <div
            className="fixed z-[101] bg-white border border-gray-200 rounded-lg shadow-lg w-max min-w-[140px] max-w-[180px] max-h-52 overflow-y-auto"
            style={{
              left: dropdownPosition.left,
              top: dropdownPosition.openUpward
                ? "auto"
                : dropdownPosition.top + 4,
              bottom: dropdownPosition.openUpward
                ? window.innerHeight - dropdownPosition.top + 4
                : "auto",
            }}
          >
            {PAYMENT_STATUS_OPTIONS.map((option) => (
              <button
                key={option}
                onClick={() => handleStatusChange(option)}
                disabled={isUpdating}
                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${
                  option === displayStatus
                    ? "bg-[#42DA82] text-white hover:bg-[#38C572]"
                    : "text-gray-700"
                } ${
                  isUpdating ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                }`}
              >
                {formatStatus(option)}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

