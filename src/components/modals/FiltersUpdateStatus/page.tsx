"use client";
import React, { useState } from "react";
import { Formik, Form } from "formik";
import { X } from "lucide-react";
import styles from "./style.module.css";
import DropDown from "@/components/ui/dropdown/page";
import InputField from "@/components/ui/input/input";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";
const DatePicker = dynamic(() => import("react-datepicker"), {
  ssr: false,
});
interface FilterUpdateStatusProps {
  onClose: () => void;
}

export default function FilterUpdateStatus({
  onClose,
}: FilterUpdateStatusProps) {
    const [startDate, setStartDate] = useState<any | null>(null);
    const [isMounted, setIsMounted] = useState(false); // Add state to check if mounted
    const formatDate = (date: Date): string => {
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    const handleDateChange = (date: Date | null) => {
      if (date) {
        // Format the selected date as YYYY-MM-DD
        const formattedDate = formatDate(date);
        console.log("Formatted Date:", formattedDate);
        setStartDate(formattedDate);
    
        // You can use this formatted date as needed, for example, saving it to state or API
      }
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
            <Formik
              initialValues={{}}
              onSubmit={(values) => {
                console.log(values);
              }}
            >
              <Form className={styles.form}>
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
                    label="Text"
                    placeHolder="Enter text"
                    />
                       {/* Render DatePicker only after component is mounted */}
      <div className="relative max-w-sm mt-4">
        <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
          <svg
            className="w-4 h-4 text-gray-500 dark:text-gray-400"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z"/>
          </svg>
        </div>
        {/* Render DatePicker dynamically only on the client side */}
        <DatePicker
          selected={startDate}
          onChange={handleDateChange}
          dateFormat="yyyy-MM-dd" // Set the format as YYYY-MM-DD
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          placeholderText="Select date"
        />
      </div>
                  </div>
                  <div className={styles.formColumn}>
                  </div>
                  <Button  className={`${styles.filtersButton} absolute bottom-3 bg-blue-500 text-white right-[15px] hover:bg-blue-600`}>Filters</Button>
                  <div>
                  </div>
                </div>
              </Form>
            </Formik>
          </div>
        </div>
      </div>
    </div>
  );
}
