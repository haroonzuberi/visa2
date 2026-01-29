"use client";
import CrossSvg from "@/Assets/svgs/CrossSvg";
import styles from "./styles.module.css";
import { useEffect, useState, useRef, JSX } from "react";
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
import { getApiWithAuth } from "@/utils/api";
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
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);

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
      return (
        <div className={`flex flex-col gap-4 ${styles.mainDiv}`}>
          <h1 className="text-[20px] font-[600] text-[#24482E]">Extracted Visa Data</h1>
          <div className="flex flex-col gap-3">
            {Object.entries(applicationData.extracted_visa_data).map(([sectionKey, sectionValue]) => {
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
                      {renderObjectContent(sectionValue)}
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
                    className="w-[120px] h-[120px] rounded-full object-cover"
                    crossOrigin="anonymous"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = GenericProfileImage.src;
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
                  <img
                    src={displayPassportPhotoUrl}
                    alt="Passport"
                    className="w-[120px] h-[120px] rounded-full object-cover"
                    crossOrigin="anonymous"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = GenericProfileImage.src;
                    }}
                  />
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
                {hasOtherDocuments && (
                  <div
                    className={`flex flex-col items-center mb-2 ${styles.mainDiv}`}
                  >
                    <img
                      src={displayOtherDocumentsUrl}
                      alt="Other Documents"
                      className="w-[120px] h-[120px] rounded-lg object-cover"
                      crossOrigin="anonymous"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = GenericProfileImage.src;
                      }}
                    />
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
                  </div>
                )}
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
                    <span className={`w-[112px] ${styles.tableChip}`}>
                      {String(visaType) !== "N/A" ? String(visaType) : applicationData.form_name || "N/A"}
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
                {applicationData?.extracted_visa_data && Object.keys(applicationData.extracted_visa_data).length > 0 ? (
                  <div className={`flex flex-col gap-4 ${styles.mainDiv}`}>
                    <h1 className="text-[20px] font-[600] text-[#24282E]">Extracted Visa Data</h1>
                    <div className="flex flex-col gap-3">
                      {Object.entries(applicationData.extracted_visa_data).map(([sectionKey, sectionValue]) => {
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
                                {renderObjectContent(sectionValue)}
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

const renderObjectContent = (data: any, level = 0): JSX.Element => {
  if (Array.isArray(data)) {
    return (
      <div className="flex flex-col gap-3">
        {data.length > 0 ? (
          data.map((item, index) => (
            <div
              key={`array-item-${level}-${index}`}
              className="border border-[#E9EAEA] rounded-[10px] p-4 bg-white"
            >
              {typeof item === "object" ? renderObjectContent(item, level + 1) : <p>{formatForDisplay(item)}</p>}
            </div>
          ))
        ) : (
          <p className="text-[14px] font-[500] text-[#727A90]">N/A</p>
        )}
      </div>
    );
  }

  if (typeof data !== "object" || data === null) {
    return <p>{formatForDisplay(data)}</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {Object.entries(data).map(([key, value]) => (
        <div key={key} className="flex flex-col">
          <p className="font-bold">{formatForDisplay(key)}</p>
          {renderObjectContent(value, level + 1)}
        </div>
      ))}
    </div>
  );
};

const formatStatus = (status: string): string => {
  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};
