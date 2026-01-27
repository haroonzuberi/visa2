"use client";
import CrossSvg from "@/Assets/svgs/CrossSvg";
import styles from "./styles.module.css";
import { useEffect, useState, useRef } from "react";
import PdfSvg from "@/Assets/svgs/PdfSvg";
import EyeSvg from "@/Assets/svgs/EyeSvg";
import DropDownSvg from "@/Assets/svgs/DropDown";
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
import { getApiWithAuth, putAPIWithAuth } from "@/utils/api";
import { toast } from "react-toastify";
import jsPDF from "jspdf";

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
  documents?: {
    national_id_card_photo?: Document;
    passport_photo?: Document;
    user_photo?: Document;
    other_documents?: Document;
  };
  customer?: Customer;
  applicant?: Applicant;
}

interface ModalProps {
  setIsApplicationDetail: (value: boolean) => void;
  onClose: () => void;
  data: { id: number } | ApplicationData; // Can receive either just id or full data
}

const ApplicationDetail: React.FC<ModalProps> = ({
  //   setIsApplicationDetail,
  onClose,
  data,
}) => {
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [isRefund, setIsRefund] = useState<boolean>(false);
  const [isPersonalEdit, setIsPersonalEdit] = useState<boolean>(false);
  const [isNewApplication, setIsNewApplication] = useState<boolean>(false);
  const [showMoreDetails, setShowMoreDetails] = useState<boolean>(false);
  const [applicationData, setApplicationData] = useState<ApplicationData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const profileImageRef = useRef<HTMLImageElement>(null);
  const passportImageRef = useRef<HTMLImageElement>(null);

  // Fetch application details from API
  useEffect(() => {
    const fetchApplicationDetails = async () => {
      // If data already has full application data, use it
      if (data && 'application_id' in data) {
        setApplicationData(data as ApplicationData);
        return;
      }

      // Otherwise, fetch from API using the id
      if (data && 'id' in data) {
        setIsLoading(true);
        try {
          const response: any = await getApiWithAuth(`form-submissions/${data.id}`);
          if (response.success && response.data) {
            setApplicationData(response.data);
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
  }, [data, onClose]);

  // Helper function to get value from values object (for legacy support)
  const getValue = (field: string): string | number => {
    if (!applicationData || !applicationData.values) return "N/A";
    const fieldData = applicationData.values[field];
    if (!fieldData) return "N/A";
    if (typeof fieldData === "object" && fieldData !== null && 'value' in fieldData) {
      const docValue = fieldData.value as any;
      if (typeof docValue === "object" && docValue !== null && 'filename' in docValue) {
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

  // Helper function to get image URL from documents object
  const getImageUrl = (documentType: string): string | null => {
    if (!applicationData || !applicationData.documents) {
      return null;
    }
    const doc = applicationData.documents[documentType as keyof typeof applicationData.documents];
    if (doc && doc.file_path) {
      return doc.file_path;
    }
    return null;
  };

  // Helper function to format status
  const formatStatus = (status: string): string => {
    return status
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  // Get dynamic field values from customer/applicant or values
  const name = applicationData?.applicant?.name || applicationData?.customer?.name || getValue("full_name") || getValue("name") || "N/A";
  const email = applicationData?.applicant?.email || applicationData?.customer?.email || getValue("email") || "N/A";
  const phone = applicationData?.applicant?.phone || applicationData?.customer?.phone || getValue("phone") || getValue("phone_number") || "N/A";
  const passportNumber = applicationData?.applicant?.passport_number || getValue("passport_number") || "N/A";
  const visaType = getValue("visa_type") || getValue("purpose_of_visit") || "N/A";
  const country = getValue("nationality") || getValue("birth_country") || "India";
  const arrivalDate = getValue("arrival_date") || getValue("flight_date") || "N/A";
  const departureDate = getValue("departure_date") || "N/A";
  const purposeOfVisit = getValue("purpose_of_visit") || "N/A";
  const accommodationDetails = getValue("accommodation_details") || "N/A";
  const travelHistory = getValue("travel_history") || "N/A";
  const birthDate = getValue("birth_date") || getValue("date_of_birth") || "N/A";
  const gender = getValue("gender") || "N/A";
  
  // Get images from documents object
  const photoUrl = getImageUrl("user_photo") || getImageUrl("passport_photo");
  const passportPhotoUrl = getImageUrl("passport_photo") || getImageUrl("national_id_card_photo") || photoUrl;
  const nationalIdCardPhotoUrl = getImageUrl("national_id_card_photo");
  const otherDocumentsUrl = getImageUrl("other_documents");
  
  // Use local asset as fallback
  const displayPhotoUrl = photoUrl || GenericProfileImage.src;
  const displayPassportPhotoUrl = passportPhotoUrl || GenericProfileImage.src;
  const displayNationalIdCardPhotoUrl = nationalIdCardPhotoUrl || GenericProfileImage.src;
  const displayOtherDocumentsUrl = otherDocumentsUrl || GenericProfileImage.src;

  // Check if images are present (not fallback)
  const hasProfilePhoto = photoUrl !== null;
  const hasPassportPhoto = passportPhotoUrl !== null;
  const hasNationalIdCardPhoto = nationalIdCardPhotoUrl !== null;
  const hasOtherDocuments = otherDocumentsUrl !== null;

  // Download image function using canvas (avoids CORS issues)
  const downloadImage = (imageUrl: string, filename: string, imageElement?: HTMLImageElement) => {
    try {
      const img = imageElement || new Image();
      
      // If image element is provided, use it directly
      if (imageElement) {
        downloadImageFromElement(imageElement, filename);
        return;
      }
      
      // Otherwise, load the image
      img.crossOrigin = 'anonymous'; // Try to handle CORS
      img.onload = () => {
        downloadImageFromElement(img, filename);
      };
      img.onerror = () => {
        toast.error("Failed to load image for download");
      };
      img.src = imageUrl;
    } catch (error: any) {
      console.error("Error downloading image:", error);
      toast.error("Failed to download image");
    }
  };

  // Helper function to download image from an image element using canvas
  const downloadImageFromElement = (img: HTMLImageElement, filename: string) => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        toast.error("Failed to create canvas context");
        return;
      }
      
      ctx.drawImage(img, 0, 0);
      
      canvas.toBlob((blob) => {
        if (!blob) {
          toast.error("Failed to convert image to blob");
          return;
        }
        
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        toast.success("Image downloaded successfully");
      }, 'image/png');
    } catch (error: any) {
      console.error("Error downloading image:", error);
      toast.error("Failed to download image");
    }
  };

  // Download image as PDF function using canvas (avoids CORS issues)
  const downloadImageAsPDF = (imageUrl: string, filename: string, imageElement?: HTMLImageElement) => {
    try {
      const img = imageElement || new Image();
      
      // If image element is provided, use it directly
      if (imageElement) {
        createPDFFromElement(imageElement, filename);
        return;
      }
      
      // Otherwise, load the image
      img.crossOrigin = 'anonymous'; // Try to handle CORS
      img.onload = () => {
        createPDFFromElement(img, filename);
      };
      img.onerror = () => {
        toast.error("Failed to load image for PDF");
      };
      img.src = imageUrl;
    } catch (error: any) {
      console.error("Error creating PDF:", error);
      toast.error("Failed to create PDF");
    }
  };

  // Helper function to create PDF from an image element using canvas
  const createPDFFromElement = (img: HTMLImageElement, filename: string) => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        toast.error("Failed to create canvas context");
        return;
      }
      
      ctx.drawImage(img, 0, 0);
      
      const imageDataUrl = canvas.toDataURL('image/png');
      
      // Create PDF
      const pdf = new jsPDF();
      const pdfImg = new Image();
      pdfImg.src = imageDataUrl;
      
      pdfImg.onload = () => {
        const imgWidth = pdf.internal.pageSize.getWidth();
        const imgHeight = (pdfImg.height * imgWidth) / pdfImg.width;
        
        // If image is taller than page, scale it down
        const pageHeight = pdf.internal.pageSize.getHeight();
        const scaledHeight = imgHeight > pageHeight ? pageHeight - 20 : imgHeight;
        const scaledWidth = (pdfImg.width * scaledHeight) / pdfImg.height;
        
        const x = (imgWidth - scaledWidth) / 2;
        const y = 10;
        
        pdf.addImage(imageDataUrl, "PNG", x, y, scaledWidth, scaledHeight);
        pdf.save(filename.replace(/\.[^/.]+$/, "") + ".pdf");
        toast.success("PDF downloaded successfully");
      };
      
      pdfImg.onerror = () => {
        toast.error("Failed to load image for PDF");
      };
    } catch (error: any) {
      console.error("Error creating PDF:", error);
      toast.error("Failed to create PDF");
    }
  };

  // Handle profile photo download
  const handleDownloadProfilePhoto = () => {
    if (photoUrl && hasProfilePhoto && profileImageRef.current) {
      const filename = `profile_photo_${applicationData?.application_id || "photo"}.png`;
      downloadImage(photoUrl, filename, profileImageRef.current);
    }
  };

  // Handle profile photo PDF download
  const handleDownloadProfilePhotoPDF = () => {
    if (photoUrl && hasProfilePhoto && profileImageRef.current) {
      const filename = `profile_photo_${applicationData?.application_id || "photo"}.png`;
      downloadImageAsPDF(photoUrl, filename, profileImageRef.current);
    }
  };

  // Handle passport photo download
  const handleDownloadPassportPhoto = () => {
    if (passportPhotoUrl && hasPassportPhoto && passportImageRef.current) {
      const filename = `passport_photo_${applicationData?.application_id || "passport"}.png`;
      downloadImage(passportPhotoUrl, filename, passportImageRef.current);
    }
  };

  // Handle passport photo PDF download
  const handleDownloadPassportPhotoPDF = () => {
    if (passportPhotoUrl && hasPassportPhoto && passportImageRef.current) {
      const filename = `passport_photo_${applicationData?.application_id || "passport"}.png`;
      downloadImageAsPDF(passportPhotoUrl, filename, passportImageRef.current);
    }
  };

  // Handle National ID Card Photo download
  const handleDownloadNationalIdCardPhoto = () => {
    if (nationalIdCardPhotoUrl && hasNationalIdCardPhoto) {
      const filename = `national_id_card_${applicationData?.application_id || "nic"}.png`;
      downloadImage(nationalIdCardPhotoUrl, filename);
    }
  };

  // Handle National ID Card Photo PDF download
  const handleDownloadNationalIdCardPhotoPDF = () => {
    if (nationalIdCardPhotoUrl && hasNationalIdCardPhoto) {
      const filename = `national_id_card_${applicationData?.application_id || "nic"}.png`;
      downloadImageAsPDF(nationalIdCardPhotoUrl, filename);
    }
  };

  // Handle Other Documents download
  const handleDownloadOtherDocuments = () => {
    if (otherDocumentsUrl && hasOtherDocuments) {
      const filename = `other_documents_${applicationData?.application_id || "documents"}.png`;
      downloadImage(otherDocumentsUrl, filename);
    }
  };

  // Handle Other Documents PDF download
  const handleDownloadOtherDocumentsPDF = () => {
    if (otherDocumentsUrl && hasOtherDocuments) {
      const filename = `other_documents_${applicationData?.application_id || "documents"}.png`;
      downloadImageAsPDF(otherDocumentsUrl, filename);
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
        {isEdit ? (
          <EditInfo setIsEdit={setIsEdit} onClose={onClose} />
        ) : isRefund ? (
          <RefundAmount setIsRefund={setIsRefund} onClose={onClose} />
        ) : isNewApplication ? (
          <NewApplication
            setIsNewApplication={setIsNewApplication}
            onClose={onClose}
          />
        ) : isPersonalEdit ? (
          <EditPersonalInfo
            setIsPersonalEdit={setIsPersonalEdit}
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
                    ref={profileImageRef}
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
                  {hasProfilePhoto && (
                    <div className="flex gap-2 mt-3 justify-center">
                      <button
                        onClick={handleDownloadProfilePhoto}
                        className="bg-[#42DA82] text-white px-3 py-1.5 rounded-[12px] font-semibold text-[12px] whitespace-nowrap"
                        title="Download Profile Photo"
                      >
                        Download Image
                      </button>
                      <button
                        onClick={handleDownloadProfilePhotoPDF}
                        className="bg-[#42DA82] text-white px-3 py-1.5 rounded-[12px] font-semibold text-[12px] whitespace-nowrap"
                        title="Download Profile Photo as PDF"
                      >
                        Download PDF
                      </button>
                    </div>
                  )}
                </div>
                <div
                  className={`flex flex-col items-center mb-2 ${styles.mainDiv}`}
                >
                  <img
                    ref={passportImageRef}
                    src={displayPassportPhotoUrl}
                    alt="Passport"
                    className="w-[120px] h-[120px] rounded-full object-cover"
                    crossOrigin="anonymous"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = GenericProfileImage.src;
                    }}
                  />
                  <p className="mt-2 text-sm text-gray-500">Passport Picture</p>
                  {hasPassportPhoto && (
                    <div className="flex gap-2 mt-3 justify-center">
                      <button
                        onClick={handleDownloadPassportPhoto}
                        className="bg-[#42DA82] text-white px-3 py-1.5 rounded-[12px] font-semibold text-[12px] whitespace-nowrap"
                        title="Download Passport Photo"
                      >
                        Download Image
                      </button>
                      <button
                        onClick={handleDownloadPassportPhotoPDF}
                        className="bg-[#42DA82] text-white px-3 py-1.5 rounded-[12px] font-semibold text-[12px] whitespace-nowrap"
                        title="Download Passport Photo as PDF"
                      >
                        Download PDF
                      </button>
                    </div>
                  )}
                </div>
                {hasNationalIdCardPhoto && (
                  <div
                    className={`flex flex-col items-center mb-2 ${styles.mainDiv}`}
                  >
                    <p className="text-sm text-gray-500 mb-3">National ID Card</p>
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={handleDownloadNationalIdCardPhoto}
                        className="bg-[#42DA82] text-white px-3 py-1.5 rounded-[12px] font-semibold text-[12px] whitespace-nowrap"
                        title="Download National ID Card Photo"
                      >
                        Download Image
                      </button>
                      <button
                        onClick={handleDownloadNationalIdCardPhotoPDF}
                        className="bg-[#42DA82] text-white px-3 py-1.5 rounded-[12px] font-semibold text-[12px] whitespace-nowrap"
                        title="Download National ID Card Photo as PDF"
                      >
                        Download PDF
                      </button>
                    </div>
                  </div>
                )}
                {hasOtherDocuments && (
                  <div
                    className={`flex flex-col items-center mb-2 ${styles.mainDiv}`}
                  >
                    <p className="text-sm text-gray-500 mb-3">Other Documents</p>
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={handleDownloadOtherDocuments}
                        className="bg-[#42DA82] text-white px-3 py-1.5 rounded-[12px] font-semibold text-[12px] whitespace-nowrap"
                        title="Download Other Documents"
                      >
                        Download Image
                      </button>
                      <button
                        onClick={handleDownloadOtherDocumentsPDF}
                        className="bg-[#42DA82] text-white px-3 py-1.5 rounded-[12px] font-semibold text-[12px] whitespace-nowrap"
                        title="Download Other Documents as PDF"
                      >
                        Download PDF
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
                      <button onClick={() => setIsPersonalEdit(true)}>
                        <EditSvg />
                      </button>
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
                    <CopySvg />
                  </div>
                </div>
                <div className={`${styles.mainDiv}`}>
                  <div className="flex items-center justify-between">
                    <PdfSvg className="w-[58px] h-[58px]" />
                    <span className="text-[20px] font-[600] text-[#24282E]">
                      {applicationData.form_name || "Application Form"}.pdf
                    </span>
                    <EditSvg />
                  </div>
                </div>
              </div>

              <div className="col-span-7">
                <div className={`flex flex-col gap-4 ${styles.mainDiv}`}>
                  <h1 className="text-[20px] font-[600] text-[#24282E]">
                    Application Info
                  </h1>
                  <div className="grid grid-cols-12">
                    <div className="col-span-6">
                      <p className="text-[14px] font-[500] text-[#727A90]">
                        Email
                      </p>
                      <p className="text-[14px] font-[500] text-[#24282E]">
                        {String(email)}
                      </p>
                    </div>
                    <div className="col-span-6">
                      <p className="text-[14px] font-[500] text-[#727A90]">
                        Phone Number
                      </p>
                      <p className="text-[14px] font-[500] text-[#24282E]">
                        {String(phone)}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-12">
                    <div className="col-span-6">
                      <p className="text-[14px] font-[500] text-[#727A90]">
                        Visa Type
                      </p>
                      <p className="text-[14px] font-[500] text-[#24282E]">
                        {String(visaType)}
                      </p>
                    </div>
                    <div className="col-span-6">
                      <p className="text-[14px] font-[500] text-[#727A90]">
                        Country
                      </p>
                      <p className="text-[14px] font-[500] text-[#24282E]">
                        {String(country)}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-12">
                    <div className="col-span-6">
                      <p className="text-[14px] font-[500] text-[#727A90]">
                        Passport Number
                      </p>
                      <p className="text-[14px] font-[500] text-[#24282E]">
                        {String(passportNumber)}
                      </p>
                    </div>
                    <div className="col-span-6">
                      <p className="text-[14px] font-[500] text-[#727A90]">
                        Arrival Date
                      </p>
                      <p className="text-[14px] font-[500] text-[#24282E]">
                        {String(arrivalDate)}
                      </p>
                    </div>
                  </div>
                  
                  {/* Collapsible More Details Section */}
                  <div className="mt-4">
                    <button
                      onClick={() => setShowMoreDetails(!showMoreDetails)}
                      className="flex items-center gap-2 text-[#42DA82] hover:text-[#42DA82]/80 transition-colors"
                    >
                      <span className="text-[14px] font-[500]">
                        {showMoreDetails ? "Hide" : "View"} More Details
                      </span>
                      {showMoreDetails ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                    
                    {showMoreDetails && (
                      <div className="mt-4 grid grid-cols-12 gap-4 pt-4 border-t border-gray-200">
                        {departureDate !== "N/A" && (
                          <div className="col-span-6">
                            <p className="text-[14px] font-[500] text-[#727A90]">
                              Departure Date
                            </p>
                            <p className="text-[14px] font-[500] text-[#24282E]">
                              {String(departureDate)}
                            </p>
                          </div>
                        )}
                        {purposeOfVisit !== "N/A" && (
                          <div className="col-span-6">
                            <p className="text-[14px] font-[500] text-[#727A90]">
                              Purpose of Visit
                            </p>
                            <p className="text-[14px] font-[500] text-[#24282E]">
                              {String(purposeOfVisit)}
                            </p>
                          </div>
                        )}
                        {birthDate !== "N/A" && (
                          <div className="col-span-6">
                            <p className="text-[14px] font-[500] text-[#727A90]">
                              Date of Birth
                            </p>
                            <p className="text-[14px] font-[500] text-[#24282E]">
                              {String(birthDate)}
                            </p>
                          </div>
                        )}
                        {gender !== "N/A" && (
                          <div className="col-span-6">
                            <p className="text-[14px] font-[500] text-[#727A90]">
                              Gender
                            </p>
                            <p className="text-[14px] font-[500] text-[#24282E]">
                              {String(gender).charAt(0).toUpperCase() + String(gender).slice(1)}
                            </p>
                          </div>
                        )}
                        {accommodationDetails !== "N/A" && (
                          <div className="col-span-12">
                            <p className="text-[14px] font-[500] text-[#727A90]">
                              Accommodation Details
                            </p>
                            <p className="text-[14px] font-[500] text-[#24282E]">
                              {String(accommodationDetails)}
                            </p>
                          </div>
                        )}
                        {travelHistory !== "N/A" && (
                          <div className="col-span-12">
                            <p className="text-[14px] font-[500] text-[#727A90]">
                              Travel History
                            </p>
                            <p className="text-[14px] font-[500] text-[#24282E]">
                              {String(travelHistory)}
                            </p>
                          </div>
                        )}
                        {/* Additional fields from values */}
                        {applicationData.values && Object.keys(applicationData.values).length > 0 && Object.keys(applicationData.values).map((key) => {
                          const fieldData = applicationData.values[key];
                          // Skip already displayed fields and document fields
                          const skipFields = [
                            "full_name", "name", "email", "phone", "phone_number",
                            "passport_number", "visa_type", "purpose_of_visit",
                            "nationality", "birth_country", "arrival_date", "flight_date",
                            "departure_date", "accommodation_details", "travel_history",
                            "birth_date", "date_of_birth", "gender", "photo", "passport_photo",
                            "passport_scan", "passport_copy"
                          ];
                          
                          if (skipFields.includes(key)) {
                            return null;
                          }
                          
                          // Handle different value structures
                          let value: any = null;
                          if (fieldData && typeof fieldData === "object" && 'value' in fieldData) {
                            value = fieldData.value;
                            if (typeof value === "object") {
                              return null; // Skip document objects
                            }
                          } else if (fieldData && (typeof fieldData === "string" || typeof fieldData === "number")) {
                            value = fieldData;
                          }
                          
                          if (!value || value === "N/A" || value === "") {
                            return null;
                          }
                          
                          const label = (fieldData && typeof fieldData === "object" && 'label' in fieldData) 
                            ? fieldData.label 
                            : key.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
                          
                          return (
                            <div key={key} className="col-span-6">
                              <p className="text-[14px] font-[500] text-[#727A90]">
                                {label}
                              </p>
                              <p className="text-[14px] font-[500] text-[#24282E]">
                                {String(value)}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
                <div className={`mt-2 ${styles.mainDiv}`}>
                  <h1 className="text-[20px] font-[600] text-[#24282E] mb-3">
                    Actions
                  </h1>
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center">
                      <PdfSvg />
                      <div className="flex flex-col gap-1">
                        <span className="text-[14px] font-[500] text-[#24282E]">
                          Invoice
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
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <PdfSvg />
                      <div className="flex flex-col gap-1">
                        <span className="text-[14px] font-[500] text-[#24282E]">
                          Invoice
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
                  </div>

                  <div className="flex items-center justify-between mt-6">
                    <h3 className="text-[14px] font-[500] text-[#24282E]">
                      Status
                    </h3>
                    <span className={styles.tableChip}>
                      {formatStatus(applicationData.visa_status)}
                      <DropDownSvg color="#F05D3D" />
                    </span>
                  </div>
                  {applicationData.visa_status === "cancel" || applicationData.visa_status === "rejected" ? (
                    <>
                      <hr className="my-3" />
                      <p className="text-[12px] font-[400] text-[#727A90] mb-2">
                        Cancellation Reason :{" "}
                      </p>
                      <p className="text-[12px] font-[400] text-[#24282E]">
                        {getValue("cancellation_reason") || "No reason provided"}
                      </p>
                    </>
                  ) : null}
                  <div className="mt-4">
                    <h3 className="text-[14px] font-[500] text-[#24282E] mb-1">
                      Internal Notes
                    </h3>
                    <textarea
                      className={styles.textArenaStyles}
                      placeholder="Write Description Here"
                      defaultValue={getValue("internal_notes") || ""}
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>
            <hr className="my-4" />
            <div className="flex justify-between p-6 pt-0 items-center pt-4">
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
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ApplicationDetail;
