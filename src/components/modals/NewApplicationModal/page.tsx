"use client";
import CrossSvg from "@/Assets/svgs/CrossSvg";
import styles from "../ApplicationDetailModal/styles.module.css";
import CopyGreenSvg from "@/Assets/svgs/CopyGreenSvg";
import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { X } from "lucide-react";
import "../../ui/input/style.modules.css";
import "@/styles/globals.css";
import InputField from "@/components/ui/input/input";
import DropDown from "@/components/ui/dropdown/page";
import CircleImageSvg from "@/Assets/svgs/CricleImageSvg";
import NewApplication2 from "../NewApplicationModal2/page";
import CustomerAutocomplete from "@/components/ui/customer-autocomplete/page";
import { toast } from "react-toastify";
import { useDropzone } from "react-dropzone";
import GroupAutocomplete from "@/components/ui/group-autocomplete/page";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchApplication,
  setCurrentPage,
  createApplication,
} from "@/store/slices/applicationsSlice";
import { AppDispatch, RootState } from "@/store";

const SpecialTagInput = ({ error }: { error: any }) => {
  const [tags, setTags] = useState(["Tag1"]);
  const [inputValue, setInputValue] = useState("");

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim() !== "") {
      e.preventDefault();
      setTags([...tags, inputValue.trim()]);
      setInputValue("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  return (
    <div className="flex flex-col w-full">
      <div className="flex items-center flex-wrap focus-within:border-[#42DA82] input-text overflow-y-scroll">
        {tags.map((tag, index) => (
          <div
            key={index}
            className="bg-[#42DA821A] text-green-700 flex items-center px-3 py-1 rounded-full mr-2 mb-1"
          >
            <span className="mr-2 text-[#42DA82]">{tag}</span>
            <button
              onClick={() => handleRemoveTag(tag)}
              className="text-[#42DA82] focus:outline-none"
            >
              <X className="w-4 h-4 text-[#42DA82]" />
            </button>
          </div>
        ))}
        <input
          type="text"
          className="flex-1 border-none outline-none text-gray-700 placeholder-gray-400"
          placeholder="Type and press Enter"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleAddTag}
        />
      </div>
      {error && <div className="text-red-500 text-sm">{error}</div>}
    </div>
  );
};

const steps = [
  { id: 1, label: "Step 1" },
  { id: 2, label: "Step 2" },
];

// Add these constants for file validation
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/jpg"];

const FileUploadBox = ({
  filePreview,
  file,
  onUpload,
  onRemove,
  inputId,
}: {
  filePreview: string | null;
  file: File | null;
  onUpload: (file: File) => void;
  onRemove: () => void;
  inputId: string;
}) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles?.[0]) {
        onUpload(acceptedFiles[0]);
      }
    },
    accept: {
      "image/*": [".jpeg", ".jpg", ".png"],
    },
    multiple: false,
  });

  if (filePreview && file) {
    return (
      <div
        {...getRootProps()}
        className="bg-white !border-[1px] !border-[#E9EAEA] rounded-[16px] w-full h-[72px] flex items-center justify-between px-6 cursor-pointer"
      >
        <input {...getInputProps()} id={inputId} />
        <div className="flex items-center gap-3">
          <img
            src={filePreview}
            alt="Preview"
            className="w-[40px] h-[40px] rounded-[8px] object-cover"
          />
          <div className="flex flex-col">
            <span className="text-[14px] text-[#24282E]">{file.name}</span>
            <span className="text-[12px] text-[#727A90]">
              {Math.round(file.size / 1024)}kb
            </span>
          </div>
        </div>
        <button
          type="button"
          className="bg-[#42DA82] text-white px-5 py-2 rounded-[12px] text-[14px] font-medium"
        >
          Change
        </button>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={`bg-white !border-[1px] !border-[#E9EAEA] rounded-[16px]  w-full h-[72px] flex items-center justify-between px-6 cursor-pointer
        ${isDragActive ? "bg-[#F8F9FB]" : ""}`}
    >
      <input {...getInputProps()} id={inputId} />
      <div className="flex items-center gap-3">
        <div className="text-[#727A90]">
          <CircleImageSvg className="w-[32px] h-[32px]" />
        </div>
        <span className="text-[14px] text-[#727A90]">
          Drag and drop image here, or click add image
        </span>
      </div>
      <button
        type="button"
        className="bg-[#42DA82] text-white px-5 py-2 rounded-[12px] text-[14px] font-medium"
      >
        Upload
      </button>
    </div>
  );
};

const generateValidationSchema = (fields: any[]) => {
  const schemaFields: any = {};
  fields.forEach((field) => {
    let fieldSchema;
    switch (field.field_type) {
      case "text":
      case "phone":
      case "date":
        fieldSchema = Yup.string();
        break;
      case "email":
        fieldSchema = Yup.string().email("Invalid email address");
        break;
      case "number":
        fieldSchema = Yup.number().typeError("Must be a number");
        break;
      case "file":
      case "image":
        fieldSchema = Yup.mixed();
        break;
      case "radio":
      case "select":
        fieldSchema = Yup.string();
        break;
      default:
        fieldSchema = Yup.mixed();
    }
    if (field.is_required) {
      fieldSchema = fieldSchema.required(`${field.label} is required`);
    }
    if (field.validation) {
      if (field.validation.pattern) {
        fieldSchema = fieldSchema.matches(
          new RegExp(field.validation.pattern),
          `${field.label} does not match the required pattern`
        );
      }
      if (field.validation.min) {
        if (field.field_type === "date") {
          fieldSchema = fieldSchema.test(
            "minDate",
            `${field.label} must be on or after ${field.validation.min}`,
            function (value) {
              if (!value) return true;
              const minDate =
                field.validation.min === "today"
                  ? new Date()
                  : this.parent[field.validation.min]
                  ? new Date(this.parent[field.validation.min])
                  : new Date();
              return new Date(value) >= minDate;
            }
          );
        } else if (field.field_type === "number") {
          fieldSchema = fieldSchema.min(
            field.validation.min,
            `${field.label} must be at least ${field.validation.min}`
          );
        }
      }
      if (field.validation.max) {
        if (field.field_type === "date") {
          fieldSchema = fieldSchema.test(
            "maxDate",
            `${field.label} must be on or before ${field.validation.max}`,
            function (value) {
              if (!value) return true;
              const maxDate =
                field.validation.max === "today"
                  ? new Date()
                  : new Date(this.parent[field.validation.max]);
              return new Date(value) <= maxDate;
            }
          );
        } else if (field.field_type === "number") {
          fieldSchema = fieldSchema.max(
            field.validation.max,
            `${field.label} must be at most ${field.validation.max}`
          );
        }
      }
    }
    schemaFields[field.field_id] = fieldSchema;
  });
  return Yup.object().shape(schemaFields);
};

const validationSchema = Yup.object().shape({
  // Basic Info
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  name: Yup.string().required("Name is required"),
  phone: Yup.string().required("Phone is required"),
  passport_number: Yup.string() // Added new validation
    .required("Passport number is required"),
  special_tags: Yup.array().min(0, "At least one special tag is required"),
  // Required Documents
  passport: Yup.mixed().required("Passport is required"),
  photo: Yup.mixed().required("Photo is required"),

  // Application Details
  price: Yup.number()
    .required("Price is required")
    .min(0, "Price must be greater than or equal to 0"),
  priority: Yup.string().required("Priority is required"),
  visa_type: Yup.string().required("Visa type is required"),
  visa_country: Yup.string().required("Visa country is required"),
  internal_notes: Yup.string().required("Internal notes are required"),

  // Customer and Applicant
  customer_id: Yup.number()
    .nullable()
    .required("Customer selection is required"),
  customer_name: Yup.string().required("Customer name is required"),
  applicant_id: Yup.number()
    .nullable()
    .required("Applicant selection is required"),
  applicant_name: Yup.string().required("Applicant name is required"),

  // Group (conditional)
  is_group: Yup.boolean(),
  group_id: Yup.number()
    .nullable()
    .when("is_group", {
      is: true,
      then: (schema) =>
        schema.required("Group selection is required when group is selected"),
      otherwise: (schema) => schema.nullable(),
    }),
  group: Yup.string().when("is_group", {
    is: true,
    then: (schema) =>
      schema.required("Group name is required when group is selected"),
    otherwise: (schema) => schema.nullable(),
  }),
});

const NewApplication = ({ setIsNewApplication, onClose }: any) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [applications, setApplications] = useState<any[]>([]);
  const [customerData, setCustomerData] = useState<number | null>(null);

  const initialValues = {
    email: "",
    full_name: "",
    phone: "",
    passport_number: "",
  };

  const dispatch = useDispatch<AppDispatch>();

  // ✅ Ensure `state.applications` exists before destructuring
  const applicationData = useSelector(
    (state: any) => state.applicantions.applicationData
  );

  useEffect(() => {
    dispatch(fetchApplication());
  }, []);

  const handleStepClick = (step: number) => {
    setCurrentStep(step);
  };

  const handleAddApplication = (values: any, { resetForm }: any) => {
    // setApplications([...applications, values]);
    // resetForm();
    toast.success("Application added successfully!");
  };

  const submitApplication = async (values: any, errors: any) => {
    const mandatoryFields = ["full_name", "email", "phone", "passport_number"];
    const hasErrors = mandatoryFields.some((field) => !values[field] || errors[field]);

    if (hasErrors) {
      toast.error("Please fill all mandatory fields");
      return;
    }

    try {
      await dispatch(createApplication(values)).unwrap();
      toast.success("Application submitted successfully!");
      if (currentStep < steps.length) {
        setCurrentStep(currentStep + 1);
      }
    } catch (error) {
      console.error("Error submitting application:", error);
      toast.error(error.message || "Failed to submit application");
    }
  };

  const handleNextStep = async (values: any, errors: any) => {
    // Check if mandatory fields are filled and valid
    const mandatoryFields = ["full_name", "email", "phone", "passport_number"];
    const hasErrors = mandatoryFields.some((field) => {
      console.log(`Checking field: ${field}`);
      console.log(`Value:`, values[field]);
      console.log(`Error:`, errors[field]);

      return !values[field] || (!!errors[field] && errors[field].trim() !== "");
    });

    console.log("FIELDS", values);
    if (hasErrors) {
      toast.error(
        "Please fill all mandatory fields (Name, Email, Phone, Passport Number)"
      );
      return;
    }

    
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    setCurrentStep(1);
  };

  const handleFinalSubmit = () => {
    // Dispatch all applications to store
    // dispatch(addApplication(applications));
    onClose();
    toast.success("All applications submitted successfully!");
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm">
        <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-h-[90vh]">
          <div className="bg-white rounded-xl w-[90vw] xl:w-[800px] lg:w-[800px] md:w-[800px] h-[90vh] overflow-y-auto shadow-lg;">
            <div className="flex flex-col h-full justify-between items-center w-full">
              <div className="w-full">
                <div className="flex justify-between p-6 pb-0 items-center">
                  <h2 className="text-lg font-semibold">Add New Application</h2>
                  <button
                    className="border-[#E9EAEA] border-[1px] p-2 rounded-[10px]"
                    onClick={() => {
                      console.log("SET APP---");
                      onClose();
                    }}
                  >
                    <CrossSvg size={24} />
                  </button>
                </div>

                <div className="px-8">
                  <div className="flex justify-start">
                    <div className="flex flex-col items-center space-y-2">
                      {/* Stepper */}
                      <div className="flex items-center justify-center">
                        {steps.map((step, index) => (
                          <div
                            key={step.id}
                            className="flex items-center m0imp"
                          >
                            <div
                              className={`w-8 h-8 flex items-center justify-center rounded-full border-2 
                                transition-all ${
                                  currentStep > step.id
                                    ? "bg-[#42DA82] border-[#42DA82] text-white"
                                    : currentStep === step.id
                                    ? "border-[#42DA82] text-[#42DA82]"
                                    : "border-gray-300 text-gray-400"
                                }`}
                              onClick={() => handleStepClick(step.id)}
                            >
                              {currentStep > step.id ? (
                                <Check className="w-5 h-5" />
                              ) : currentStep === step.id ? (
                                <span className="w-2 h-2 bg-[#42DA82] rounded-full"></span>
                              ) : currentStep === 1 ? null : (
                                <span className="w-2 h-2 bg-gray-300 rounded-full"></span>
                              )}
                            </div>
                            {index !== steps.length - 1 && (
                              <div
                                className={`w-[350px] h-1 ${
                                  currentStep > step.id
                                    ? "bg-[#42DA82]"
                                    : "bg-[#D1D5DB]"
                                }`}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-center space-x-[310px]">
                        {steps.map((step) => (
                          <span
                            key={step.id}
                            className={`text-[18px] font-[500] ${
                              currentStep >= step.id
                                ? "text-black"
                                : "text-gray-500"
                            }`}
                          >
                            {step.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Wrap the entire form and footer in a single Formik instance */}
                  <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    enableReinitialize
                    onSubmit={handleAddApplication}
                  >
                    {({
                      values,
                      errors,
                      touched,
                      setFieldValue,
                      isSubmitting,
                    }) => (
                      <Form className="flex flex-col h-full justify-between">
                        {applicationData?.fields?.length ? (
                          applicationData.fields.map((ele) => (
                            <Field key={ele.field_id} name={ele.field_id}>
                              {({ field, meta }: any) => (
                                <>
                                  {ele.field_type === "file" ||
                                  ele.field_type === "image" ? (
                                    <div className="w-full">
                                      <label className="text-[#24282E] font-jakarta font-[500] text-[18px] mb-2 block">
                                        {ele.label}
                                      </label>
                                      <FileUploadBox
                                        filePreview={
                                          values[ele.field_id]
                                            ? URL.createObjectURL(
                                                values[ele.field_id]
                                              )
                                            : null
                                        }
                                        file={values[ele.field_id]}
                                        onUpload={(file) =>
                                          setFieldValue(ele.field_id, file)
                                        }
                                        onRemove={() =>
                                          setFieldValue(ele.field_id, null)
                                        }
                                        inputId={ele.field_id}
                                      />
                                      {meta.touched && meta.error && (
                                        <span className="text-red-500 text-sm">
                                          {meta.error}
                                        </span>
                                      )}
                                    </div>
                                  ) : ele.field_type === "radio" ? (
                                    <div className="col-span-5 flex flex-col gap-2 mt-2">
                                      <span className="text-[#24282E] font-jakarta font-[500] text-[18px]">
                                        {ele.label}
                                      </span>
                                      <div className="flex items-center gap-4">
                                        {ele.options.map((option) => (
                                          <label
                                            key={option.value}
                                            className="flex items-center gap-2 cursor-pointer"
                                          >
                                            <Field
                                              type="radio"
                                              name={ele.field_id}
                                              value={option.value}
                                              checked={
                                                values[ele.field_id] ===
                                                option.value
                                              }
                                              onChange={() =>
                                                setFieldValue(
                                                  ele.field_id,
                                                  option.value
                                                )
                                              }
                                              className="hidden peer"
                                            />
                                            <div className="w-5 h-5 flex items-center justify-center rounded-full border-2 border-gray-400 peer-checked:bg-[#42DA82] peer-checked:border-[#42DA82]">
                                              <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                                            </div>
                                            <span>{option.label}</span>
                                          </label>
                                        ))}
                                      </div>
                                      {meta.touched && meta.error && (
                                        <span className="text-red-500 text-sm">
                                          {meta.error}
                                        </span>
                                      )}
                                    </div>
                                  ) : ele.field_type === "text" &&
                                    ele.meta_data?.multiline ? (
                                    <div className="flex flex-col gap-2">
                                      <label className="text-[#24282E] text-[18px] font-[500] font-jakarta">
                                        {ele.label}
                                      </label>
                                      <textarea
                                        {...field}
                                        name={ele.field_id}
                                        placeholder={
                                          ele.placeholder ||
                                          "Enter details here"
                                        }
                                        className={`w-full border-2 ${
                                          meta.touched && meta.error
                                            ? "border-red-500"
                                            : "border-[#E9EAEA]"
                                        } p-3 rounded-[12px] mt-1 focus:border-primary focus:outline-none min-h-[100px]`}
                                        rows={3}
                                      />
                                      {meta.touched && meta.error && (
                                        <span className="text-red-500 text-sm">
                                          {meta.error}
                                        </span>
                                      )}
                                    </div>
                                  ) : (
                                    <InputField
                                      {...field}
                                      fieldName={ele.field_id}
                                      placeHolder={ele.placeholder}
                                      type={ele.field_type}
                                      label={ele.label}
                                      error={meta.touched && meta.error}
                                    />
                                  )}
                                </>
                              )}
                            </Field>
                          ))
                        ) : (
                          <p>Loading...</p>
                        )}

                        {/* Footer (unchanged) */}
                        <div className="w-full">
                          <hr className="my-2" />
                          <div className="flex justify-end p-6 pr-0 pt-0 items-center">
                            <div className="flex gap-2 items-center">
                              <button className={styles.refundBtn}>
                                <CopyGreenSvg />
                                <span className="text-[12px] font-[600] underline">
                                  Add Another Application for Same
                                </span>
                              </button>
                              <button
                                type="button"
                                className="bg-[#42DA82] text-white px-6 py-2 rounded-[12px] font-semibold"
                                onClick={() =>
                                  submitApplication(values, errors)
                                }
                              >
                                <span>Next Step</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </Form>
                    )}
                  </Formik>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewApplication;
