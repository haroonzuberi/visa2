"use client";
import React, { useState } from "react";
import { X } from "lucide-react";
import styles from "./style.module.css";
import { Button } from "@/components/ui/button";
import { AppDispatch } from "@/store";
import { useDispatch } from "react-redux";
import { filterKanbanData } from "@/store/slices/kanbanSlice";
import { toast } from "react-toastify";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import InputField from "@/components/ui/input/input";

interface FilterUpdateStatusProps {
  onClose: () => void;
}

export default function FilterUpdateStatus({ onClose }: FilterUpdateStatusProps) {
  const dispatch = useDispatch<AppDispatch>();

  const [priority, setPriority] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [text, setText] = useState<string>("");

  const handleFilterApply = () => {
    const filterData: any = {};

    if (priority) filterData.priority = priority;
    if (paymentStatus) filterData.payment_status = paymentStatus;
    if (startDate) filterData.start_date = startDate;
    if (endDate) filterData.end_date = endDate;
    if (text) filterData.application_id = text;

    dispatch(filterKanbanData(filterData));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-h-[90vh]">
        <div className={styles.modalContainer}>
          <div className={styles.modalHeader}>
            <h2 className={styles.modalTitle}>Update Status Filter</h2>
            <button className={styles.closeButton} onClick={onClose}>
              <X size={24} />
            </button>
          </div>

          <div className={styles.modalBody}>
            <form className={styles.form}>
              <div className={styles.formGrid}>
                <div className={styles.formColumn}>
                  {/* ✅ Fixed Select Implementation */}
                  <div className="flex flex-col mb-4">
                    <label
                      htmlFor="role"
                      className="mb-1 text-[16px] font-semibold textblack dark:text-white"
                    >
                      Priority
                    </label>
                    <Select onValueChange={(value) => setPriority(value)}>
                      <SelectTrigger id="priority" className="h-[50px] border border-gray-300 rounded-lg px-3">
                        <SelectValue placeholder="Select an option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Payment Status */}
                  <div className="flex flex-col gap-1">
                    <label htmlFor="paymentStatus" className="text-[15px] font-medium text-black dark:text-white">
                      Payment Status
                    </label>
                    <Select onValueChange={(value) => setPaymentStatus(value)}>
                      <SelectTrigger id="paymentStatus" className="h-[50px] border border-gray-300 rounded-lg px-3">
                        <SelectValue placeholder="Select an option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="refunded">Refunded</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Applicant Id */}
                  <div className="flex flex-col gap-1">
                    <label htmlFor="applicantId" className="text-[15px] font-medium text-black dark:text-white">
                      Applicant ID
                    </label>
                    <input
                      id="applicantId"
                      type="text"
                      placeholder="Enter ID"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      className="h-[50px] px-3 border border-gray-300 rounded-lg text-black text-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div className="flex flex-col gap-4">
                  {/* Start Date */}
                  <div className="flex flex-col gap-1">
                    <label htmlFor="startDate" className="text-[15px] font-medium text-black dark:text-white">
                      Start Date
                    </label>
                    <input
                      type="date"
                      id="startDate"
                      value={startDate || ""}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="h-[50px] px-3 border border-gray-300 rounded-lg text-black text-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>

                  {/* End Date */}
                  <div className="flex flex-col gap-1">
                    <label htmlFor="endDate" className="text-[15px] font-medium text-black dark:text-white">
                      End Date
                    </label>
                    <input
                      type="date"
                      id="endDate"
                      value={endDate || ""}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="h-[50px] px-3 border border-gray-300 rounded-lg text-black text-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="w-full mt-4">
                <Button
                  onClick={handleFilterApply}
                  className={`${styles.filtersButton} bg-blue-500 text-white hover:bg-blue-600 w-full`}
                >
                  Apply Filter
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
