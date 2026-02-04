"use client";
import CrossSvg from "@/Assets/svgs/CrossSvg";
import styles from "./styles.module.css";
import { useEffect, useState, useRef, JSX, useMemo, useCallback } from "react";
import PdfSvg from "@/Assets/svgs/PdfSvg";
import EyeSvg from "@/Assets/svgs/EyeSvg";
import EditSvg from "@/Assets/svgs/EditSvg";
import CopySvg from "@/Assets/svgs/CopySvg";
import TicketSvg from "@/Assets/svgs/TicketSvg";
import { Check } from "lucide-react";
import PencilSvg from "@/Assets/svgs/PencilSvg";
import EditInfo from "../EditInfoModal/page";
import RefundAmount from "../RefundAmountModal/page";
import EditPersonalInfo from "../EditPersonalInfoModal/page";
import NewApplication from "../NewApplicationModal/page";
import { BASE_URL } from "@/utils/api";
import { ChevronDown, ChevronUp } from "lucide-react";
import GenericProfileImage from "@/Assets/Images/generic-profile.png";
import { getApiWithAuth, patchApiWithAuth, postAPIWithAuth, deleteApi } from "@/utils/api";
import { getAccessToken } from "@/utils/asyncStorage";
import StatusDropdown from "@/components/StatusDropdown/page";
import { toast } from "react-toastify";
import React from "react";

interface Document {
  id: number;
  document_id: number;
  document_type: string;
  file_path: string;
  original_filename: string;
  file_size: number;
  mime_type: string;
  status: string;
  created_at: string;
}

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: string;
  created_at: string;
}

interface Applicant {
  id: number;
  name: string;
  email: string;
  phone: string;
  passport_number: string;
  created_at: string;
}

interface ApplicationData {
  id: number;
  application_id: string;
  form_id: number | null;
  form_name: string | null;
  customer_id: number;
  applicant_id: number;
  visa_status: string;
  payment_status: string;
  priority: string;
  submitted_by: string;
  source: string;
  created_at: string;
  updated_at: string;
  values: Record<string, any>;
  documents?: Record<string, Document | Document[]>;
  visa_type?: {
    id: number;
    name: string;
    code: string;
    description: string;
    is_active: boolean;
    price: number;
    duration: number;
    currency: string;
    meta_data?: Record<string, any>;
    country?: {
      id: number;
      name: string;
      code: string;
      flag_emoji: string;
    };
  };
  extracted_visa_data?: Record<string, any>;
  customer?: Customer;
  applicant?: Applicant;
  background_processing_status?: {
    status: string;
    error: string | null;
    started_at: string;
    completed_at: string;
    steps: Record<string, { status: string; error: string | null }>;
  };
  internal_notes?: string;
}

interface BackgroundProcessingStatus {
  status: string;
  error: string | null;
  started_at: string;
  completed_at: string;
  steps: Record<string, { status: string; error: string | null }>;
}

interface ModalProps {
  setIsApplicationDetail: (value: boolean) => void;
  onClose: () => void;
  data: { id: number } | ApplicationData; // Can receive either just id or full data
}

const pollApplicationDetails = async (
  applicationData: ApplicationData | null,
  setApplicationData: React.Dispatch<React.SetStateAction<ApplicationData | null>>,
  pollingInterval: React.MutableRefObject<NodeJS.Timeout | null>
) => {
  if (applicationData?.id && applicationData.background_processing_status?.status === "in_progress") {
    try {
      const response: any = await getApiWithAuth(`form-submissions/${applicationData.id}`);
      if (response.success && response.data) {
        setApplicationData(response.data);

        // Stop polling if status is no longer 'in_progress'
        if (response.data.background_processing_status?.status !== "in_progress") {
          if (pollingInterval.current) {
            clearInterval(pollingInterval.current);
            pollingInterval.current = null;
          }
        }
      } else {
        toast.error("Failed to refresh application details");
      }
    } catch (error) {
      console.error("Error polling application details:", error);
      toast.error("Error while polling application details");
    }
  }
};

const ApplicationDetail: React.FC<ModalProps> = ({
  onClose,
  data,
}) => {
  const [isRefund, setIsRefund] = useState<boolean>(false);
  const [isPersonalEdit, setIsPersonalEdit] = useState<boolean>(false);
  const [isNewApplication, setIsNewApplication] = useState<boolean>(false);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [accordionState, setAccordionState] = useState<Record<string, boolean>>({});
  const [applicationData, setApplicationData] = useState<ApplicationData | null>(null);
  const [defaultValues, setDefaultValues] = useState<any>(null); // Store default values from API
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);
  const [imageModal, setImageModal] = useState<{ isOpen: boolean; imageUrl: string; alt: string }>({
    isOpen: false,
    imageUrl: '',
    alt: ''
  });
  // State for inline editing
  const [editingFields, setEditingFields] = useState<Record<string, { value: any; originalValue: any; isSaving: boolean }>>({});
  const passportPhotoInputRef = useRef<HTMLInputElement | null>(null);
  const otherDocumentsInputRef = useRef<HTMLInputElement | null>(null);
  const [isUpdatingImage, setIsUpdatingImage] = useState(false);
  
  // Comments state
  const [comments, setComments] = useState<any[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Issues state
  const [issues, setIssues] = useState<any[]>([]);
  const [isLoadingIssues, setIsLoadingIssues] = useState(false);
  const [showIssueForm, setShowIssueForm] = useState(false);
  const [selectedIssueType, setSelectedIssueType] = useState("");
  const [issueNotes, setIssueNotes] = useState("");
  const [sendNotification, setSendNotification] = useState(true);
  const [isSubmittingIssue, setIsSubmittingIssue] = useState(false);

  // Fetch default values for the country
  useEffect(() => {
    const fetchDefaultValues = async () => {
      if (!applicationData) return;

      // Map country codes to country names (API expects names, not codes)
      const countryCodeToName: Record<string, string> = {
        "in": "india",
        "vn": "vietnam",
        "india": "india",
        "vietnam": "vietnam",
      };

      // Get country from visa_type or extracted_visa_data or default to "india"
      let countryName = "india"; // Default fallback

      // Priority 1: Use country name from visa_type
      if (applicationData.visa_type?.country?.name) {
        countryName = applicationData.visa_type.country.name.toLowerCase();
      }
      // Priority 2: Map country code to name
      else if (applicationData.visa_type?.country?.code) {
        const code = applicationData.visa_type.country.code.toLowerCase();
        countryName = countryCodeToName[code] || code; // Fallback to code if not in map
      }
      // Priority 3: Try to get country from extracted data
      else if (applicationData.extracted_visa_data?.step_01_registration?.nationality_region) {
        const nationality = String(applicationData.extracted_visa_data.step_01_registration.nationality_region).toLowerCase();
        if (nationality.includes("india")) countryName = "india";
        else if (nationality.includes("vietnam")) countryName = "vietnam";
      }

      try {
        const response: any = await getApiWithAuth(`visa-default-values/${countryName}`);
        if (response.success && response.data?.data?.default_value) {
          const defaultValueData = response.data.data.default_value;
          setDefaultValues(defaultValueData);
          console.log("Default values fetched successfully for country:", countryName, defaultValueData);
        } else {
          console.warn("No default values in response:", response);
        }
      } catch (error) {
        console.error("Error fetching default values:", error);
        // Don't show error toast, just continue without defaults
      }
    };

    fetchDefaultValues();
  }, [applicationData]);

  useEffect(() => {
    const fetchApplicationDetails = async () => {
      if (data && 'application_id' in data) {
        setApplicationData(data as ApplicationData);
        return;
      }

      if (data && 'id' in data) {
        setIsLoading(true);
        try {
          const response: any = await getApiWithAuth(`form-submissions/${data.id}`);
          if (response.success && response.data) {
            setApplicationData(response.data);

            // Stop polling if status is no longer 'in_progress'
            if (response.data.background_processing_status?.status !== "in_progress") {
              if (pollingInterval.current) {
                clearInterval(pollingInterval.current);
                pollingInterval.current = null;
              }
            }
          } else {
            toast.error("Failed to load application details");
            onClose();
          }
        } catch (error) {
          console.error("Error loading application details:", error);
          toast.error("Failed to load application details");
          onClose();
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchApplicationDetails();
  }, [data]);

  // Fetch comments when application data is loaded
  useEffect(() => {
    const fetchComments = async () => {
      if (!applicationData?.id) return;
      
      setIsLoadingComments(true);
      try {
        const response: any = await getApiWithAuth(`applications/${applicationData.id}/comments`);
        if (response.success && response.data?.data) {
          // Sort by created_at descending (newest first)
          const sortedComments = [...response.data.data].sort((a: any, b: any) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
          setComments(sortedComments);
        } else {
          setComments([]);
        }
      } catch (error) {
        console.error("Error fetching comments:", error);
        setComments([]);
      } finally {
        setIsLoadingComments(false);
      }
    };

    fetchComments();
  }, [applicationData?.id]);

  // Fetch issues when status is "have_issues"
  useEffect(() => {
    const fetchIssues = async () => {
      if (!applicationData?.id || applicationData.visa_status !== "have_issues") {
        setIssues([]);
        setShowIssueForm(false);
        setSelectedIssueType("");
        setIssueNotes("");
        setSendNotification(true);
        return;
      }

      setIsLoadingIssues(true);
      try {
        const response: any = await getApiWithAuth(
          `applications/${applicationData.id}/issues`
        );
        if (response.success && response.data?.data?.current_issues) {
          setIssues(Array.isArray(response.data.data.current_issues) ? response.data.data.current_issues : []);
        } else {
          setIssues([]);
        }
      } catch (error) {
        console.error("Error fetching issues:", error);
        setIssues([]);
      } finally {
        setIsLoadingIssues(false);
      }
    };

    fetchIssues();
  }, [applicationData?.id, applicationData?.visa_status]);

  useEffect(() => {
    if (applicationData?.background_processing_status?.status === "in_progress") {
      pollingInterval.current = setInterval(
        () => pollApplicationDetails(applicationData, setApplicationData, pollingInterval),
        5000
      );
    }

    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    };
  }, [applicationData?.background_processing_status?.status]);

  // Helper function to check if a value is empty/N/A
  const isEmptyOrNA = (value: any): boolean => {
    if (value === null || value === undefined) return true;
    const strValue = String(value).trim();
    return strValue === "" || strValue.toLowerCase() === "n/a";
  };

  // Helper function to check if a default value is valid
  const isValidDefault = (value: any): boolean => {
    if (value === null || value === undefined) return false;
    const strValue = String(value).trim();
    return strValue !== "" && strValue.toLowerCase() !== "n/a";
  };

  // Merge extracted visa data with default values
  const mergeWithDefaults = (extractedData: any, defaults: any): any => {
    // If no defaults yet, return extracted data (will merge when defaults load)
    if (!defaults || !extractedData) {
      console.log("Merge skipped - defaults:", !!defaults, "extractedData:", !!extractedData);
      return extractedData;
    }

    const merged: any = {};

    // Get all section keys from both extracted and default data
    const allSectionKeys = new Set([
      ...Object.keys(extractedData),
      ...Object.keys(defaults)
    ]);

    // Iterate through each section
    allSectionKeys.forEach((sectionKey) => {
      merged[sectionKey] = {};
      const extractedSection = extractedData[sectionKey] || {};
      const defaultSection = defaults[sectionKey] || {};

      // Get all field keys from both extracted and default sections
      const allFieldKeys = new Set([
        ...Object.keys(extractedSection),
        ...Object.keys(defaultSection)
      ]);

      allFieldKeys.forEach((fieldKey) => {
        const extractedValue = extractedSection[fieldKey];
        const defaultValue = defaultSection[fieldKey];

        // If extracted value is empty/N/A and default exists, use default
        if (isEmptyOrNA(extractedValue) && isValidDefault(defaultValue)) {
          merged[sectionKey][fieldKey] = defaultValue;
        }
        // If extracted value exists and is not empty, use it
        else if (!isEmptyOrNA(extractedValue)) {
          // Handle nested objects
          if (typeof extractedValue === "object" && extractedValue !== null && !Array.isArray(extractedValue)) {
            if (typeof defaultValue === "object" && defaultValue !== null) {
              // Recursively merge nested objects
              const nestedMerged: any = {};
              const allNestedKeys = new Set([
                ...Object.keys(extractedValue),
                ...Object.keys(defaultValue)
              ]);

              allNestedKeys.forEach((nestedKey) => {
                const nestedExtracted = extractedValue[nestedKey];
                const nestedDefault = defaultValue[nestedKey];

                if (isEmptyOrNA(nestedExtracted) && isValidDefault(nestedDefault)) {
                  nestedMerged[nestedKey] = nestedDefault;
                } else if (!isEmptyOrNA(nestedExtracted)) {
                  nestedMerged[nestedKey] = nestedExtracted;
                } else {
                  nestedMerged[nestedKey] = nestedExtracted !== undefined ? nestedExtracted : nestedDefault;
                }
              });

              merged[sectionKey][fieldKey] = nestedMerged;
            } else {
              merged[sectionKey][fieldKey] = extractedValue;
            }
          } else {
            merged[sectionKey][fieldKey] = extractedValue;
          }
        }
        // If extracted value is empty but no default, use extracted (which will be empty/N/A)
        else {
          merged[sectionKey][fieldKey] = extractedValue !== undefined ? extractedValue : defaultValue;
        }
      });
    });

    return merged;
  };

  // Compute merged data using useMemo to ensure it updates when defaultValues or extracted_visa_data changes
  const mergedVisaData = useMemo(() => {
    if (!applicationData?.extracted_visa_data) return null;
    const merged = mergeWithDefaults(applicationData.extracted_visa_data, defaultValues);

    // Debug logging
    console.log("=== useMemo: Merging Data ===");
    console.log("Default values:", defaultValues);
    console.log("Extracted data:", applicationData.extracted_visa_data);
    console.log("Merged data:", merged);

    // Example check for specific field
    if (defaultValues?.step_01_registration?.visa_service) {
      console.log("Default visa_service:", defaultValues.step_01_registration.visa_service);
      console.log("Extracted visa_service:", applicationData.extracted_visa_data?.step_01_registration?.visa_service);
      console.log("Merged visa_service:", merged?.step_01_registration?.visa_service);
    }

    return merged;
  }, [applicationData?.extracted_visa_data, defaultValues]);

  const renderExtractedVisaData = () => {
    if (applicationData?.background_processing_status?.status === "in_progress") {
      return (
        <div className={`flex flex-col gap-4 ${styles.mainDiv}`}>
          <h1 className="text-[20px] font-[600] text-[#24288E]">Extracted Visa Data</h1>
          <p className="text-[14px] font-[500] text-[#727A90]">Under processing...</p>
        </div>
      );
    }

    if (
      applicationData?.extracted_visa_data &&
      Object.keys(applicationData.extracted_visa_data).length > 0
    ) {
      // Merge extracted data with default values
      const mergedData = mergeWithDefaults(applicationData.extracted_visa_data, defaultValues);

      // Debug logging
      console.log("=== Merging Data ===");
      console.log("Default values:", defaultValues);
      console.log("Extracted data:", applicationData.extracted_visa_data);
      console.log("Merged data:", mergedData);

      // Example check for specific field
      if (defaultValues?.step_01_registration?.visa_service) {
        console.log("Default visa_service:", defaultValues.step_01_registration.visa_service);
        console.log("Extracted visa_service:", applicationData.extracted_visa_data?.step_01_registration?.visa_service);
        console.log("Merged visa_service:", mergedData?.step_01_registration?.visa_service);
      }

      return (
        <div className={`flex flex-col gap-4 ${styles.mainDiv}`}>
          <h1 className="text-[20px] font-[600] text-[#24482E]">Extracted Visa Data</h1>
          <div className="flex flex-col gap-3">
            {Object.entries(mergedData).map(([sectionKey, sectionValue]) => {
              const isOpen = accordionState[sectionKey] ?? false;
              return (
                <div
                  key={sectionKey}
                  className="border border-[#E9EAEA] rounded-[12px] overflow-hidden bg-white"
                >
                  <button
                    type="button"
                    onClick={() => toggleAccordion(sectionKey)}
                    className="w-full flex items-center justify-between px-5 py-3 hover:bg-[#42DA8210] transition-colors"
                  >
                    <span className="text-[16px] font-[600] text-[#24282E]">
                      {formatSectionTitle(sectionKey)}
                    </span>
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 text-[#24282E]" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-[#24282E]" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-5 py-4 flex flex-col gap-4">
                      {renderObjectContent(
                        sectionValue,
                        sectionKey,
                        0,
                        startEditing,
                        cancelEditing,
                        updateEditingValue,
                        saveField,
                        editingFields,
                        defaultValues
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    return (
      <div className={`flex flex-col gap-4 ${styles.mainDiv}`}>
        <h1 className="text-[20px] font-[600] text-[#24282E]">Extracted Visa Data</h1>
        <p className="text-[14px] font-[550] text-[#727A90]">No extracted visa data available.</p>
      </div>
    );
  };

  const toggleAccordion = (sectionKey: string) => {
    setAccordionState((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
  };

  // Get dynamic field values from customer/applicant or values
  const name = applicationData?.applicant?.name || applicationData?.customer?.name || getValue(applicationData, "full_name") || getValue(applicationData, "name") || "N/A";
  const email = applicationData?.applicant?.email || applicationData?.customer?.email || getValue(applicationData, "email") || "N/A";
  const phone = applicationData?.applicant?.phone || applicationData?.customer?.phone || getValue(applicationData, "phone") || getValue(applicationData, "phone_number") || "N/A";
  const passportNumber = applicationData?.applicant?.passport_number || getValue(applicationData, "passport_number") || "N/A";
  const visaType = getValue(applicationData, "visa_type") || getValue(applicationData, "purpose_of_visit") || "N/A";
  const country = getValue(applicationData, " nationality") || getValue(applicationData, "birth_country") || "India";
  const arrivalDate = getValue(applicationData, "arrival_date") || getValue(applicationData, "flight_date") || "N/A";
  const departureDate = getValue(applicationData, "departure_date") || "N/A";
  const purposeOfVisit = getValue(applicationData, "purpose_of_visit") || "N/A";
  const accommodationDetails = getValue(applicationData, "accommodation_details") || "N/A";
  const travelHistory = getValue(applicationData, "travel_history") || "N/A";
  const birthDate = getValue(applicationData, " birth_date") || getValue(applicationData, "date_of_birth") || "N/A";
  const gender = getValue(applicationData, "gender") || "N/A";

  // Get document info (file_path, original_filename) - supports both key and document_type lookup
  const userPhotoDoc = getDocumentInfo(applicationData, "user_photo", "USER_PHOTO");
  const passportPhotoDoc = getDocumentInfo(applicationData, "passport_photo", "PASSPORT_PHOTO");
  const passportPdfDoc = getDocumentInfo(applicationData, "passport_photo_pdf", "PASSPORT_PHOTO_PDF");
  const nationalIdCardDoc = getDocumentInfo(applicationData, "national_id_card_photo", "NATIONAL_ID_CARD_PHOTO");
  const otherDocumentsDoc = getDocumentInfo(applicationData, "other_documents", "OTHER_DOCUMENTS");

  const photoUrl = userPhotoDoc?.file_path || passportPhotoDoc?.file_path;
  const passportPhotoUrl = passportPhotoDoc?.file_path || nationalIdCardDoc?.file_path || photoUrl;
  const nationalIdCardPhotoUrl = nationalIdCardDoc?.file_path;
  const otherDocumentsUrl = otherDocumentsDoc?.file_path;

  const displayPhotoUrl = photoUrl || GenericProfileImage.src;
  const displayPassportPhotoUrl = passportPhotoUrl || GenericProfileImage.src;
  const displayNationalIdCardPhotoUrl = nationalIdCardPhotoUrl || GenericProfileImage.src;
  const displayOtherDocumentsUrl = otherDocumentsUrl || GenericProfileImage.src;

  const hasProfilePhoto = userPhotoDoc !== null;
  const hasPassportPhoto = passportPhotoDoc !== null;
  const hasPassportPdf = passportPdfDoc !== null;
  const hasNationalIdCardPhoto = nationalIdCardDoc !== null;
  const hasOtherDocuments = otherDocumentsDoc !== null;

  const handleDownload = async (filePath: string, filename: string) => {
    try {
      const res = await fetch(filePath, { mode: "cors" });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Download failed. Opening in new tab.");
      window.open(filePath, "_blank");
    }
  };

  const validateFile = (file: File, allowPdf: boolean = false): boolean => {
    const fileExtension = file.name.split(".").pop()?.toLowerCase();
    const validExtensions = allowPdf 
      ? ["jpg", "jpeg", "png", "pdf"]
      : ["jpg", "jpeg", "png"];

    if (!fileExtension || !validExtensions.includes(fileExtension)) {
      toast.error(allowPdf 
        ? "Please upload only JPG, PNG, or PDF files"
        : "Please upload only JPG or PNG images");
      return false;
    }

    const validMimeTypes = allowPdf
      ? ["image/jpeg", "image/jpg", "image/png", "application/pdf"]
      : ["image/jpeg", "image/jpg", "image/png"];
    if (!validMimeTypes.includes(file.type)) {
      toast.error(allowPdf
        ? "Please upload only JPG, PNG, or PDF files"
        : "Please upload only JPG or PNG images");
      return false;
    }

    return true;
  };

  const uploadImage = async (
    fieldKey: "user_photo" | "passport_photo" | "other_documents",
    file: File
  ) => {
    if (!applicationData) return;
    
    // For other_documents, allow PDFs too
    const allowPdf = fieldKey === "other_documents";
    if (!validateFile(file, allowPdf)) return;

    setIsUpdatingImage(true);
    try {
      const formData = new FormData();
      formData.append(fieldKey, file);

      const token = await getAccessToken();
      const headers: Record<string, string> = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const apiUrl = `${BASE_URL}applications/quick-entry/${applicationData.id}`;

      const response = await fetch(apiUrl, {
        method: "PUT",
        headers,
        body: formData,
      });

      let data: any = null;
      try {
        data = await response.json();
      } catch {
        // ignore JSON parse errors
      }

      if (data?.success || response.ok) {
        toast.success(fieldKey === "other_documents" 
          ? "Document updated successfully" 
          : "Image updated successfully");
        // Refresh application details to show latest images
        try {
          const refreshed: any = await getApiWithAuth(
            `form-submissions/${applicationData.id}`
          );
          if (refreshed.success && refreshed.data) {
            setApplicationData(refreshed.data);
          }
        } catch (err) {
          console.error("Failed to refresh application after image update", err);
        }
      } else {
        toast.error(data?.message || (fieldKey === "other_documents" 
          ? "Failed to update document" 
          : "Failed to update image"));
      }
    } catch (error: any) {
      console.error("Error updating file:", error);
      toast.error(error?.message || (fieldKey === "other_documents" 
        ? "Failed to update document" 
        : "Failed to update image"));
    } finally {
      setIsUpdatingImage(false);
    }
  };

  // Issue types - matching API enum values
  const ISSUE_TYPES = [
    { value: "passport_light_effect", label: "Passport Light Effect" },
    { value: "passport_crop", label: "Passport Crop" },
    { value: "passport_blur", label: "Passport Blur" },
    { value: "passport_expired", label: "Passport Expired" },
    { value: "passport_validity_less_6_months", label: "Passport Validity Less Than 6 Months" },
    { value: "photo_blur", label: "Photo Blur" },
    { value: "photo_not_straight_camera_view", label: "Photo Not Straight Camera View" },
    { value: "photo_not_recent_or_selfie", label: "Photo Not Recent or Selfie" },
    { value: "information_missing", label: "Information Missing" },
  ];

  const handleReportIssue = async () => {
    if (!applicationData?.id || !selectedIssueType.trim()) {
      toast.error("Please select an issue type");
      return;
    }

    setIsSubmittingIssue(true);
    try {
      const response: any = await postAPIWithAuth(
        `applications/${applicationData.id}/report-issue`,
        {
          issue_type: selectedIssueType,
          additional_notes: issueNotes.trim() || "",
          send_notification: sendNotification,
        }
      );

      if (response.success) {
        toast.success("Issue reported successfully");
        setShowIssueForm(false);
        setSelectedIssueType("");
        setIssueNotes("");
        setSendNotification(true);
        // Refresh issues list
        const issuesResponse: any = await getApiWithAuth(
          `applications/${applicationData.id}/issues`
        );
        if (issuesResponse.success && issuesResponse.data?.data?.current_issues) {
          setIssues(
            Array.isArray(issuesResponse.data.data.current_issues)
              ? issuesResponse.data.data.current_issues
              : []
          );
        }
      } else {
        toast.error(
          response.data?.message || "Failed to report issue. Please try again."
        );
      }
    } catch (error: any) {
      console.error("Error reporting issue:", error);
      toast.error(error?.message || "Failed to report issue. Please try again.");
    } finally {
      setIsSubmittingIssue(false);
    }
  };

  const handleResolveIssue = async (issueType: string) => {
    if (!applicationData?.id) return;

    try {
      const response: any = await deleteApi(
        `applications/${applicationData.id}/issues/${issueType}`
      );

      if (response.success) {
        toast.success("Issue resolved successfully");
        // Refresh issues list
        const issuesResponse: any = await getApiWithAuth(
          `applications/${applicationData.id}/issues`
        );
        if (issuesResponse.success && issuesResponse.data?.data?.current_issues) {
          setIssues(
            Array.isArray(issuesResponse.data.data.current_issues)
              ? issuesResponse.data.data.current_issues
              : []
          );
        }
      } else {
        toast.error(
          response.data?.message || "Failed to resolve issue. Please try again."
        );
      }
    } catch (error: any) {
      console.error("Error resolving issue:", error);
      toast.error(error?.message || "Failed to resolve issue. Please try again.");
    }
  };

  const handleAddComment = async () => {
    if (!applicationData?.id || !newComment.trim()) return;

    setIsSubmittingComment(true);
    try {
      const response: any = await postAPIWithAuth(
        `applications/${applicationData.id}/comments`,
        {
          content: newComment.trim(),
          author_type: "employee",
        }
      );

      if (response.success) {
        toast.success("Comment added successfully");
        setNewComment("");
        // Refresh comments
        const commentsResponse: any = await getApiWithAuth(
          `applications/${applicationData.id}/comments`
        );
        if (commentsResponse.success && commentsResponse.data?.data) {
          const sortedComments = [...commentsResponse.data.data].sort(
            (a: any, b: any) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          );
          setComments(sortedComments);
        }
      } else {
        toast.error(
          response.data?.message || "Failed to add comment. Please try again."
        );
      }
    } catch (error: any) {
      console.error("Error adding comment:", error);
      toast.error(error?.message || "Failed to add comment. Please try again.");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Inline editing functions
  const startEditing = (fieldPath: string, currentValue: any) => {
    setEditingFields((prev) => ({
      ...prev,
      [fieldPath]: {
        value: currentValue,
        originalValue: currentValue,
        isSaving: false,
      },
    }));
  };

  const cancelEditing = (fieldPath: string) => {
    setEditingFields((prev) => {
      const newState = { ...prev };
      delete newState[fieldPath];
      return newState;
    });
  };

  const updateEditingValue = (fieldPath: string, newValue: any) => {
    setEditingFields((prev) => ({
      ...prev,
      [fieldPath]: {
        ...prev[fieldPath],
        value: newValue,
      },
    }));
  };

  const saveField = async (fieldPath: string, fieldName: string) => {
    if (!applicationData) return;

    const editingField = editingFields[fieldPath];
    if (!editingField) return;

    // Check if value changed
    if (editingField.value === editingField.originalValue) {
      cancelEditing(fieldPath);
      return;
    }

    // Set saving state
    setEditingFields((prev) => ({
      ...prev,
      [fieldPath]: {
        ...prev[fieldPath],
        isSaving: true,
      },
    }));

    try {
      // Update the extracted_visa_data in the applicationData
      const pathParts = fieldPath.split('.');
      const sectionKey = pathParts[0]; // e.g., "step_01_registration"
      const fieldKey = pathParts[pathParts.length - 1]; // e.g., "nationality_region"

      // Create updated extracted_visa_data
      const updatedExtractedData = { ...applicationData.extracted_visa_data };
      if (!updatedExtractedData[sectionKey]) {
        updatedExtractedData[sectionKey] = {};
      }

      // Navigate to the nested field and update it
      let current = updatedExtractedData[sectionKey];
      for (let i = 1; i < pathParts.length - 1; i++) {
        if (!current[pathParts[i]]) {
          current[pathParts[i]] = {};
        }
        current = current[pathParts[i]];
      }
      current[fieldKey] = editingField.value;

      // Call API to update - send complete extracted_visa_data
      const response: any = await patchApiWithAuth(`applications/${applicationData.id}/extracted-visa-data`, {
        extracted_visa_data: updatedExtractedData,
      });

      if (response?.success) {
        // Update local state
        setApplicationData((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            extracted_visa_data: updatedExtractedData,
          };
        });
        toast.success("Field updated successfully");
        cancelEditing(fieldPath);
      } else {
        toast.error(response?.data?.message || "Failed to update field");
        setEditingFields((prev) => ({
          ...prev,
          [fieldPath]: {
            ...prev[fieldPath],
            isSaving: false,
          },
        }));
      }
    } catch (error: any) {
      console.error("Error updating field:", error);
      toast.error(error?.message || "Failed to update field");
      setEditingFields((prev) => ({
        ...prev,
        [fieldPath]: {
          ...prev[fieldPath],
          isSaving: false,
        },
      }));
    }
  };

  // Show loading state
  if (isLoading || !applicationData) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[90]">
        <div className="bg-white rounded-lg p-8">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-4 border-[#42DA82] border-t-transparent rounded-full animate-spin"></div>
            <span className="text-[14px] text-[#727A90]">Loading application details...</span>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[90]">
      <div
        className={`bg-white w-[880px] rounded-lg shadow-lg relative ${styles.modalMain}`}
      >
        {isRefund ? (
          <RefundAmount setIsRefund={setIsRefund} onClose={onClose} />
        ) : isNewApplication ? (
          <NewApplication
            setIsNewApplication={setIsNewApplication}
            onClose={onClose}
          />
        ) : isPersonalEdit ? (
          <EditPersonalInfo
            onClose={onClose}
          />
        ) : (
          <>
            <div className="flex justify-between p-6 pb-0 items-center">
              <h2 className="text-lg font-semibold">Application Details</h2>
              <button
                onClick={onClose}
                className="border-[#E9EAEA] border-[1px] p-2 rounded-[10px]"
              >
                <CrossSvg size={24} />
              </button>
            </div>
            <hr className="my-3" />

            <div className="grid grid-cols-12 px-6 gap-4">
              <div className="col-span-5">
                <div
                  className={`flex flex-col items-center mb-2 ${styles.mainDiv}`}
                >
                  <img
                    src={displayPhotoUrl}
                    alt="Profile"
                    className="w-[120px] h-[120px] rounded-[16px] object-cover cursor-pointer hover:opacity-80 transition-opacity"
                    crossOrigin="anonymous"
                    onClick={() => {
                      if (hasProfilePhoto && userPhotoDoc) {
                        setImageModal({
                          isOpen: true,
                          imageUrl: userPhotoDoc.file_path,
                          alt: "Profile Photo",
                        });
                      } else if (displayPhotoUrl !== GenericProfileImage.src) {
                        setImageModal({
                          isOpen: true,
                          imageUrl: displayPhotoUrl,
                          alt: "Profile Photo",
                        });
                      }
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        GenericProfileImage.src;
                    }}
                  />
                  <p className="mt-2 font-medium">{String(name)}</p>
                  <span className="text-gray-500 text-sm">Photo</span>
                  {hasProfilePhoto && userPhotoDoc && (
                    <div className="flex gap-2 mt-3 justify-center">
                      <button
                        onClick={() => handleDownload(userPhotoDoc.file_path, userPhotoDoc.original_filename)}
                        className="bg-[#42DA82] text-white px-3 py-1.5 rounded-[12px] font-semibold text-[12px] whitespace-nowrap"
                        title="Download Profile Photo"
                      >
                        Download
                      </button>
                    </div>
                  )}
                </div>
                <div
                  className={`flex flex-col items-center mb-2 ${styles.mainDiv}`}
                >
                  <div className="relative">
                    <img
                      src={displayPassportPhotoUrl}
                      alt="Passport"
                      className="w-[120px] h-[120px] rounded-[16px] object-cover cursor-pointer hover:opacity-80 transition-opacity"
                      crossOrigin="anonymous"
                      onClick={() => {
                        if (hasPassportPhoto && passportPhotoDoc) {
                          setImageModal({
                            isOpen: true,
                            imageUrl: passportPhotoDoc.file_path,
                            alt: "Passport Photo",
                          });
                        } else if (
                          displayPassportPhotoUrl !== GenericProfileImage.src
                        ) {
                          setImageModal({
                            isOpen: true,
                            imageUrl: displayPassportPhotoUrl,
                            alt: "Passport Photo",
                          });
                        }
                      }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          GenericProfileImage.src;
                      }}
                    />
                    <button
                      type="button"
                      disabled={isUpdatingImage}
                      onClick={() => passportPhotoInputRef.current?.click()}
                      className="absolute right-1 bottom-1 rounded-full p-1.5 shadow-md border border-white bg-[#42DA82] hover:bg-[#2fb96a] disabled:opacity-60"
                      title="Update passport picture"
                    >
                      <PencilSvg />
                    </button>
                    <input
                      ref={passportPhotoInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          uploadImage("passport_photo", file);
                          e.target.value = "";
                        }
                      }}
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-500">Passport Picture</p>
                  {(hasPassportPhoto || hasPassportPdf) && (
                    <div className="flex gap-2 mt-3 justify-center">
                      {passportPhotoDoc && (
                        <button
                          onClick={() => handleDownload(passportPhotoDoc.file_path, passportPhotoDoc.original_filename)}
                          className="bg-[#42DA82] text-white px-3 py-1.5 rounded-[12px] font-semibold text-[12px] whitespace-nowrap"
                          title="Download Passport Photo"
                        >
                          Download Image
                        </button>
                      )}
                      {passportPdfDoc && (
                        <button
                          onClick={() => handleDownload(passportPdfDoc.file_path, passportPdfDoc.original_filename)}
                          className="bg-[#42DA82] text-white px-3 py-1.5 rounded-[12px] font-semibold text-[12px] whitespace-nowrap"
                          title="Download Passport PDF"
                        >
                          Download PDF
                        </button>
                      )}
                    </div>
                  )}
                </div>
                {hasNationalIdCardPhoto && (
                  <div
                    className={`flex flex-col items-center mb-2 ${styles.mainDiv}`}
                  >
                    <img
                      src={displayNationalIdCardPhotoUrl}
                      alt="National ID Card"
                      className="w-[120px] h-[120px] rounded-lg object-cover"
                      crossOrigin="anonymous"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = GenericProfileImage.src;
                      }}
                    />
                    <p className="mt-2 text-sm text-gray-500">National ID Card</p>
                    <div className="flex gap-2 mt-3 justify-center">
                      <button
                        onClick={() => handleDownload(nationalIdCardDoc!.file_path, nationalIdCardDoc!.original_filename)}
                        className="bg-[#42DA82] text-white px-3 py-1.5 rounded-[12px] font-semibold text-[12px] whitespace-nowrap"
                        title="Download National ID Card Photo"
                      >
                        Download
                      </button>
                    </div>
                  </div>
                )}
                {/* Other Documents Section - Always Visible */}
                <div
                  className={`flex flex-col items-center mb-2 ${styles.mainDiv}`}
                >
                  {hasOtherDocuments ? (
                    <>
                      <div className="relative">
                        {(() => {
                          const isPdf = otherDocumentsDoc?.original_filename?.toLowerCase().endsWith(".pdf") ||
                                       otherDocumentsDoc?.file_path?.toLowerCase().endsWith(".pdf");
                          return isPdf ? (
                            <div className="w-[120px] h-[120px] rounded-[16px] border border-gray-200 bg-gray-100 flex items-center justify-center">
                              <PdfSvg className="w-12 h-12 text-gray-400" />
                            </div>
                          ) : (
                          <img
                            src={displayOtherDocumentsUrl}
                            alt="Other Documents"
                            className="w-[120px] h-[120px] rounded-[16px] object-cover cursor-pointer hover:opacity-80 transition-opacity"
                            crossOrigin="anonymous"
                            onClick={() => {
                              if (otherDocumentsDoc) {
                                setImageModal({
                                  isOpen: true,
                                  imageUrl: otherDocumentsDoc.file_path,
                                  alt: "Other Documents",
                                });
                              }
                            }}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = GenericProfileImage.src;
                            }}
                          />
                          );
                        })()}
                        <button
                          type="button"
                          disabled={isUpdatingImage}
                          onClick={() => otherDocumentsInputRef.current?.click()}
                          className="absolute right-1 bottom-1 rounded-full p-1.5 shadow-md border border-white bg-[#42DA82] hover:bg-[#2fb96a] disabled:opacity-60"
                          title="Update other documents"
                        >
                          <PencilSvg />
                        </button>
                        <input
                          ref={otherDocumentsInputRef}
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,application/pdf"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              uploadImage("other_documents", file);
                              e.target.value = "";
                            }
                          }}
                        />
                      </div>
                      <p className="mt-2 text-sm text-gray-500">Other Documents</p>
                      <div className="flex gap-2 mt-3 justify-center">
                        <button
                          onClick={() => handleDownload(otherDocumentsDoc!.file_path, otherDocumentsDoc!.original_filename)}
                          className="bg-[#42DA82] text-white px-3 py-1.5 rounded-[12px] font-semibold text-[12px] whitespace-nowrap"
                          title="Download Other Documents"
                        >
                          Download
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-[120px] h-[120px] rounded-[16px] border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center">
                        <PdfSvg className="w-12 h-12 text-gray-400" />
                      </div>
                      <p className="mt-2 text-sm text-gray-500">Other Documents</p>
                      <button
                        type="button"
                        disabled={isUpdatingImage}
                        onClick={() => otherDocumentsInputRef.current?.click()}
                        className="bg-[#42DA82] text-white px-4 py-2 rounded-[12px] font-semibold text-[12px] whitespace-nowrap hover:bg-[#2fb96a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-3"
                        title="Upload other documents"
                      >
                        {isUpdatingImage ? "Uploading..." : "Upload Other Documents"}
                      </button>
                      <input
                        ref={otherDocumentsInputRef}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,application/pdf"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            uploadImage("other_documents", file);
                            e.target.value = "";
                          }
                        }}
                      />
                    </>
                  )}
                </div>
                <div
                  className={`flex flex-col items-center mb-2 ${styles.mainDiv}`}
                >
                  <div className="w-full">
                    <div className="flex justify-between items-center">
                      <p className="text-[14px] font-[500] text-[#727A90]">
                        Official Application ID
                      </p>
                      {/* <button onClick={() => setIsPersonalEdit(true)}>
                        <EditSvg />
                      </button> */}
                    </div>
                    <p className="w-full text-[14px] font-[500] text-[#24282E]">
                      {applicationData.application_id}
                    </p>
                  </div>
                  <div className="w-full flex flex-col gap-1 my-4">
                    <p className="text-[14px] font-[500] text-[#727A90]">
                      Visa Type
                    </p>
                    <span className={`max-w-[200px]${styles.tableChip}`}>
                      {applicationData?.visa_type?.name || "N/A"}
                    </span>
                  </div>
                  <div className="w-full flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                      <p className="text-[14px] font-[500] text-[#727A90]">
                        Passport Number
                      </p>
                      <p className="w-full text-[14px] font-[500] text-[#24282E]">
                        {String(passportNumber)}
                      </p>
                    </div>
                    {/* <CopySvg /> */}
                  </div>
                </div>
                
                {/* Comments Section */}
                <div className={`flex flex-col gap-3 ${styles.mainDiv} mt-4`}>
                  <h3 className="text-[14px] font-[600] text-[#24282E] mb-2">
                    Comments
                  </h3>
                  
                  {/* Add Comment Form */}
                  <div className="flex flex-col gap-2">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      className="w-full px-3 py-2 text-[14px] border border-[#E9EAEA] rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#42DA82]/20 resize-none"
                      rows={3}
                      disabled={isSubmittingComment}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                          handleAddComment();
                        }
                      }}
                    />
                    <button
                      onClick={handleAddComment}
                      disabled={!newComment.trim() || isSubmittingComment}
                      className="w-full px-4 py-2 bg-[#42DA82] text-white rounded-[8px] font-medium text-[14px] hover:bg-[#2fb96a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSubmittingComment ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Adding...</span>
                        </>
                      ) : (
                        "Add Comment"
                      )}
                    </button>
                  </div>

                  {/* Comments List */}
                  <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-2">
                    {isLoadingComments ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="w-5 h-5 border-2 border-[#42DA82] border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    ) : comments.length === 0 ? (
                      <p className="text-[12px] text-[#727A90] text-center py-4">
                        No comments yet. Be the first to add one!
                      </p>
                    ) : (
                      comments.map((comment: any) => {
                        const commentDate = new Date(comment.created_at);
                        const formattedDate = commentDate.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        });
                        const formattedTime = commentDate.toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        });

                        return (
                          <div
                            key={comment.id}
                            className="bg-[#F9FAFB] rounded-[8px] p-3 border border-[#E9EAEA]"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex flex-col">
                                <p className="text-[13px] font-[600] text-[#24282E]">
                                  {comment.author_name || "Employee"}
                                </p>
                                <p className="text-[11px] text-[#727A90]">
                                  {formattedDate} at {formattedTime}
                                </p>
                              </div>
                            </div>
                            <p className="text-[13px] text-[#24282E] whitespace-pre-wrap break-words">
                              {comment.content}
                            </p>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
                
                {/* <div className={`${styles.mainDiv}`}>
                  <div className="flex items-center justify-between">
                    <PdfSvg className="w-[58px] h-[58px]" />
                    <span className="text-[20px] font-[600] text-[#24282E]">
                      {applicationData.form_name || "Application Form"}.pdf
                    </span>
                    <EditSvg />
                  </div>
                </div> */}
              </div>

              <div className="col-span-7">
                {mergedVisaData && Object.keys(mergedVisaData).length > 0 ? (
                  <div className={`flex flex-col gap-4 ${styles.mainDiv}`}>
                    <h1 className="text-[20px] font-[600] text-[#24282E]">Extracted Visa Data</h1>
                    <div className="flex flex-col gap-3">
                      {Object.entries(mergedVisaData).map(([sectionKey, sectionValue]) => {
                        const isOpen = accordionState[sectionKey] ?? false;
                        return (
                          <div
                            key={sectionKey}
                            className="border border-[#E9EAEA] rounded-[12px] overflow-hidden bg-white"
                          >
                            <button
                              type="button"
                              onClick={() => toggleAccordion(sectionKey)}
                              className="w-full flex items-center justify-between px-5 py-3 hover:bg-[#42DA8210] transition-colors"
                            >
                              <span className="text-[16px] font-[600] text-[#24282E]">
                                {formatSectionTitle(sectionKey)}
                              </span>
                              {isOpen ? (
                                <ChevronUp className="w-5 h-5 text-[#24282E]" />
                              ) : (
                                <ChevronDown className="w-5 h-5 text-[#24282E]" />
                              )}
                            </button>
                            {isOpen && (
                              <div className="px-5 py-4 flex flex-col gap-4">
                                {renderObjectContent(
                                  sectionValue,
                                  sectionKey,
                                  0,
                                  startEditing,
                                  cancelEditing,
                                  updateEditingValue,
                                  saveField,
                                  editingFields,
                                  defaultValues
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className={`flex flex-col gap-4 ${styles.mainDiv}`}>
                    <h1 className="text-[20px] font-[600] text-[#24282E]">Extracted Visa Data</h1>
                    <div className="flex flex-col items-center justify-center py-8 gap-4">
                      <div className="relative">
                        {/* Outer spinning ring */}
                        <div className="w-12 h-12 border-4 border-[#E9EAEA] border-t-[#42DA82] rounded-full animate-spin"></div>
                        {/* Inner pulsing dot */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-3 h-3 bg-[#42DA82] rounded-full animate-pulse"></div>
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-[16px] font-[600] text-[#24282E] mb-1">Processing Visa Data</p>
                        <p className="text-[14px] font-[500] text-[#727A90]">Extracting information from uploaded documents...</p>
                      </div>
                      {/* Progress dots animation */}
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-[#42DA82] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-[#42DA82] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-[#42DA82] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div className={`mt-2 ${styles.mainDiv}`}>
                  <h1 className="text-[20px] font-[600] text-[#24282E] mb-3">
                    Actions
                  </h1>
                  {/* <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center">
                      <PdfSvg />
                      <div className="flex flex-col gap-1">
                        <span className="text-[14px] font-[500] text-[#24282E]">
                          Invoice
                        </span>
                        <span className="text-[12px] font-[400] text-[#722A90]">
                          Invoice name here
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className={styles.infoBtn}>Resend</button>
                      <EyeSvg />
                    </div>
                  </div> */}
                  {/* <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <PdfSvg />
                      <div className="flex flex-col gap-1">
                        <span className="text-[14px] font-[500] text-[#24282E]">
                          {
                            applicationData?.extracted_visa_data?.["visa_type"]?.name || applicationData.form_name || "N/A"
                          }
                        </span>
                        <span className="text-[12px] font-[400] text-[#727A90]">
                          Invoice name here
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className={styles.infoBtn}>Resend</button>
                      <EyeSvg />
                    </div>
                  </div> */}

                  <div className="flex items-center justify-between mt-6">
                    <h3 className="text-[14px] font-[500] text-[#24222E]">
                      Status
                    </h3>
                    <StatusDropdown
                      status={applicationData.visa_status}
                      applicationId={applicationData.id}
                      onStatusChange={(newStatus) => {
                        setApplicationData((prev) =>
                          prev ? { ...prev, visa_status: newStatus } : null
                        );
                      }}
                    />
                  </div>
                  {applicationData.visa_status === "cancel" || applicationData.visa_status === "rejected" ? (
                    <>
                      <hr className="my-3" />
                      <p className="text-[12px] font-[400] text-[#727A90] mb-2">
                        Cancellation Reason :{" "}
                      </p>
                      <p className="text-[12px] font-[400] text-[#24282E]">
                        {getValue(applicationData, "cancellation_reason") || "No reason provided"}
                      </p>
                    </>
                  ) : null}
                  
                  {/* Issues Section - Only show when status is "have_issues" */}
                  {applicationData.visa_status === "have_issues" && (
                    <>
                      <hr className="my-3" />
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-[14px] font-[600] text-[#24282E]">
                            Issues
                          </h3>
                          {!showIssueForm && (
                            <button
                              onClick={() => setShowIssueForm(true)}
                              className="px-3 py-1.5 bg-[#42DA82] text-white rounded-[8px] text-[12px] font-medium hover:bg-[#2fb96a] transition-colors"
                            >
                              Report Issue
                            </button>
                          )}
                        </div>

                        {/* Report Issue Form */}
                        {showIssueForm && (
                          <div className="bg-[#F9FAFB] rounded-[8px] p-4 border border-[#E9EAEA]">
                            <div className="flex flex-col gap-3">
                              <div>
                                <label className="text-[12px] font-[500] text-[#24282E] mb-1.5 block">
                                  Issue Type
                                </label>
                                <select
                                  value={selectedIssueType}
                                  onChange={(e) => setSelectedIssueType(e.target.value)}
                                  className="w-full px-3 py-2 text-[14px] border border-[#E9EAEA] rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#42DA82]/20 bg-white"
                                  disabled={isSubmittingIssue}
                                >
                                  <option value="">Select issue type...</option>
                                  {ISSUE_TYPES.map((type) => (
                                    <option key={type.value} value={type.value}>
                                      {type.label}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div>
                                <label className="text-[12px] font-[500] text-[#24282E] mb-1.5 block">
                                  Additional Notes (Optional)
                                </label>
                                <textarea
                                  value={issueNotes}
                                  onChange={(e) => setIssueNotes(e.target.value)}
                                  placeholder="Add any additional details about this issue..."
                                  className="w-full px-3 py-2 text-[14px] border border-[#E9EAEA] rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#42DA82]/20 resize-none"
                                  rows={3}
                                  disabled={isSubmittingIssue}
                                />
                              </div>

                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  id="send-notification"
                                  checked={sendNotification}
                                  onChange={(e) => setSendNotification(e.target.checked)}
                                  disabled={isSubmittingIssue}
                                  className="w-4 h-4 text-[#42DA82] border-gray-300 rounded focus:ring-[#42DA82]"
                                />
                                <label
                                  htmlFor="send-notification"
                                  className="text-[12px] text-[#24282E] cursor-pointer"
                                >
                                  Send notification to customer
                                </label>
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  onClick={handleReportIssue}
                                  disabled={!selectedIssueType || isSubmittingIssue}
                                  className="px-4 py-2 bg-[#42DA82] text-white rounded-[8px] text-[13px] font-medium hover:bg-[#2fb96a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                  {isSubmittingIssue ? (
                                    <>
                                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                      <span>Reporting...</span>
                                    </>
                                  ) : (
                                    "Report Issue"
                                  )}
                                </button>
                                <button
                                  onClick={() => {
                                    setShowIssueForm(false);
                                    setSelectedIssueType("");
                                    setIssueNotes("");
                                    setSendNotification(true);
                                  }}
                                  disabled={isSubmittingIssue}
                                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-[8px] text-[13px] font-medium hover:bg-gray-300 transition-colors disabled:opacity-50"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Existing Issues List */}
                        {isLoadingIssues ? (
                          <div className="flex items-center justify-center py-4">
                            <div className="w-5 h-5 border-2 border-[#42DA82] border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        ) : issues.length === 0 ? (
                          !showIssueForm && (
                            <p className="text-[12px] text-[#727A90] text-center py-4">
                              No issues reported yet.
                            </p>
                          )
                        ) : (
                          <div className="flex flex-col gap-2">
                            {issues.map((issue: any) => {
                              const issueTypeLabel =
                                ISSUE_TYPES.find((t) => t.value === issue.issue_type)
                                  ?.label || issue.issue_type;
                              const issueDate = new Date(issue.reported_at);
                              const formattedDate = issueDate.toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              });
                              const formattedTime = issueDate.toLocaleTimeString("en-US", {
                                hour: "2-digit",
                                minute: "2-digit",
                              });

                              return (
                                <div
                                  key={issue.issue_type || issue.id}
                                  className="bg-[#F9FAFB] rounded-[8px] p-3 border border-[#E9EAEA]"
                                >
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[13px] font-[600] text-[#F05D3D]">
                                          {issueTypeLabel}
                                        </span>
                                        <span className="text-[10px] text-[#727A90]">
                                          {formattedDate} at {formattedTime}
                                        </span>
                                      </div>
                                      {issue.additional_notes && (
                                        <p className="text-[12px] text-[#24282E] mt-1 whitespace-pre-wrap">
                                          {issue.additional_notes}
                                        </p>
                                      )}
                                    </div>
                                    <button
                                      onClick={() => handleResolveIssue(issue.issue_type)}
                                      className="ml-2 px-2 py-1 text-[11px] bg-[#42DA82] text-white rounded-[6px] hover:bg-[#2fb96a] transition-colors"
                                      title="Resolve issue"
                                    >
                                      Resolve
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                  <div className="mt-4">
                    <h3 className="text-[14px] font-[500] text-[#24282E] mb-1">
                      Internal Notes
                    </h3>
                    {applicationData?.internal_notes ? (
                      <p
                        className={`overflow-y-auto whitespace-pre-wrap ${styles.textArenaStyles}`}
                        style={{ height: "470px" }}
                      >
                        {applicationData.internal_notes}
                      </p>
                    ) : (
                      <p className="text-[14px] font-[500] text-[#727A90]">No internal notes.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {/* <hr className="my-4" />
            <div className="flex justify-between p-6 items-center">
              <div className="flex gap-6">
                <div>
                  <div className="flex items-center">
                    <Check className="w-4 h-4" />
                    <p className="text-[14px] font-[500] text-[#000000]">
                      Payment Status: {formatStatus(applicationData.payment_status)}
                    </p>
                  </div>
                  <p className="text-[12px] font-[500] text-[#727A90]">
                    Created: {new Date(applicationData.created_at).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => setIsRefund(true)}
                  className={styles.refundBtn}
                >
                  <TicketSvg />
                  <span className="text-[12px] font-[600] underline">
                    Refund Amount
                  </span>
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsEdit(true)}
                  className="flex items-center gap-2 bg-[#42DA82] text-white px-6 py-2 rounded-[12px] font-semibold"
                >
                  <PencilSvg />
                  <span>Apply</span>
                </button>
              </div>
            </div> */}
          </>
        )}
      </div>

      {/* Image Modal */}
      {imageModal.isOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black bg-opacity-75 flex items-center justify-center"
          onClick={() => setImageModal({ isOpen: false, imageUrl: '', alt: '' })}
        >
          <div className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center">
            <button
              onClick={() => setImageModal({ isOpen: false, imageUrl: '', alt: '' })}
              className="absolute top-4 right-4 bg-white/90 hover:bg-white border-[#E9EAEA] border-[1px] p-2 rounded-[10px] z-10"
            >
              <CrossSvg size={24} />
            </button>
            <img
              src={imageModal.imageUrl}
              alt={imageModal.alt}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
              onError={(e) => {
                (e.target as HTMLImageElement).src = GenericProfileImage.src;
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationDetail;

// Ensure helper functions are defined or imported
const getValue = (applicationData: ApplicationData | null, field: string): string | number => {
  if (!applicationData || !applicationData.values) return "N/A";
  const fieldData = applicationData.values[field];
  if (!fieldData) return "N/A";
  if (typeof fieldData === "object" && fieldData !== null && "value" in fieldData) {
    const docValue = fieldData.value as any;
    if (typeof docValue === "object" && docValue !== null && "filename" in docValue) {
      return docValue.filename || "N/A";
    }
    if (typeof docValue === "string" || typeof docValue === "number") {
      return docValue || "N/A";
    }
  }
  if (typeof fieldData === "string" || typeof fieldData === "number") {
    return fieldData || "N/A";
  }
  return "N/A";
};

const getDocumentInfo = (
  applicationData: ApplicationData | null,
  ...documentTypes: string[]
): { file_path: string; original_filename: string } | null => {
  if (!applicationData?.documents) return null;
  const docs = applicationData.documents;

  const extractFromEntry = (entry: Document | Document[]): { file_path: string; original_filename: string } | null => {
    const doc = Array.isArray(entry) ? entry.find((d) => d?.file_path) : entry;
    if (!doc?.file_path) return null;
    return { file_path: doc.file_path, original_filename: doc.original_filename || doc.file_path.split("/").pop() || "download" };
  };

  for (const type of documentTypes) {
    const entry = docs[type];
    if (entry) {
      const info = extractFromEntry(entry);
      if (info) return info;
    }
  }

  const allEntries = Object.values(docs).flatMap((e) => (Array.isArray(e) ? e : [e]));
  for (const type of documentTypes) {
    const doc = allEntries.find((d) => d?.document_type?.toUpperCase() === type.toUpperCase());
    if (doc?.file_path) {
      return { file_path: doc.file_path, original_filename: doc.original_filename || doc.file_path.split("/").pop() || "download" };
    }
  }
  return null;
};

const formatSectionTitle = (key: string): string => {
  const match = key.match(/^step_(\d+)_([\w\d_]+)$/i);
  if (match) {
    const [, stepNumber, rest] = match;
    return `Step ${stepNumber} ${rest.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())}`;
  }
  return key.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
};

const formatForDisplay = (value: any): string => {
  if (value === null || value === undefined || value === "") {
    return "N/A";
  }
  if (typeof value === "string") {
    return value.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
  }
  return String(value);
};

// Helper to safely get nested value from an object using dot-separated path
const getNestedValue = (obj: any, path: string): any => {
  if (!obj || !path) return null;
  const parts = path.split(".");
  let current: any = obj;

  for (const part of parts) {
    if (current && typeof current === "object" && part in current) {
      current = current[part];
    } else {
      return null;
    }
  }

  return current;
};

// Helper to parse default options string (with {default} and optional newline-separated options)
const parseDefaultOptions = (
  defaultValueStr: string
): { options: string[]; defaultOption: string | null } => {
  if (typeof defaultValueStr !== "string") {
    return { options: [], defaultOption: null };
  }

  const rawOptions = defaultValueStr
    .split("\n")
    .map((opt) => opt.trim())
    .filter(Boolean);

  let defaultOption: string | null = null;
  const cleanedOptions: string[] = [];

  rawOptions.forEach((opt) => {
    if (opt.startsWith("{") && opt.endsWith("}")) {
      const cleaned = opt.slice(1, -1).trim();
      if (cleaned) {
        cleanedOptions.push(cleaned);
        if (defaultOption === null) {
          defaultOption = cleaned;
        }
      }
    } else {
      cleanedOptions.push(opt);
    }
  });

  const uniqueOptions = Array.from(new Set(cleanedOptions));

  return { options: uniqueOptions, defaultOption };
};

// Local helper to check emptiness / N/A for display & editing logic
const isEmptyOrNAForDisplay = (value: any): boolean => {
  if (value === null || value === undefined) return true;
  const str = String(value).trim();
  if (!str) return true;
  return str.toLowerCase() === "n/a";
};

const renderObjectContent = (
  data: any,
  basePath: string = "",
  level: number = 0,
  startEditing?: (path: string, value: any) => void,
  cancelEditing?: (path: string) => void,
  updateEditingValue?: (path: string, value: any) => void,
  saveField?: (path: string, fieldName: string) => void,
  editingFields?: Record<
    string,
    { value: any; originalValue: any; isSaving: boolean }
  >,
  defaultValues?: any
): JSX.Element => {
  if (Array.isArray(data)) {
    return (
      <div className="flex flex-col gap-3">
        {data.length > 0 ? (
          data.map((item, index) => {
            const itemPath = `${basePath}.${index}`;
            return (
              <div
                key={`array-item-${level}-${index}`}
                className="border border-[#E9EAEA] rounded-[10px] p-4 bg-white"
              >
                {typeof item === "object" && item !== null
                  ? renderObjectContent(item, itemPath, level + 1, startEditing, cancelEditing, updateEditingValue, saveField, editingFields)
                  : <p>{formatForDisplay(item)}</p>}
              </div>
            );
          })
        ) : (
          <p className="text-[14px] font-[500] text-[#727A90]">N/A</p>
        )}
      </div>
    );
  }

  if (typeof data !== "object" || data === null) {
    const fieldPath = basePath;
    const isEditing = editingFields && editingFields[fieldPath];
    const displayValue = isEditing ? editingFields[fieldPath].value : data;

    const defaultFieldValue =
      defaultValues && fieldPath
        ? getNestedValue(defaultValues, fieldPath)
        : null;

    let options: string[] = [];
    let defaultOption: string | null = null;

    if (typeof defaultFieldValue === "string") {
      const parsed = parseDefaultOptions(defaultFieldValue);
      options = parsed.options;
      defaultOption = parsed.defaultOption;
    }

    if (
      isEditing &&
      options.length > 0 &&
      editingFields &&
      editingFields[fieldPath] &&
      editingFields[fieldPath]!.value &&
      !options.includes(editingFields[fieldPath]!.value)
    ) {
      options = [...options, editingFields[fieldPath]!.value];
    }

    const selectValue =
      (isEditing && editingFields && editingFields[fieldPath]?.value) ||
      defaultOption ||
      (options.length > 0 ? options[0] : "");

    return (
      <div className="flex items-center gap-2 group">
        {isEditing ? (
          <>
            {options.length > 0 ? (
              <select
                value={selectValue}
                onChange={(e) =>
                  updateEditingValue?.(fieldPath, e.target.value)
                }
                className="flex-1 px-3 py-2 border border-[#42DA82] rounded-[8px] bg-white focus:outline-none focus:ring-2 focus:ring-[#42DA82]/20 text-[14px]"
                disabled={isEditing.isSaving}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    saveField?.(fieldPath, fieldPath.split(".").pop() || "");
                  } else if (e.key === "Escape") {
                    cancelEditing?.(fieldPath);
                  }
                }}
              >
                {options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={displayValue}
                onChange={(e) =>
                  updateEditingValue?.(fieldPath, e.target.value)
                }
                className="flex-1 px-3 py-2 border border-[#42DA82] rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#42DA82]/20 text-[14px]"
                disabled={isEditing.isSaving}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    saveField?.(fieldPath, fieldPath.split(".").pop() || "");
                  } else if (e.key === "Escape") {
                    cancelEditing?.(fieldPath);
                  }
                }}
              />
            )}
            <div className="flex items-center gap-1">
              {isEditing.isSaving ? (
                <div className="w-5 h-5 border-2 border-[#42DA82] border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <button
                    onClick={() =>
                      saveField?.(
                        fieldPath,
                        fieldPath.split(".").pop() || ""
                      )
                    }
                    className="p-1.5 hover:bg-[#42DA82]/10 rounded transition-colors"
                    title="Save"
                  >
                    <Check size={16} className="text-[#42DA82]" />
                  </button>
                  <button
                    onClick={() => cancelEditing?.(fieldPath)}
                    className="p-1.5 hover:bg-red-100 rounded transition-colors"
                    title="Cancel"
                    disabled={isEditing.isSaving}
                  >
                    <CrossSvg size={16} className="text-red-500" />
                  </button>
                </>
              )}
            </div>
          </>
        ) : (
          <>
            <p className="text-[14px] font-[500] text-[#24282E]">
              {formatForDisplay(data)}
            </p>
            <button
              onClick={() => {
                const currentValue = data;
                let initialValue = currentValue;

                if (isEmptyOrNAForDisplay(currentValue)) {
                  if (
                    typeof defaultFieldValue === "string" &&
                    defaultFieldValue.includes("\n")
                  ) {
                    const { defaultOption } =
                      parseDefaultOptions(defaultFieldValue);
                    initialValue = defaultOption || "";
                  } else {
                    initialValue = "";
                  }
                }

                startEditing?.(fieldPath, initialValue);
              }}
              className="p-1 hover:bg-[#42DA82]/10 rounded transition-all ml-1"
              title="Edit"
            >
              <svg className="w-4 h-4 text-[#727A90]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {Object.entries(data).map(([key, value]) => {
        const fieldPath = basePath ? `${basePath}.${key}` : key;
        const isEditing = editingFields && editingFields[fieldPath];
        const isValueObject = typeof value === "object" && value !== null && !Array.isArray(value);

        return (
          <div key={key} className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <p className="font-bold text-[14px] text-[#24282E]">{formatForDisplay(key)}</p>
            </div>
            {renderObjectContent(
              value,
              fieldPath,
              level + 1,
              startEditing,
              cancelEditing,
              updateEditingValue,
              saveField,
              editingFields,
              defaultValues
            )}
          </div>
        );
      })}
    </div>
  );
};

const formatStatus = (status: string): string => {
  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};
