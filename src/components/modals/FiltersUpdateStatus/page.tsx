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
import CreatableSelect from "react-select/creatable";

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

  // New state for additional fields
  const [applicantEmail, setApplicantEmail] = useState<string>("");
  const [applicantName, setApplicantName] = useState<string>("");
  const [applicantPassport, setApplicantPassport] = useState<string>("");
  const [applicantPhone, setApplicantPhone] = useState<string>("");
  const [customerEmail, setCustomerEmail] = useState<string>("");
  const [customerName, setCustomerName] = useState<string>("");
  const [customerPhone, setCustomerPhone] = useState<string>("");
  const [source, setSource] = useState<string>("");
  const [visaCountry, setVisaCountry] = useState<string>("");
  const [customersList, setCustomersList] = useState([]);
  const [customersListSender, setCustomersListSender] = useState([]);
  const [applicationList, setApplicationList] = useState([]);
  const [applicationListSender, setApplicationListSender] = useState([]);

  const handleChangeCustomersList = (newValue) => {
    const valuesOnly = newValue.map((item) => item.value);
    setCustomersListSender(valuesOnly)
    setCustomersList(newValue);
  };
  const handleChangeApplicationsList = (newValue) => {
    const valuesOnly = newValue.map((item) => item.value);
    setApplicationListSender(valuesOnly)
    setApplicationList(newValue);
  };
  // Handler for form submission
  const handleFilterApply = () => {
    const filterData: any = {};

    if (priority) filterData.priority = priority;
    if (paymentStatus) filterData.payment_status = paymentStatus;
    if (startDate) filterData.start_date = startDate;
    if (endDate) filterData.end_date = endDate;
    if (text) filterData.applicant_id = text;

    // Add the new fields to filterData
    if (applicantEmail) filterData.applicant_email = applicantEmail;
    if (applicantName) filterData.applicant_name = applicantName;
    if (applicantPassport) filterData.applicant_passport = applicantPassport;
    if (applicantPhone) filterData.applicant_phone = applicantPhone;
    if (customerEmail) filterData.customer_email = customerEmail;
    if (customerName) filterData.customer_name = customerName;
    if (customerPhone) filterData.customer_phone = customerPhone;
    if (source) filterData.source = source;
    if (visaCountry) filterData.visa_country = visaCountry;
    if (applicationList.length>0) filterData.application_tags = applicationListSender;
    if (customersList.length>0) filterData.customer_tags = customersListSender;

    dispatch(filterKanbanData(filterData));
    onClose();
  };
  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      minHeight: '52px',
      height: '52px',
      border: state.isFocused ? '1px solid #55de8e' : '1px solid #E9EAEA',
      boxShadow: state.isFocused ? '0 0 0 1px #55de8e' : 'none',
      borderRadius: '12px',
      '&:hover': {
        border: '1px solid #55de8e',
      },
    }),
    valueContainer: (provided) => ({
      ...provided,
      height: '52px',
      padding: '0 8px',
      display: 'flex',
      flexWrap: 'nowrap',
      overflowX: 'auto',
      scrollbarWidth: 'none',  // Firefox
      msOverflowStyle: 'none', // IE 10+
    }),
    multiValue: (provided) => ({
      ...provided,
      maxWidth: '100%',
    }),
    input: (provided) => ({
      ...provided,
      margin: '0px',
      padding: '0',
    }),
    indicatorsContainer: (provided) => ({
      ...provided,
      height: '52px',
    }),
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
            <form
              className={styles.form}
              onSubmit={(e) => {
                e.preventDefault();

                if (
                  !priority &&
                  !paymentStatus &&
                  !startDate &&
                  !endDate &&
                  !text &&
                  !applicantEmail &&
                  !applicantName &&
                  !applicantPassport &&
                  !applicantPhone &&
                  !customerEmail &&
                  !customerName &&
                  !customerPhone &&
                  !source &&
                  !visaCountry &&
                  applicationList.length==0 &&
                  customersList.length==0
                ) {
                  toast.error("You have not selected any filter field.");
                  return;
                }

                handleFilterApply();
              }}
            >
              <div className={styles.formGrid}>
                <div className={styles.formColumn}>
                  {/* Existing Select Fields */}

                  <div className="flex flex-col">
                    <label
                      htmlFor="role"
                      className="mb-2 text-[16px] font-[500] text-[#24282E] dark:text-white"
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

                  <div className="flex flex-col ">
                    <label
                      htmlFor="role"
                      className="mb-2 text-[16px] font-[500]  text-[#24282E] dark:text-white"
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
                  <InputField
                    fieldName="Name"
                    label="Applicant Name"
                    placeHolder="Enter name"
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                  />
                  <InputField
                    fieldName="Phone"
                    label="Applicant Phone"
                    placeHolder="Enter phone number"
                    value={applicantPhone}
                    onChange={(e) => setApplicantPhone(e.target.value)}
                  />
                  <InputField
                    fieldName="Email"
                    label="Customer Email"
                    placeHolder="Enter customer email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                  />
                  <InputField
                    fieldName="Phone"
                    label="Customer Phone"
                    placeHolder="Enter customer phone number"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                  />
                  <div className="flex flex-col">
                    <label
                      htmlFor="applicationTag"
                      className="mb-2 text-[16px] font-[500] text-[#24282E] dark:text-white"
                    >
                      Application Tag
                    </label>
                    <CreatableSelect
                      isMulti
                      onChange={handleChangeApplicationsList}
                      value={applicationList}
                      placeholder="Type and write your tags"
                      styles={customStyles}
                    />
                  </div>
                </div>

                <div className={styles.formColumn}>
                  <div className="flex flex-col">
                    <label
                      htmlFor="startDate"
                      className="mb-2 text-[16px] font-[500] text-[#24282E] dark:text-white"
                    >
                      Start Date
                    </label>
                    <input
                      type="date"
                      id="startDate"
                      value={startDate || ""}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="bg-white h-[52px] border border-[#E9EAEA] text-black text-sm rounded-[12px] focus:ring-[#55de8e] focus:border-[#55de8e] block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-[#55de8e] dark:focus:border-[#55de8e]"

                    />
                  </div>

                  <div className="flex flex-col">
                    <label
                      htmlFor="endDate"
                      className="mb-2 text-[16px] font-[500] text-[#24282E] dark:text-white"
                    >
                      End Date
                    </label>
                    <input
                      type="date"
                      id="endDate"
                      value={endDate || ""}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="bg-white h-[52px] border border-[#E9EAEA] text-black text-sm rounded-[12px]  block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 focus:ring-[#55de8e]focus:border-[#55de8e]"
                    />
                  </div>
                  <InputField
                    fieldName="Email"
                    label="Applicant Email"
                    placeHolder="Enter email"
                    value={applicantEmail}
                    onChange={(e) => setApplicantEmail(e.target.value)}
                  />
                  <InputField
                    fieldName="Passport"
                    label="Applicant Passport"
                    placeHolder="Enter passport number"
                    value={applicantPassport}
                    onChange={(e) => setApplicantPassport(e.target.value)}
                  />
                  <InputField
                    fieldName="Name"
                    label="Customer Name"
                    placeHolder="Enter customer name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                  <InputField
                    fieldName="Visa Country"
                    label="Visa Country"
                    placeHolder="Enter visa country"
                    value={visaCountry}
                    onChange={(e) => setVisaCountry(e.target.value)}
                  />

                  <InputField
                    fieldName="Source"
                    label="Source"
                    placeHolder="Enter source"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                  />
                  <div className="flex flex-col">
                    <label
                      htmlFor="applicationTag"
                      className="mb-2 text-[16px] font-[500] text-[#24282E] dark:text-white"
                    >
                      Customer Tags
                    </label>
                    <CreatableSelect
                      isMulti
                      onChange={handleChangeCustomersList}
                      value={customersList}
                      placeholder="Type and write your tags"
                      styles={customStyles}

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
