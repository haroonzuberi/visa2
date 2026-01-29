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
import StatusDropdown from "@/components/StatusDropdown/page";

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
                {/* <TableHead className={tableStyles.tableHeaders}>Tags</TableHead> */}
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
                    {/* <TableCell>
                      <div className="flex flex-col w-[140px]">
                        <span className={styles.tags}>
                          {getFieldValue(submission.form_name)}
                        </span>
                      </div>
                    </TableCell> */}
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
                      <StatusDropdown
                        status={getFieldValue(submission.visa_status)}
                        applicationId={submission.id}
                        onStatusChange={() => {
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
