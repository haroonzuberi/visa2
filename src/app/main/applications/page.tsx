"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

const modalParams = {
  name: "Linda Blair",
  photoUrl:
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRTgD14vQ6I-UBiHTcwxZYnpSfLFJ2fclwS2A&s", // Replace with actual image path
  email: "abc@gmail.com",
  phone: "050 414 8788",
  visaType: "Business Visa",
  country: "India",
  flightDate: "26 October 2024",
  passportPhotoUrl:
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRTgD14vQ6I-UBiHTcwxZYnpSfLFJ2fclwS2A&s", // Replace with actual image path
  applicationId: "ID0121",
  passportNumber: "050 414 8788",
  status: "Cancel",
  cancellationReason:
    "Cancellation Reason: The applicant has decided to postpone their travel plans due to unforeseen personal circumstances. As a result, the visa application is no longer required at this time",
  internalNotes: "",
  paidAmount: "$2000",
  paymentDate: "20 Oct 2024",
  invoiceFiles: [
    { name: "Invoice name here", url: "/path-to-invoice.pdf" }, // Replace with actual paths
    { name: "Visa Invoice name here", url: "/path-to-visa-invoice.pdf" },
  ],
};

const formatStatus = (status: string) => {
  return status
    .replace(/_/g, " ") // Replace underscores with spaces
    .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize first letter of each word
};

const Status = ({ status = "" }: { status: string }) => {
  const getStatusStyle = () => {
    switch (status.toLowerCase()) {
      case "new":
      case "have_issues":
      case "need_to_pay_gov_fee":
        return "bg-[#feefec] text-[#F05D3D] text-[10px] font-[600] border-[1px] rounded-[100px] border-[#FACDC3]";

      case "gov _fee_paid":
        return "bg-[#ECFBF3] text-[#42DA82] text-[10px] font-[600] border-[1px] rounded-[100px] border-[#42DA82]";
      case "cancel":
      case "approved":
        return "bg-[#E6F4F5] text-[#009499] text-[10px] font-[600] border-[1px] rounded-[100px] border-[#B0DEDF]";

      case "ready_to_apply":
        return "bg-[#E6F5FE] text-[#019BF4] text-[10px] font-[600] border-[1px] rounded-[100px] border-[#B0E0FC]";

      case "rejected":
        return "bg-[#FDEDED] text-[#D32F2F] text-[10px] font-[600] border-[1px] rounded-[100px] border-[#F5C6C6]";

      default:
        return "bg-[#F3F4F6] text-[#6B7280] text-[10px] font-[600] border-[1px] rounded-[100px] border-[#D1D5DB]";
    }
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusStyle()}`}
    >
      {formatStatus(status)}
    </span>
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
  }, [dispatch, currentPage]);

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

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    dispatch(setCurrentPage(1));
  };

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
    setSelectedApplication(application);
    setIsApplicationDetail(true);
  };

  const handleCloseModal = () => {
    setIsApplicationDetail(false);
    setSelectedApplication(null);
  };

  const getValue = (submission: any, field: string) => {
    return submission.values[field]?.value || "N/A";
  };

  return (
    <>
      <div className="flex justify-between mt-3">
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
          onSearchChange={handleSearch}
          searchQuery={searchTerm}
        />

        {/* Application Table */}
        <div className="bg-white rounded-xl">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className={tableStyles.tableHeaders}>
                  Customers
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
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    No applications found
                  </TableCell>
                </TableRow>
              ) : (
                data?.data.map((submission) => (
                  <TableRow key={submission.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className={tableStyles.userEmail}>
                          #{submission.application_id}
                        </span>
                        <span className={tableStyles.userName}>
                          {getValue(submission, "full_name")}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col w-[140px]">
                        <span className={styles.tags}>
                          {submission.form_name || "N/A"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{submission.created_at}</TableCell>
                    <TableCell>
                      {getValue(submission, "arrival_date")}
                    </TableCell>
                    <TableCell>
                      <Priority level={submission.priority} />
                    </TableCell>
                    <TableCell>
                      <Status status={submission.visa_status} />
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className={styles.visaText}>
                          {getValue(submission, "purpose_of_visit")}
                        </span>
                        <div className="flex items-center gap-2">
                          <IndiaFlag className="w-5 h-5" />
                          <span className="text-sm">
                            {getValue(submission, "nationality")}
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
                        <DropdownSVG className="cursor-pointer w-[13px] h-[8px]" />
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
          data={modalParams}
        />
      )}
      {isNewApplicationModalOpen && (
        <NewApplicationModal
          isOpen={isNewApplicationModalOpen}
          onClose={() => setIsNewApplicationModalOpen(false)}
        />
      )}
    </>
  );
}
