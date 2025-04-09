"use client";
import React from "react";
import { Formik, Form } from "formik";
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
