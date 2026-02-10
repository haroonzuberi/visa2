"use client";

import { useState, useRef, useLayoutEffect } from "react";
import { ChevronDown } from "lucide-react";
import { putAPIWithAuth } from "@/utils/api";
import { toast } from "react-toastify";

// All allowed visa_status values from backend
export const STATUS_OPTIONS = [
  "new",
  "ready_to_apply",
  "have_issues",
  "need_gov_fee",
  "gov_fee_paid",
  "approved",
  "rejected",
  "cancelled",
  "temp_id_saved",
  "ready_for_payment",
  "payment_pending",
  "payment_verified",
  "under_process",
  "granted",
  "visa_delivered",
];

const formatStatus = (status: string) =>
  status.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

const getStatusStyle = (status: string) => {
  switch (status.toLowerCase()) {
    case "new":
    case "have_issues":
    case "need_to_pay_gov_fee":
    case "need_gov_fee":
      return "bg-[#feefec] text-[#F05D3D] text-[10px] font-[600] border-[1px] rounded-[100px] text-nowrap border-[#FACDC3]";
    case "gov_fee_paid":
    case "payment_verified":
    case "granted":
    case "visa_delivered":
      return "bg-[#ECFBF3] text-[#42DA82] text-[10px] font-[600] border-[1px] rounded-[100px] text-nowrap border-[#42DA82]";
    case "cancelled":
    case "approved":
      return "bg-[#E6F4F5] text-[#009499] text-[10px] font-[600] border-[1px] rounded-[100px] text-nowrap border-[#B0DEDF]";
    case "ready_to_apply":
    case "ready_for_payment":
    case "under_process":
    case "payment_pending":
      return "bg-[#E6F5FE] text-[#019BF4] text-[10px] font-[600] border-[1px] rounded-[100px] text-nowrap border-[#B0E0FC]";
    case "rejected":
      return "bg-[#FDEDED] text-[#D32F2F] text-[10px] font-[600] border-[1px] rounded-[100px] text-nowrap border-[#F5C6C6]";
    case "temp_id_saved":
      return "bg-[#FFF4E6] text-[#F59E0B] text-[10px] font-[600] border-[1px] rounded-[100px] text-nowrap border-[#FDE68A]";
    default:
      return "bg-[#F3F4F6] text-[#6B7280] text-[10px] font-[600] border-[1px] rounded-[100px] text-nowrap border-[#D1D5DB]";
  }
};

interface StatusDropdownProps {
  status: string;
  applicationId: number;
  onStatusChange?: (newStatus: string) => void;
  className?: string;
}

export default function StatusDropdown({
  status = "",
  applicationId,
  onStatusChange,
  className = "",
}: StatusDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, openUpward: false });
  const buttonRef = useRef<HTMLButtonElement>(null);

  useLayoutEffect(() => {
    if (!isOpen || !buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const dropdownHeight = 240;
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUpward = spaceBelow < dropdownHeight && rect.top > spaceBelow;
    setDropdownPosition({
      top: openUpward ? rect.top : rect.bottom,
      left: rect.left,
      openUpward,
    });
  }, [isOpen]);

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === status || isUpdating) return;

    setIsUpdating(true);
    try {
      const response: any = await putAPIWithAuth("update-application-status", {
        id: applicationId,
        new_status: newStatus,
      });

      if (response?.success) {
        toast.success("Status updated successfully");
        onStatusChange?.(newStatus);
      } else {
        toast.error(response?.data?.message || "Failed to update status");
      }
    } catch (error: any) {
      console.error("Error updating status:", error);
      toast.error(error?.message || "Failed to update status");
    } finally {
      setIsUpdating(false);
      setIsOpen(false);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        disabled={isUpdating}
        className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${getStatusStyle(status)} ${isUpdating ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      >
        {formatStatus(status)}
        <ChevronDown className="w-3 h-3" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[100]" onClick={() => setIsOpen(false)} />
          <div
            className="fixed z-[101] bg-white border border-gray-200 rounded-lg shadow-lg w-max min-w-[140px] max-w-[180px] max-h-60 overflow-y-auto"
            style={{
              left: dropdownPosition.left,
              top: dropdownPosition.openUpward ? "auto" : dropdownPosition.top + 4,
              bottom: dropdownPosition.openUpward ? window.innerHeight - dropdownPosition.top + 4 : "auto",
            }}
          >
            {STATUS_OPTIONS.map((option) => (
              <button
                key={option}
                onClick={() => handleStatusChange(option)}
                disabled={isUpdating}
                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${
                  option === status ? "bg-[#42DA82] text-white hover:bg-[#38C572]" : "text-gray-700"
                } ${isUpdating ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
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
