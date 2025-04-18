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
import ViewInfo from "../ViewAllInfoModal/page";
import NewApplication from "../NewApplicationModal/page";

interface ModalProps {
  setIsApplicationDetail: (value: boolean) => void;
  onClose: () => void;
  data: {
    name: string;
    photoUrl: string;
    email: string;
    phone: string;
    visaType: string;
    country: string;
    flightDate: string;
    passportPhotoUrl: string;
    applicationId: string;
    passportNumber: string;
    status: string;
    cancellationReason: string;
    internalNotes: string;
    paidAmount: string;
    paymentDate: string;
    invoiceFiles: { name: string; url: string }[];
  };
}

const ApplicationDetail: React.FC<ModalProps> = ({
  //   setIsApplicationDetail,
  onClose,
  data,
}) => {
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [isRefund, setIsRefund] = useState<boolean>(false);
  const [isViewInfo, setIsViewInfo] = useState<boolean>(false);
  const [isPersonalEdit, setIsPersonalEdit] = useState<boolean>(false);
  const [isNewApplication, setIsNewApplication] = useState<boolean>(false);

  useEffect(() => {
    console.log("DATA", data);
  }, []);
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[90]">
      <div
        className={`bg-white w-[880px] rounded-lg shadow-lg relative ${styles.modalMain}`}
      >
        {isEdit ? (
          <EditInfo setIsEdit={setIsEdit} onClose={onClose} />
        ) : isRefund ? (
          <RefundAmount setIsRefund={setIsRefund} onClose={onClose} />
        ) : isViewInfo ? (
          <ViewInfo setIsViewInfo={setIsViewInfo} onClose={onClose} />
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
                    src={data.photoUrl}
                    alt="Profile"
                    className="w-[120px] h-[120px] rounded-full object-cover"
                  />
                  <p className="mt-2 font-medium">{data.name}</p>
                  <span className="text-gray-500 text-sm">Photo</span>
                </div>
                <div
                  className={`flex flex-col items-center mb-2 ${styles.mainDiv}`}
                >
                  <img
                    src={data.passportPhotoUrl}
                    alt="Passport"
                    className="w-[120px] h-[120px] rounded-full object-cover"
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
                      {data.applicationId}
                    </p>
                  </div>
                  <div className="w-full flex flex-col gap-1 my-4">
                    <p className="text-[14px] font-[500] text-[#727A90]">
                      Visa Type
                    </p>
                    <span className={`w-[112px] ${styles.tableChip}`}>
                      {data.visaType}
                    </span>
                  </div>
                  <div className="w-full flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                      <p className="text-[14px] font-[500] text-[#727A90]">
                        Passport Number
                      </p>
                      <p className="w-full text-[14px] font-[500] text-[#24282E]">
                        {data.passportNumber}
                      </p>
                    </div>
                    <CopySvg />
                  </div>
                </div>
                <div className={`${styles.mainDiv}`}>
                  <div
                    onClick={() => setIsViewInfo(true)}
                    className="flex items-center justify-between"
                  >
                    <PdfSvg className="w-[58px] h-[58px]" />
                    <span className="text-[20px] font-[600] text-[#24282E]">
                      India.pdf
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
                        {data.email}
                      </p>
                    </div>
                    <div className="col-span-6">
                      <p className="text-[14px] font-[500] text-[#727A90]">
                        Phone Number
                      </p>
                      <p className="text-[14px] font-[500] text-[#24282E]">
                        {data.phone}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-12">
                    <div className="col-span-6">
                      <p className="text-[14px] font-[500] text-[#727A90]">
                        Visa Type
                      </p>
                      <p className="text-[14px] font-[500] text-[#24282E]">
                        {data.visaType}
                      </p>
                    </div>
                    <div className="col-span-6">
                      <p className="text-[14px] font-[500] text-[#727A90]">
                        Country
                      </p>
                      <p className="text-[14px] font-[500] text-[#24282E]">
                        {data.country}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-12">
                    <div className="col-span-6">
                      <p className="text-[14px] font-[500] text-[#727A90]">
                        Passport Number
                      </p>
                      <p className="text-[14px] font-[500] text-[#24282E]">
                        {data.visaType}
                      </p>
                    </div>
                    <div className="col-span-6">
                      <p className="text-[14px] font-[500] text-[#727A90]">
                        Flight Date
                      </p>
                      <p className="text-[14px] font-[500] text-[#24282E]">
                        {data.country}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsNewApplication(true)}
                    className={styles.infoBtn}
                  >
                    View all Info
                  </button>
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
                      Cancel
                      <DropDownSvg color="#F05D3D" />
                    </span>
                  </div>
                  <hr className="my-3" />
                  <p className="text-[12px] font-[400] text-[#727A90] mb-2">
                    Cancellation Reason :{" "}
                  </p>
                  <p className="text-[12px] font-[400] text-[#24282E]">
                    {data.cancellationReason}
                  </p>
                  <div className="mt-4">
                    <h3 className="text-[14px] font-[500] text-[#24282E] mb-1">
                      Internal Notes
                    </h3>
                    <textarea
                      className={styles.textArenaStyles}
                      placeholder="Write Description Here"
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
                      Paid: {data.paidAmount}
                    </p>
                  </div>
                  <p className="text-[12px] font-[500] text-[#727A90]">
                    Date: {data.paymentDate}
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
