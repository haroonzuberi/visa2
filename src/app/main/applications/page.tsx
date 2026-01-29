"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Disable static generation for this page to prevent metadata processing errors
export const dynamic = 'force-dynamic';
import styles from "./styles.module.css";
import tableStyles from "../table.styles.module.css";
import DropdownSVG from "@/Assets/svgs/DropdownSVG";
import IndiaFlag from "@/Assets/svgs/IndiaFlag";
import EyeIcon from "@/Assets/svgs/EyeIcon";
import GeneralData from "../../../components/ui/tableheader/page";
import TableFooterComponent from "@/components/ui/tablefooter/page";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Modal from "@/components/modals/ApplicationDetailModal/page";
import NewApplicationModal from "@/components/modals/NewApplicationModal/page";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { PAGINATION_CONFIG } from "@/config/pagination";

import PlusGreenSvg from "@/Assets/svgs/PlusGreenSvg";
import ApplicationDetail from "@/components/modals/ApplicationDetailModal/page";
import {
  fetchFormSubmission,
  fetchSubmissions,
  setCurrentPage,
} from "@/store/slices/formSubmissionSlice";
import { updateApplicationStatus } from "@/store/slices/kanbanSlice";
import { putAPIWithAuth } from "@/utils/api";
import { toast } from "react-toastify";
import { ChevronDown } from "lucide-react";

const formatStatus = (status: string) => {
  return status
    .replace(/_/g, " ") // Replace underscores with spaces
    .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize first letter of each word
};

// All available status options
const STATUS_OPTIONS = [
  "new",
  "ready_to_apply",
  "have_issues",
  "need_gov_fee",
  "gov_fee_paid",
  "approved",
  "rejected",
  "cancelled",
  "temp_id_saved",
  "ready_for_payment",
  "payment_verified",
  "visa_granted",
  "visa_delivered",
];

const Status = ({ status = "", applicationId, onStatusChange }: { status: string; applicationId: number; onStatusChange?: (newStatus: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const getStatusStyle = () => {
    switch (status.toLowerCase()) {
      case "new":
      case "have_issues":
      case "need_to_pay_gov_fee":
      case "need_gov_fee":
        return "bg-[#feefec] text-[#F05D3D] text-[10px] font-[600] border-[1px] rounded-[100px] text-nowrap border-[#FACDC3]";

      case "gov_fee_paid":
      case "payment_verified":
      case "visa_granted":
      case "visa_delivered":
        return "bg-[#ECFBF3] text-[#42DA82] text-[10px] font-[600] border-[1px] rounded-[100px] text-nowrap border-[#42DA82]";
      case "cancelled":
      case "approved":
        return "bg-[#E6F4F5] text-[#009499] text-[10px] font-[600] border-[1px] rounded-[100px] text-nowrap border-[#B0DEDF]";

      case "ready_to_apply":
      case "ready_for_payment":
        return "bg-[#E6F5FE] text-[#019BF4] text-[10px] font-[600] border-[1px] rounded-[100px] text-nowrap border-[#B0E0FC]";

      case "rejected":
        return "bg-[#FDEDED] text-[#D32F2F] text-[10px] font-[600] border-[1px] rounded-[100px] text-nowrap border-[#F5C6C6]";

      case "temp_id_saved":
        return "bg-[#FFF4E6] text-[#F59E0B] text-[10px] font-[600] border-[1px] rounded-[100px] text-nowrap border-[#FDE68A]";

      default:
        return "bg-[#F3F4F6] text-[#6B7280] text-[10px] font-[600] border-[1px] rounded-[100px] text-nowrap border-[#D1D5DB]";
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === status || isUpdating) return;
    
    setIsUpdating(true);
    try {
      const response: any = await putAPIWithAuth("update-application-status", {
        id: applicationId,
        new_status: newStatus,
      });

      if (response?.success) {
        toast.success("Status updated successfully");
        if (onStatusChange) {
          onStatusChange(newStatus);
        }
      } else {
        toast.error(response?.data?.message || "Failed to update status");
      }
    } catch (error: any) {
      console.error("Error updating status:", error);
      toast.error(error?.message || "Failed to update status");
    } finally {
      setIsUpdating(false);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isUpdating}
        className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${getStatusStyle()} ${isUpdating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        {formatStatus(status)}
        <ChevronDown className="w-3 h-3" />
      </button>
      
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-20 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[220px] max-h-60 overflow-y-auto">
            {STATUS_OPTIONS.map((option) => (
              <button
                key={option}
                onClick={() => handleStatusChange(option)}
                disabled={isUpdating}
                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${
                  option === status ? 'bg-[#42DA82] text-white hover:bg-[#38C572]' : 'text-gray-700'
                } ${isUpdating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {formatStatus(option)}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const Priority = ({ level = "" }: { level: string }) => {
  const getColor = () => {
    switch (level.toLowerCase()) {
      case "high":
        return "text-[#F05D3D] text-[14px] font-[500] ";
      case "medium":
        return "text-[#DDCB06] text-[14px] font-[500]";
      case "low":
        return "text-[#42DA82] text-[14px] font-[500]";
      default:
        return "text-gray-500 text-[14px] font-[500]";
    }
  };

  return (
    <span className={`flex items-center gap-2 ${getColor()}`}>
      <span className="w-2 h-2 rounded-full bg-current" />
      {level}
    </span>
  );
};

const LoadingSkeleton = () =>
  [...Array(PAGINATION_CONFIG.DEFAULT_PAGE_SIZE)].map((_, index) => (
    <TableRow key={index} className="border-b border-gray-100">
      {/* Customers Column (ID & Creation Source) */}
      <TableCell className="py-4">
        <div className="flex flex-col gap-1">
          <div className="h-4 w-[60px] bg-gray-200 rounded"></div>
          <div className="h-3 w-[100px] bg-gray-100 rounded"></div>
        </div>
      </TableCell>

      {/* Tags Column */}
      <TableCell className="py-4">
        <div className="flex flex-col gap-1">
          <div className="h-3 w-[140px] bg-gray-100 rounded"></div>
        </div>
      </TableCell>

      {/* Application Date Column */}
      <TableCell className="py-4">
        <div className="h-4 w-[140px] bg-gray-200 rounded"></div>
      </TableCell>

      {/* Flight Date Column */}
      <TableCell className="py-4">
        <div className="h-4 w-[120px] bg-gray-200 rounded"></div>
      </TableCell>

      {/* Priority Level Column */}
      <TableCell className="py-4">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 bg-gray-200 rounded-full"></div>
          <div className="h-4 w-[100px] bg-gray-200 rounded"></div>
        </div>
      </TableCell>

      {/* Status Column */}
      <TableCell className="py-4">
        <div className="h-6 w-[100px] bg-gray-200 rounded-full"></div>
      </TableCell>

      {/* Visa Type & Country Column */}
      <TableCell className="py-4">
        <div className="flex flex-col gap-1">
          <div className="h-4 w-[120px] bg-gray-200 rounded"></div>
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 bg-gray-200 rounded"></div>
            <div className="h-4 w-[80px] bg-gray-200 rounded"></div>
          </div>
        </div>
      </TableCell>

      {/* Actions Column */}
      <TableCell className="py-4">
        <div className="flex justify-center items-center gap-2">
          <div className="h-5 w-5 bg-gray-200 rounded"></div>
          <div className="h-5 w-5 bg-gray-200 rounded"></div>
        </div>
      </TableCell>
    </TableRow>
  ));

export default function Applications() {
  const dispatch = useDispatch<AppDispatch>();
  const [searchTerm, setSearchTerm] = useState("");
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNewApplicationModalOpen, setIsNewApplicationModalOpen] =
    useState(false);
  const { data, isLoading, error, total, currentPage }: any = useSelector(
    (state: RootState) => state.formSubmissions
  );
  const [isApplicationDetail, setIsApplicationDetail] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<any | null>(
    null
  );

  useEffect(() => {
    const skip = (currentPage - 1) * PAGINATION_CONFIG.DEFAULT_PAGE_SIZE;
    dispatch(fetchSubmissions({ skip }));
  }, [dispatch, currentPage, searchTerm]);

  useEffect(() => {
    setIsModalOpen(searchParams.get("modal") === "open");
  }, [searchParams]);

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isModalOpen]);

  // const handleSearch = (value: string) => {
  //   setSearchTerm(value);
  //   dispatch(setCurrentPage(1));
  // };

  const handlePageChange = (page: number) => {
    dispatch(setCurrentPage(page));
  };

  const openModal = () => {
    router.push(`${pathname}?modal=open`);
  };

  const closeModal = () => {
    router.push(pathname);
  };

  const handleOpenModal = (application: any) => {
    // Pass only the id to fetch full details from API
    setSelectedApplication({ id: application.id });
    setIsApplicationDetail(true);
  };

  const handleCloseModal = () => {
    setIsApplicationDetail(false);
    setSelectedApplication(null);
  };

  // Helper to safely get field value or return N/A
  const getFieldValue = (value: any) => {
    if (!value) return "N/A";
    
    // If it's an object, try to extract a meaningful string value
    if (typeof value === "object" && value !== null) {
      // If it has a 'name' property, use that
      if (value.name) return String(value.name);
      // If it has a 'value' property, use that
      if (value.value !== undefined) {
        const val = value.value;
        if (typeof val === "object" && val !== null && val.name) {
          return String(val.name);
        }
        return String(val);
      }
      // Otherwise, try to stringify (but this shouldn't happen)
      return "N/A";
    }
    
    // If it's a string or number, return it as string
    return String(value);
  };

  return (
    <>
      <div className="flex justify-between items-center mt-3">
        <h1 className={styles.header}>Manage Applications Lists</h1>
        <button
          type="button"
          className={styles.customerBtn}
          onClick={() => setIsNewApplicationModalOpen(true)}
        >
          <PlusGreenSvg className={styles.btnPlusIcon} />
          Add New Application
        </button>
      </div>

      <div className={tableStyles.mainContainer}>
        {/* Header */}
        <GeneralData
          search={true}
          header="Application List"
          showFilters={true}
          showSeeMore={true}
          onSearchChange={setSearchTerm}
          searchQuery={searchTerm}
        />

        {/* Application Table */}
        <div className="bg-white rounded-xl">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className={tableStyles.tableHeaders}>
                  Application ID
                </TableHead>
                <TableHead className={tableStyles.tableHeaders}>Tags</TableHead>
                <TableHead className={tableStyles.tableHeaders}>
                  Application Date
                </TableHead>
                <TableHead className={tableStyles.tableHeaders}>
                  Flight Date
                </TableHead>
                <TableHead className={tableStyles.tableHeaders}>
                  Priority Level
                </TableHead>
                <TableHead className={tableStyles.tableHeaders}>
                  Status
                </TableHead>
                <TableHead className={tableStyles.tableHeaders}>
                  Visa Type & Country
                </TableHead>
                <TableHead className={tableStyles.tableHeaders}>
                  <span className="flex items-center justify-center gap-2">
                    Actions
                    <DropdownSVG />
                  </span>
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                <LoadingSkeleton />
              ) : !data || (Array.isArray(data) && data.length === 0) ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    No applications found
                  </TableCell>
                </TableRow>
              ) : (
                (Array.isArray(data) ? data : []).map((submission: any) => (
                  <TableRow key={submission.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className={tableStyles.userEmail}>
                          #{getFieldValue(submission.application_id)}
                        </span>
                        <span className={tableStyles.userName}>
                          {getFieldValue(submission.customer_name || submission.applicant_name)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col w-[140px]">
                        <span className={styles.tags}>
                          {getFieldValue(submission.form_name)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {submission.created_at 
                        ? (() => {
                            try {
                              const date = new Date(submission.created_at);
                              return date.toLocaleString();
                            } catch {
                              return "N/A";
                            }
                          })()
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      {getFieldValue(submission.flight_date)}
                    </TableCell>
                    <TableCell>
                      <Priority level={getFieldValue(submission.priority)} />
                    </TableCell>
                    <TableCell>
                      <Status 
                        status={getFieldValue(submission.visa_status)} 
                        applicationId={submission.id}
                        onStatusChange={() => {
                          // Refresh the list after status change
                          const skip = (currentPage - 1) * PAGINATION_CONFIG.DEFAULT_PAGE_SIZE;
                          dispatch(fetchSubmissions({ skip }));
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className={styles.visaText}>
                          {submission.visa_type?.name || getFieldValue(submission.visa_type) || "N/A"}
                        </span>
                        <div className="flex items-center gap-2">
                          {submission.visa_type?.country?.flag_emoji ? (
                            <span className="text-sm">{submission.visa_type.country.flag_emoji}</span>
                          ) : (
                            <IndiaFlag className="w-5 h-5" />
                          )}
                          <span className="text-sm">
                            {submission.visa_type?.country?.name || getFieldValue(submission.country) || "N/A"}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center items-center gap-2">
                        <EyeIcon
                          onClick={() => handleOpenModal(submission)}
                          className="cursor-pointer "
                        />
                        {/* <DropdownSVG className="cursor-pointer w-[13px] h-[8px]" /> */}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Footer Section */}
        <TableFooterComponent
          total={total}
          currentPage={currentPage}
          onPageChange={handlePageChange}
        />
      </div>
      {isApplicationDetail && selectedApplication && (
        <ApplicationDetail
          setIsApplicationDetail={setIsApplicationDetail}
          onClose={handleCloseModal}
          data={selectedApplication}
        />
      )}
      {isNewApplicationModalOpen && (
        <NewApplicationModal
          onClose={() => {
            setIsNewApplicationModalOpen(false);
          }}
          onSuccess={() => {
            // Refresh the applications list
            const skip = (currentPage - 1) * PAGINATION_CONFIG.DEFAULT_PAGE_SIZE;
            dispatch(fetchSubmissions({ skip }));
          }}
        />
      )}
    </>
  );
}
