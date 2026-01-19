"use client";
import { useState, useEffect } from "react";
import { Formik, Form, FormikHelpers } from "formik";
import * as Yup from "yup";
import InputField from "@/components/ui/input/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "react-toastify";
import { X } from "lucide-react";
import { createPortal } from "react-dom";
import { useDispatch } from "react-redux";
import { createUser, updateUser } from "@/store/slices/usersSlice";
import { AppDispatch } from "@/store";
import styles from "./styles.module.css";

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editData?: any; // User data for editing
}

interface FormValues {
  email: string;
  name: string;
  role: string;
  language: string;
  timezone: string;
  role_id: number;
  password: string;
  is_active?: boolean;
  isEditing?: boolean;
}

const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  name: Yup.string()
    .min(2, "Name must be at least 2 characters")
    .required("Name is required"),
  role: Yup.string()
    .oneOf(["admin", "employee"], "Invalid role")
    .required("Role is required"),
  password: Yup.string()
    .when("isEditing", {
      is: false,
      then: (schema) => schema
        .min(6, "Password must be at least 6 characters")
        .required("Password is required"),
      otherwise: (schema) => schema.optional(),
    }),
  timezone: Yup.string()
    .required("Timezone is required"),
});

const timezones = [
  { value: "UTC", label: "UTC" },
  { value: "GMT", label: "GMT" },
  { value: "EST", label: "EST" },
  { value: "PST", label: "PST" },
];

export default function CreateUserModal({
  isOpen,
  onClose,
  onSuccess,
  editData,
}: CreateUserModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialValues: FormValues = {
    email: editData?.email || "",
    name: editData?.name || "",
    role: editData?.role?.toLowerCase() || "employee",
    language: "en",
    timezone: editData?.timezone || "UTC",
    role_id: editData?.role_id || 0,
    password: "",
    is_active: editData?.is_active ?? true,
    isEditing: !!editData,
  };

  const handleSubmit = async (
    values: FormValues,
    { setSubmitting, setErrors }: FormikHelpers<FormValues>
  ) => {
    try {
      setIsSubmitting(true);
      const userData = {
        ...values,
        role_id: values.role === "admin" ? 1 : 2,
      };

      let resultAction;
      if (editData) {
        // Remove unnecessary fields for update
        delete userData.password;
        delete userData.isEditing;

        resultAction = await dispatch(updateUser({
          id: editData.id,
          data: userData
        }));
      } else {
        resultAction = await dispatch(createUser(userData));
      }

      if ((editData ? updateUser : createUser).fulfilled.match(resultAction)) {
        onSuccess();
        onClose();
      }
    } catch (error: any) {
      //   setErrors({ 
      //     submit: error.message || `Failed to ${editData ? 'update' : 'create'} user` 
      //   });
    } finally {
      setSubmitting(false);
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[90]">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className={styles.modalContainer}>
          {/* Modal Header */}
          <div className={styles.modalHeader}>
            <h2 className={styles.modalTitle}>
              {editData ? "Edit User" : "Create New User"}
            </h2>
            <button onClick={onClose} className={styles.closeButton}>
              <X size={24} />
            </button>
          </div>

          {/* Modal Body */}
          <div className={styles.modalBody}>
            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
              enableReinitialize
              validateOnChange
              validateOnBlur
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
                        disabled={!!editData}
                      />

                      {!editData && (
                        <InputField
                          fieldName="password"
                          label="Password"
                          placeHolder="Enter password"
                          type="password"
                          isPassword
                          onChange={(e) => setFieldValue("password", e.target.value)}
                          onBlur={handleBlur}
                          error={touched.password && errors.password}
                          value={values.password}
                        />
                      )}
                    </div>

                    {/* Right Column */}
                    <div className={styles.formColumn}>
                      <div className={styles.selectWrapper}>
                        <label className={styles.label}>Role</label>
                        <Select
                          value={values.role}
                          onValueChange={(value) => {
                            setFieldValue("role", value);
                          }}
                          
                        >
                          <SelectTrigger className={styles.select}>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent className={styles.selectContent}>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="employee">Employee</SelectItem>
                          </SelectContent>
                        </Select>
                        {touched.role && errors.role && (
                          <span className={styles.error}>{errors.role}</span>
                        )}
                      </div>

                      <InputField
                        fieldName="language"
                        label="Language"
                        placeHolder="English"
                        value="English"
                        disabled
                      />

                      <div className={styles.selectWrapper}>
                        <label className={styles.label}>Timezone</label>
                        <Select
                          value={values.timezone}
                          onValueChange={(value) => {
                            setFieldValue("timezone", value);
                          }}
                        >
                          <SelectTrigger className={styles.select}>
                            <SelectValue placeholder="Select timezone" />
                          </SelectTrigger>
                          <SelectContent className={styles.selectContent}>
                            {timezones.map((timezone) => (
                              <SelectItem
                                key={timezone.value}
                                value={timezone.value}
                              >
                                {timezone.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {touched.timezone && errors.timezone && (
                          <span className={styles.error}>{errors.timezone}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Modal Footer */}
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
                        : (editData ? "Update User" : "Create User")}
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
