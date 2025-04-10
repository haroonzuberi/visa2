"use client";
import React, { useState } from "react";
import { X } from "lucide-react";
import styles from "./style.module.css";
import DropDown from "@/components/ui/dropdown/page";
import InputField from "@/components/ui/input/input";
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

interface FilterUpdateStatusProps {
  onClose: () => void;
}

export default function FilterUpdateStatus({
  onClose,
}: FilterUpdateStatusProps) {
  const dispatch = useDispatch<AppDispatch>();

  // State for the selected values
  const [priority, setPriority] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [text, setText] = useState<string>("");

  // Handler for form submission
  const handleFilterApply = () => {
    const filterData: any = {};

    if (priority) filterData.priority = priority;
    if (paymentStatus) filterData.payment_status = paymentStatus;
    if (startDate) filterData.start_date = startDate;
    if (endDate) filterData.end_date = endDate;
    if (text) filterData.applicant_id = text;

    dispatch(filterKanbanData(filterData));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-h-[90vh]">
        <div className={styles.modalContainer}>
          <div className={styles.modalHeader}>
            <h2 className={styles.modalTitle}>Filter Kanbans</h2>
            <button className={styles.closeButton} onClick={onClose}>
              <X size={24} />
            </button>
          </div>

          <div className={styles.modalBody}>
            <form className={styles.form} onSubmit={(e) => {
                e.preventDefault();

                if (
                  !priority &&
                  !paymentStatus &&
                  !startDate &&
                  !endDate &&
                  !text
                ) {
                  toast.error("You have not selected any filter field.");
                  return;
                }

                handleFilterApply();
              }}>
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
                      <SelectTrigger id="role" className={styles.select}>
                        <SelectValue placeholder="Select an option" />
                      </SelectTrigger>
                      <SelectContent className={styles.selectContent}>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex flex-col mb-4">
                    <label
                      htmlFor="role"
                      className="mb-1 text-[16px] font-semibold textblack dark:text-white"
                    >
                      Payment Status
                    </label>
                    <Select onValueChange={(value) => setPaymentStatus(value)}>
                      <SelectTrigger id="role" className={styles.select}>
                        <SelectValue placeholder="Select an option" />
                      </SelectTrigger>
                      <SelectContent className={styles.selectContent}>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="refunded">Refunded</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
           
                  <InputField
                    fieldName="Text"
                    label="Applicant Id"
                    placeHolder="Enter id"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                  />
                </div>

                <div className={styles.formColumn}>
                  <div className="flex flex-col">
                    
                    <label htmlFor="startDate" className="mb-1 text-[16px] font-semibold textblack dark:text-white"
                    >Start Date</label>
                    <input
                      type="date"
                      id="startDate"
                      value={startDate || ""}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="bg-white  h-[52px] border border-gray-300 text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    />
                  </div>

                  <div className="flex flex-col">
                    <label htmlFor="endDate" className="mb-1 text-[16px] font-semibold textblack dark:text-white"
                    >End Date</label>
                    <input
                      type="date"
                      id="endDate"
                      value={endDate || ""}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="bg-white h-[52px] border border-gray-300 text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  onClick={onClose}
                  className={styles.cancelButton}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.submitButton}>
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
