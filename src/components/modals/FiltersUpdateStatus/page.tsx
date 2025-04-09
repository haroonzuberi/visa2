"use client";
import React from "react";
import { X } from "lucide-react";
import styles from "./style.module.css";
import DropDown from "@/components/ui/dropdown/page";
import InputField from "@/components/ui/input/input";
import { Button } from "@/components/ui/button";

interface FilterUpdateStatusProps {
  onClose: () => void;
}

export default function FilterUpdateStatus({
  onClose,
}: FilterUpdateStatusProps) {
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
                    label="Text"
                    placeHolder="Enter text"
                  />
                </div>

                <div className={styles.formColumn}>
                  {/* Start Date Input */}
                  <div className="flex flex-col">
                    <label htmlFor="startDate">Start Date</label>
                    <input
                      type="date"
                      id="startDate"
                      className="bg-white mt-3 h-[50px] border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    />
                  </div>

                  {/* End Date Input */}
                  <div className="flex flex-col">
                    <label htmlFor="endDate">End Date</label>
                    <input
                      type="date"
                      id="endDate"
                      className="bg-white h-[50px] mt-3 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    />
                  </div>

                  <Button
                    className={`${styles.filtersButton} absolute bottom-3 bg-blue-500 text-white right-[15px] hover:bg-blue-600`}
                  >
                    Filters
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
