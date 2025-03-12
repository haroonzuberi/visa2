"use client";
import { useState } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import InputField from "@/components/ui/input/input";
import { X } from "lucide-react";
import { createPortal } from "react-dom";
import { useDispatch } from "react-redux";
import {
  createApplicant,
  updateApplicant,
} from "@/store/slices/applicantsSlice";
import { AppDispatch } from "@/store";
import styles from "./styles.module.css";
import PhoneInputField from "@/components/ui/phone-input/page";

interface CreateApplicantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editData?: any;
}

const validationSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  phone: Yup.string().required("Phone is required"),
  passport_number: Yup.string().required("Passport number is required"),
});

export default function CreateApplicantModal({
  isOpen,
  onClose,
  onSuccess,
  editData,
}: CreateApplicantModalProps) {
  const dispatch = useDispatch<AppDispatch>();

  console.log("EDIT DATA==", editData);
  if (!isOpen) return null;

  const initialValues = {
    name: editData?.name || "",
    email: editData?.email || "",
    phone: editData?.phone || "",
    passport_number: editData?.passport_number || "",
  };

  const handleSubmit = async (values: any, { setSubmitting }: any) => {
    try {
      if (editData) {
        await dispatch(
          updateApplicant({ id: editData.id, data: values })
        ).unwrap();
      } else {
        await dispatch(createApplicant(values)).unwrap();
      }
      onSuccess();
    } catch (error) {
      // Error is handled in the slice
      setSubmitting(false);
    }
  };

  return createPortal(
    <div className={styles.modalOverlay}>
      <div className={styles.modalContainer}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            {editData ? "Edit Applicant" : "Create New Applicant"}
          </h2>
          <button onClick={onClose} className={styles.closeButton}>
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className={styles.modalBody}>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({
              isSubmitting,
              errors,
              values,
              touched,
              setFieldValue,
              handleBlur,
            }) => (
              <Form className={styles.form}>
                <div className={styles.formGrid}>
                  <div className={styles.formColumn}>
                    <InputField
                      fieldName="name"
                      label="Name"
                      placeHolder="Enter name"
                      value={values.name}
                      onChange={(e) => setFieldValue("name", e.target.value)}
                      error={touched.name && errors.name}
                      onBlur={handleBlur}
                    />
                    <InputField
                      fieldName="email"
                      label="Email"
                      placeHolder="Enter email"
                      type="email"
                      value={values.email}
                      onChange={(e) => setFieldValue("email", e.target.value)}
                      error={touched.email && errors.email}
                      onBlur={handleBlur}
                    />
                  </div>
                  <div className={styles.formColumn}>
                    <PhoneInputField
                      value={initialValues.phone}
                      onChange={(phone) => setFieldValue("phone", phone)}
                      error={errors.phone}
                      touched={touched.phone}
                    />
                    <InputField
                      fieldName="passport_number"
                      label="Passport Number"
                      placeHolder="Enter passport number"
                      error={touched.passport_number && errors.passport_number}
                      value={values.passport_number}
                      onChange={(e) =>
                        setFieldValue("passport_number", e.target.value)
                      }
                      onBlur={handleBlur}
                    />
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
                      ? editData
                        ? "Updating..."
                        : "Creating..."
                      : editData
                      ? "Update Applicant"
                      : "Create Applicant"}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>,
    document.body
  );
}
