"use client";
import CrossSvg from "@/Assets/svgs/CrossSvg";
import styles from "../ApplicationDetailModal/styles.module.css";
import CopyGreenSvg from "@/Assets/svgs/CopyGreenSvg";
import { useState } from "react";
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
import ApplicantAutocomplete from "@/components/ui/applicant-autocomplete/page";
import { useDispatch } from "react-redux";
// import { addApplication } from "@/store/slices/applicationsSlice";

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

const validationSchema = Yup.object().shape({
  // Basic Info
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  name: Yup.string().required("Name is required"),
  phone: Yup.string().required("Phone is required"),
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
  const dispatch = useDispatch();
  const [currentStep, setCurrentStep] = useState(1);
  const [applications, setApplications] = useState<any[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(
    null
  );

  const initialValues = {
    email: "",
    name: "",
    phone: "",
    special_tags: [],
    passport: null,
    photo: null,
    price: "",
    priority: "",
    visa_type: "",
    visa_country: "",
    internal_notes: "",
    customer_id: null,
    customer_name: "",
    applicant_id: null,
    applicant_name: "",
    is_group: false,
    group: "",
    group_id: null,
  };

  const handleStepClick = (step: number) => {
    setCurrentStep(step);
  };

  const handleAddApplication = (values: any, { resetForm }: any) => {
    // Add the current application to the array
    setApplications([...applications, values]);

    // Reset form for next application
    resetForm();

    // Show success message
    toast.success("Application added successfully!");
  };

  const handleNextStep = () => {
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
    <div className=" fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm">
        <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-h-[90vh]">
          <div className="bg-white rounded-xl w-[90vw] xl:w-[800px] lg:w-[800px] md:w-[800px] h-[90vh] overflow-y-auto shadow-lg;">
            {/* Header */}
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
                      <div className="flex items-center justify-center ">
                        {steps.map((step, index) => (
                          <div
                            key={step.id}
                            className="flex items-center m0imp"
                          >
                            {/* Step Circle */}
                            <div
                              className={`w-8 h-8 flex items-center justify-center rounded-full border-2 
                                                        transition-all ${
                                                          currentStep > step.id
                                                            ? "bg-[#42DA82] border-[#42DA82] text-white" // Completed step
                                                            : currentStep ===
                                                              step.id
                                                            ? "border-[#42DA82] text-[#42DA82]" // Active step
                                                            : "border-gray-300 text-gray-400" // Inactive step
                                                        }`}
                              onClick={() => handleStepClick(step.id)}
                            >
                              {currentStep > step.id ? (
                                <Check className="w-5 h-5" /> // Show checkmark for completed steps
                              ) : currentStep === step.id ? (
                                <span className="w-2 h-2 bg-[#42DA82] rounded-full"></span> // Show dot for active step
                              ) : currentStep === 1 ? null : ( // If on first step, make second circle completely empty
                                <span className="w-2 h-2 bg-gray-300 rounded-full"></span> // Show gray dot for upcoming steps
                              )}
                            </div>

                            {/* Line Between Steps */}
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

                      {/* Step Labels */}
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

                  {currentStep === 1 && (
                    <Formik
                      initialValues={initialValues}
                      validationSchema={validationSchema}
                      onSubmit={handleAddApplication}
                    >
                      {({
                        values,
                        errors,
                        touched,
                        setFieldValue,
                        isSubmitting,
                      }) => (
                        <Form>
                          <div className="mt-[10px]">
                            {/* Form Section */}
                            <div>
                              <div className="flex items-center justify-between gap-6">
                                <Field name="email">
                                  {({ field, meta }: any) => (
                                    <InputField
                                      {...field}
                                      fieldName="email"
                                      placeHolder="Email"
                                      type="text"
                                      label="Email"
                                      error={meta.touched && meta.error}
                                    />
                                  )}
                                </Field>
                                <Field name="name">
                                  {({ field, meta }: any) => (
                                    <InputField
                                      {...field}
                                      fieldName="name"
                                      placeHolder="Name"
                                      type="text"
                                      label="Name"
                                      error={meta.touched && meta.error}
                                    />
                                  )}
                                </Field>
                              </div>

                              <div className="flex items-center justify-between gap-6 mt-[20px]">
                                <Field name="phone">
                                  {({ field, meta }: any) => (
                                    <InputField
                                      {...field}
                                      fieldName="phone"
                                      placeHolder="+923434348432"
                                      type="text"
                                      label="Phone"
                                      error={meta.touched && meta.error}
                                    />
                                  )}
                                </Field>
                                <div className="w-full flex flex-col align-start justify-start gap-3">
                                  <label className="text-[#24282E] text-[18px] font-[500] font-jakarta">
                                    Special Tag
                                  </label>
                                  <Field name="special_tags">
                                    {({ field, meta }: any) => (
                                      <div>
                                        <SpecialTagInput
                                          error={meta.touched && meta.error}
                                        />
                                      </div>
                                    )}
                                  </Field>
                                </div>
                              </div>

                              <div className="flex items-center justify-between gap-6 mt-[20px]">
                                <Field name="price">
                                  {({ field, meta }: any) => (
                                    <InputField
                                      {...field}
                                      fieldName="price"
                                      placeHolder="Price"
                                      type="number"
                                      label="Price"
                                      error={meta.touched && meta.error}
                                    />
                                  )}
                                </Field>
                                <Field name="priority">
                                  {({ field, meta }: any) => (
                                    <DropDown
                                      {...field}
                                      label="Priority"
                                      options={[
                                        "High Priority",
                                        "Medium Priority",
                                      ]}
                                      fieldName="priority"
                                      error={meta.touched && meta.error}
                                    />
                                  )}
                                </Field>
                              </div>

                              <div className="flex items-center justify-between gap-6 mt-[20px]">
                                <Field name="visa_type">
                                  {({ field, meta }: any) => (
                                    <DropDown
                                      {...field}
                                      label="Visa type"
                                      options={[
                                        "Business Visa",
                                        "Tourist Visa",
                                      ]}
                                      fieldName="visa_type"
                                      error={meta.touched && meta.error}
                                    />
                                  )}
                                </Field>
                                <Field name="visa_country">
                                  {({ field, meta }: any) => (
                                    <DropDown
                                      {...field}
                                      label="Visa country"
                                      options={["India", "USA", "UK"]}
                                      fieldName="visa_country"
                                      error={meta.touched && meta.error}
                                    />
                                  )}
                                </Field>
                              </div>

                              <div className="flex items-center justify-between gap-6 mt-[20px]">
                                <CustomerAutocomplete
                                  name="customer"
                                  value={values.customer_name}
                                  customerId={values.customer_id}
                                  onChange={(
                                    name: string,
                                    id: number | null
                                  ) => {
                                    setFieldValue("customer_name", name);
                                    setFieldValue("customer_id", id);
                                    setFieldValue("applicant_name", "");
                                    setFieldValue("applicant_id", null);
                                    setSelectedCustomerId(id);
                                  }}
                                  error={errors.customer_id}
                                  touched={touched.customer_id}
                                />
                              </div>

                              {/* Applicant Selection - Only show when customer is selected */}
                              {values.customer_id && (
                                <div className="flex items-center justify-between gap-6 mt-4">
                                  <Field name="applicant">
                                    {({ field, meta }: any) => (
                                      <ApplicantAutocomplete
                                        {...field}
                                        name="applicant"
                                        value={values.applicant_name}
                                        applicantId={values.applicant_id}
                                        customerId={values.customer_id}
                                        onChange={(
                                          name: string,
                                          id: number | null
                                        ) => {
                                          setFieldValue("applicant_name", name);
                                          setFieldValue("applicant_id", id);
                                        }}
                                        error={errors.applicant_id}
                                        touched={touched.applicant_id}
                                      />
                                    )}
                                  </Field>
                                </div>
                              )}
                            </div>
                            {/* Group Selection (Yes/No) */}
                            <div className="col-span-5 flex flex-col gap-2 mt-2">
                              <span className="text-[#24282E] font-jakarta font-[500] text-[18px]">
                                Group?
                              </span>
                              <div className="flex items-center gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                  <Field
                                    type="radio"
                                    name="is_group"
                                    checked={values.is_group === true}
                                    onChange={() => {
                                      setFieldValue("is_group", true);
                                    }}
                                    className="hidden peer"
                                  />
                                  <div className="w-5 h-5 flex items-center justify-center rounded-full border-2 border-gray-400 peer-checked:bg-[#42DA82] peer-checked:border-[#42DA82]">
                                    <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                                  </div>
                                  <span>Yes</span>
                                </label>

                                <label className="flex items-center gap-2 cursor-pointer">
                                  <Field
                                    type="radio"
                                    name="is_group"
                                    checked={values.is_group === false}
                                    onChange={() => {
                                      setFieldValue("is_group", false);
                                      setFieldValue("group", "");
                                      setFieldValue("group_id", null);
                                    }}
                                    className="hidden peer"
                                  />
                                  <div className="w-5 h-5 flex items-center justify-center rounded-full border-2 border-gray-400 peer-checked:bg-[#42DA82] peer-checked:border-[#42DA82]">
                                    <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                                  </div>
                                  <span>No</span>
                                </label>
                              </div>
                            </div>

                            {/* Show Group Autocomplete only when is_group is true */}
                            {values.is_group && (
                              <div className="mt-4">
                                <GroupAutocomplete
                                  value={values.group}
                                  groupId={values.group_id}
                                  onChange={(
                                    name: string,
                                    id: number | null
                                  ) => {
                                    setFieldValue("group", name);
                                    setFieldValue("group_id", id);
                                  }}
                                  error={errors.group}
                                  touched={touched.group}
                                />
                              </div>
                            )}

                            {/* Text Area */}
                            <div className="mt-4">
                              <Field name="internal_notes">
                                {({ field, meta }: any) => (
                                  <div className="flex flex-col gap-2">
                                    <label className="text-[#24282E] text-[18px] font-[500] font-jakarta">
                                      Internal Notes
                                    </label>
                                    <textarea
                                      {...field}
                                      name="internal_notes"
                                      placeholder="Write Description Here"
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
                                )}
                              </Field>
                            </div>
                            {/* Image Upload Section */}
                            <div className="grid grid-cols-2 gap-6 my-3">
                              {/* Passport Upload */}
                              <div className="w-full">
                                <label className="text-[#24282E] font-jakarta font-[500] text-[18px] mb-2 block">
                                  Passport
                                </label>
                                <FileUploadBox
                                  filePreview={
                                    values.passport
                                      ? URL.createObjectURL(values.passport)
                                      : null
                                  }
                                  file={values.passport}
                                  onUpload={(file) =>
                                    setFieldValue("passport", file)
                                  }
                                  onRemove={() =>
                                    setFieldValue("passport", null)
                                  }
                                  inputId="passport-upload"
                                />
                              </div>

                              {/* Photo Upload */}
                              <div className="w-full">
                                <label className="text-[#24282E] font-jakarta font-[500] text-[18px] mb-2 block">
                                  Photo
                                </label>
                                <FileUploadBox
                                  filePreview={
                                    values.photo
                                      ? URL.createObjectURL(values.photo)
                                      : null
                                  }
                                  file={values.photo}
                                  onUpload={(file) =>
                                    setFieldValue("photo", file)
                                  }
                                  onRemove={() => setFieldValue("photo", null)}
                                  inputId="photo-upload"
                                />
                              </div>
                            </div>
                          </div>
                        </Form>
                      )}
                    </Formik>
                  )}

                  {currentStep === 2 && <NewApplication2 />}
                </div>
              </div>
              {/* Footer */}
              <div className="w-full">
                <hr className="my-2" />
                <div className="flex justify-end p-6 pt-0 items-center ">
                  <div className="flex gap-2 items-center">
                    <button className={styles.refundBtn}>
                      <CopyGreenSvg />
                      <span className="text-[12px] font-[600] underline">
                        Add Another Application for Same
                      </span>
                    </button>
                    <button
                      type="submit"
                      className="bg-[#42DA82] text-white px-6 py-2 rounded-[12px] font-semibold"
                   onClick={handleNextStep}
                   >
                      <span>Next Step</span>
                    </button>
                  </div>
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
