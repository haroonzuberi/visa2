"use client";
import { useState, useMemo } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import InputField from "@/components/ui/input/input";
import { X } from "lucide-react";
import { createPortal } from "react-dom";
import { useDispatch } from "react-redux";
import { createCustomer, updateCustomer } from "@/store/slices/customersSlice";
import { AppDispatch } from "@/store";
import styles from "./styles.module.css";
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import countryList from 'react-select-country-list';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CreateCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editData?: any;
}

const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  name: Yup.string()
    .required("Name is required"),
  phone: Yup.string()
    .required("Phone is required"),
  address: Yup.string()
    .required("Address is required"),
  country: Yup.string()
    .required("Country is required"),
});

export default function CreateCustomerModal({
  isOpen,
  onClose,
  onSuccess,
  editData
}: CreateCustomerModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const countries = useMemo(() => countryList().getData(), []);

  const initialValues = {
    email: editData?.email || "",
    name: editData?.name || "",
    phone: editData?.phone || "",
    creation_source: "website",
    address: editData?.address || "",
    country: editData?.country || "",
  };

  const handleSubmit = async (values: typeof initialValues) => {
    try {
      setIsSubmitting(true);
      const customerData = {
        ...values,
      };

      let resultAction;
      if (editData) {
        resultAction = await dispatch(updateCustomer({ 
          id: editData.id, 
          data: customerData 
        }));
      } else {
        resultAction = await dispatch(createCustomer(customerData));
      }
      
      if ((editData ? updateCustomer : createCustomer).fulfilled.match(resultAction)) {
        onSuccess();
        onClose();
      }
    } catch (error: any) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className={styles.modalContainer}>
          <div className={styles.modalHeader}>
            <h2 className={styles.modalTitle}>
              {editData ? "Edit Customer" : "Create New Customer"}
            </h2>
            <button onClick={onClose} className={styles.closeButton}>
              <X size={24} />
            </button>
          </div>

          <div className={styles.modalBody}>
            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
              enableReinitialize
            >
              {({ errors, touched, setFieldValue, values, handleBlur }) => (
                <Form className={styles.form}>
                  <div className={styles.formGrid}>
                    {/* Left Column */}
                    <div className={styles.formColumn}>
                      <InputField
                        fieldName="name"
                        label="Name"
                        placeHolder="Enter name"
                        onChange={(e) => setFieldValue("name", e.target.value)}
                        onBlur={handleBlur}
                        error={touched.name && errors.name}
                        value={values.name}
                      />

                      <InputField
                        fieldName="email"
                        label="Email"
                        placeHolder="Enter email"
                        type="email"
                        onChange={(e) => setFieldValue("email", e.target.value)}
                        onBlur={handleBlur}
                        error={touched.email && errors.email}
                        value={values.email}
                      />

                      <div className={styles.inputWrapper}>
                        <label className={styles.label}>Phone</label>
                        <PhoneInput
                          country={'us'}
                          value={values.phone}
                          onChange={(phone) => setFieldValue("phone", phone)}
                          inputClass={styles.phoneInput}
                          containerClass={styles.phoneContainer}
                        />
                        {touched.phone && errors.phone && (
                          <span className={styles.error}>{errors.phone}</span>
                        )}
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className={styles.formColumn}>
                      <InputField
                        fieldName="creation_source"
                        label="Creation Source"
                        value="website"
                        disabled
                      />

                      <InputField
                        fieldName="address"
                        label="Address"
                        placeHolder="Enter address"
                        onChange={(e) => setFieldValue("address", e.target.value)}
                        onBlur={handleBlur}
                        error={touched.address && errors.address}
                        value={values.address}
                      />

                      <div className={styles.selectWrapper}>
                        <label className={styles.label}>Country</label>
                        <Select
                          value={values.country}
                          onValueChange={(value) => setFieldValue("country", value)}
                        >
                          <SelectTrigger className={styles.select}>
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                          <SelectContent className={styles.selectContent}>
                            {countries.map((country) => (
                              <SelectItem
                                key={country.value}
                                value={country.value}
                              >
                                {country.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {touched.country && errors.country && (
                          <span className={styles.error}>{errors.country}</span>
                        )}
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
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={styles.submitButton}
                    >
                      {isSubmitting 
                        ? (editData ? "Updating..." : "Creating...") 
                        : (editData ? "Update Customer" : "Create Customer")}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
} 