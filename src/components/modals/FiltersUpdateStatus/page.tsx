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

    // Conditionally add only the selected values
    if (priority) filterData.priority = priority;
    if (paymentStatus) filterData.payment_status = paymentStatus;
    if (startDate) filterData.start_date = startDate;
    if (endDate) filterData.end_date = endDate;
    if (text) filterData.application_id = text;

    // Dispatch the filter data to the Redux store
    dispatch(filterKanbanData(filterData));
    onClose()
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
                <DropDown
                    options={["Low", "Medium", "High"]}
                    fieldName="priority"
                    label="Priority"
                  />
                  <DropDown
                    options={["pending", "paid", "refunded", "cancelled"]}
                    fieldName="paymentStatus"
                    label="Payment Status"
                  />
                  <InputField
                    fieldName="Text"
                    label="Applicant Id"
                    placeHolder="Enter id"
                    value={text}
                    onChange={(e) => setText(e.target.value)} // Update text input
                  />
                </div>

                <div className={styles.formColumn}>
                  {/* Start Date Input */}
                  <div className="flex flex-col">
                    <label htmlFor="startDate">Start Date</label>
                    <input
                      type="date"
                      id="startDate"
                      value={startDate || ""}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="bg-white mt-3 h-[50px] border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    />
                  </div>

                  {/* End Date Input */}
                  <div className="flex flex-col">
                    <label htmlFor="endDate">End Date</label>
                    <input
                      type="date"
                      id="endDate"
                      value={endDate || ""}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="bg-white h-[50px] mt-3 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Apply Filter Button */}
              <div className="w-full mt-4">
                <Button
                  onClick={handleFilterApply} // Apply filters when clicked
                  className={`${styles.filtersButton} bg-blue-500 text-white hover:bg-blue-600 w-full`}
                >
                  Apply Filter
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
