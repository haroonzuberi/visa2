"use client";
import CrossSvg from "@/Assets/svgs/CrossSvg";
import styles from "./styles.module.css";
import { useEffect, useState } from "react";
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

interface FormValue {
  label: string;
  value: string | number | {
    document_id: number;
    filename: string;
    path: string;
    content_type: string;
    size: number;
  };
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
  values: Record<string, FormValue>;
}

interface ModalProps {
  setIsApplicationDetail: (value: boolean) => void;
  onClose: () => void;
  data: ApplicationData;
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

  // Helper function to get value from values object
  const getValue = (field: string): string | number => {
    const fieldData = data.values[field];
    if (!fieldData) return "N/A";
    if (typeof fieldData.value === "object" && fieldData.value !== null) {
      const docValue = fieldData.value as { filename?: string };
      return docValue.filename || "N/A";
    }
    if (typeof fieldData.value === "string" || typeof fieldData.value === "number") {
      return fieldData.value || "N/A";
    }
    return "N/A";
  };

  // Helper function to get image URL from document path
  const getImageUrl = (field: string): string | null => {
    const fieldData = data.values[field];
    if (!fieldData || typeof fieldData.value !== "object" || !fieldData.value) {
      return null;
    }
    const doc = fieldData.value as { path: string };
    // Construct full URL from document path
    if (doc.path && doc.path.startsWith("http")) {
      return doc.path;
    }
    if (doc.path) {
      return `https://api.visa2.pro/${doc.path}`;
    }
    return null;
  };

  // Helper function to format status
  const formatStatus = (status: string): string => {
    return status
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  // Get dynamic field values
  const name = getValue("full_name") || getValue("name") || "N/A";
  const email = getValue("email") || "N/A";
  const phone = getValue("phone") || getValue("phone_number") || "N/A";
  const passportNumber = getValue("passport_number") || "N/A";
  const visaType = getValue("visa_type") || getValue("purpose_of_visit") || "N/A";
  const country = getValue("nationality") || getValue("birth_country") || "India";
  const arrivalDate = getValue("arrival_date") || getValue("flight_date") || "N/A";
  const departureDate = getValue("departure_date") || "N/A";
  const purposeOfVisit = getValue("purpose_of_visit") || "N/A";
  const accommodationDetails = getValue("accommodation_details") || "N/A";
  const travelHistory = getValue("travel_history") || "N/A";
  const birthDate = getValue("birth_date") || getValue("date_of_birth") || "N/A";
  const gender = getValue("gender") || "N/A";
  const photoUrl = getImageUrl("photo") || getImageUrl("passport_photo");
  const passportPhotoUrl = getImageUrl("passport_scan") || getImageUrl("passport_copy") || photoUrl;
  
  // Use local asset as fallback
  const displayPhotoUrl = photoUrl || GenericProfileImage.src;
  const displayPassportPhotoUrl = passportPhotoUrl || GenericProfileImage.src;

  useEffect(() => {
    console.log("DATA", data);
  }, [data]);
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
                    src={displayPhotoUrl}
                    alt="Profile"
                    className="w-[120px] h-[120px] rounded-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = GenericProfileImage.src;
                    }}
                  />
                  <p className="mt-2 font-medium">{String(name)}</p>
                  <span className="text-gray-500 text-sm">Photo</span>
                </div>
                <div
                  className={`flex flex-col items-center mb-2 ${styles.mainDiv}`}
                >
                  <img
                    src={displayPassportPhotoUrl}
                    alt="Passport"
                    className="w-[120px] h-[120px] rounded-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = GenericProfileImage.src;
                    }}
                  />
                  <p className="mt-2 text-sm text-gray-500">Passport Picture</p>
                </div>
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
                      {data.application_id}
                    </p>
                  </div>
                  <div className="w-full flex flex-col gap-1 my-4">
                    <p className="text-[14px] font-[500] text-[#727A90]">
                      Visa Type
                    </p>
                    <span className={`w-[112px] ${styles.tableChip}`}>
                      {String(visaType)}
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
                      {data.form_name || "Application Form"}.pdf
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
                        {Object.keys(data.values).map((key) => {
                          const fieldData = data.values[key];
                          // Skip already displayed fields and document fields
                          const skipFields = [
                            "full_name", "name", "email", "phone", "phone_number",
                            "passport_number", "visa_type", "purpose_of_visit",
                            "nationality", "birth_country", "arrival_date", "flight_date",
                            "departure_date", "accommodation_details", "travel_history",
                            "birth_date", "date_of_birth", "gender", "photo", "passport_photo",
                            "passport_scan", "passport_copy"
                          ];
                          
                          if (skipFields.includes(key) || typeof fieldData.value === "object") {
                            return null;
                          }
                          
                          const value = fieldData.value;
                          if (!value || value === "N/A" || value === "") {
                            return null;
                          }
                          
                          return (
                            <div key={key} className="col-span-6">
                              <p className="text-[14px] font-[500] text-[#727A90]">
                                {fieldData.label || key.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())}
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
                      {formatStatus(data.visa_status)}
                      <DropDownSvg color="#F05D3D" />
                    </span>
                  </div>
                  {data.visa_status === "cancel" || data.visa_status === "rejected" ? (
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
                      Payment Status: {formatStatus(data.payment_status)}
                    </p>
                  </div>
                  <p className="text-[12px] font-[500] text-[#727A90]">
                    Created: {new Date(data.created_at).toLocaleDateString()}
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
