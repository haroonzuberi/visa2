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
import TrashSvg from "@/Assets/svgs/TrashSvg";
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
import StatusDropdown, { STATUS_OPTIONS } from "@/components/StatusDropdown/page";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteApi } from "@/utils/api";
import { toast } from "react-toastify";

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

      {/* Arrival Date Column */}
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

      {/* Latest Note Column */}
      <TableCell className="py-4">
        <div className="h-4 w-[200px] bg-gray-200 rounded"></div>
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

const formatStatusLabel = (status: string) =>
  status.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

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
  const [openDeleteId, setOpenDeleteId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterApplicationId, setFilterApplicationId] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [filterCountry, setFilterCountry] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");

  const buildFetchParams = (pageOverride?: number) => {
    const page = pageOverride ?? currentPage;
    const skip = (page - 1) * PAGINATION_CONFIG.DEFAULT_PAGE_SIZE;

    return {
      skip,
      search: searchTerm.trim(),
      status: filterStatus || undefined,
      applicationId: filterApplicationId.trim() || undefined,
      priority: filterPriority || undefined,
      country: filterCountry.trim() || undefined,
      sortBy: sortBy || undefined,
      sortOrder: sortOrder || undefined,
    };
  };

  useEffect(() => {
    dispatch(fetchSubmissions(buildFetchParams()));
  }, [dispatch, currentPage, searchTerm, filterStatus, filterApplicationId, filterPriority, filterCountry, sortBy, sortOrder]);

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setIsModalOpen(searchParams.get("modal") === "open");
  }, [searchParams]);

  useEffect(() => {
    // Only run after component is mounted on client side to avoid hydration errors
    if (!isMounted || typeof window === "undefined") return;

    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      if (isMounted && typeof window !== "undefined") {
        document.body.style.overflow = "auto";
      }
    };
  }, [isModalOpen, isMounted]);

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
    // Pass only the id to fetch full details from API
    setSelectedApplication({ id: application.id });
    setIsApplicationDetail(true);
  };

  const handleCloseModal = () => {
    setIsApplicationDetail(false);
    setSelectedApplication(null);
  };

  const refreshList = () => {
    dispatch(fetchSubmissions(buildFetchParams()));
  };

  const handleDeleteApplication = async (applicationId: number): Promise<boolean> => {
    try {
      setDeletingId(applicationId);
      const response = await deleteApi(`applications/${applicationId}`);

      if (response.success) {
        toast.success("Application deleted successfully");
        refreshList();
        return true;
      } else {
        const message =
          (response.data as any)?.message ||
          "Failed to delete application. Please try again.";
        toast.error(message);
        return false;
      }
    } catch (error: any) {
      console.error("Error deleting application:", error);
      toast.error(
        error?.message || "Failed to delete application. Please try again."
      );
      return false;
    } finally {
      setDeletingId((current) => (current === applicationId ? null : current));
    }
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
          onSearchChange={handleSearch}
          searchQuery={searchTerm}
        />

        {/* Filters row */}
        <div className="bg-white px-4 py-3 border-t border-gray-100 flex flex-wrap gap-3 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium text-gray-600">
              Application ID
            </label>
            <input
              type="text"
              value={filterApplicationId}
              onChange={(e) => {
                setFilterApplicationId(e.target.value);
                dispatch(setCurrentPage(1));
              }}
              placeholder="e.g. VISA-1234"
              className="w-40 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#42DA82]/40"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium text-gray-600">
              Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                dispatch(setCurrentPage(1));
              }}
              className="w-44 px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#42DA82]/40"
            >
              <option value="">All statuses</option>
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {formatStatusLabel(status)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium text-gray-600">
              Priority
            </label>
            <select
              value={filterPriority}
              onChange={(e) => {
                setFilterPriority(e.target.value);
                dispatch(setCurrentPage(1));
              }}
              className="w-36 px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#42DA82]/40"
            >
              <option value="">All priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium text-gray-600">
              Country
            </label>
            <input
              type="text"
              value={filterCountry}
              onChange={(e) => {
                setFilterCountry(e.target.value);
                dispatch(setCurrentPage(1));
              }}
              placeholder="e.g. India"
              className="w-36 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#42DA82]/40"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium text-gray-600">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                dispatch(setCurrentPage(1));
              }}
              className="w-44 px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#42DA82]/40"
            >
              <option value="">No sorting</option>
              <option value="flight_date">Arrival Date</option>
              <option value="created_at">Application Date</option>
            </select>
          </div>

          {sortBy && (
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-medium text-gray-600">
                Sort Order
              </label>
              <select
                value={sortOrder}
                onChange={(e) => {
                  setSortOrder(e.target.value);
                  dispatch(setCurrentPage(1));
                }}
                className="w-36 px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#42DA82]/40"
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              setFilterApplicationId("");
              setFilterStatus("");
              setFilterPriority("");
              setFilterCountry("");
              setSortBy("created_at");
              setSortOrder("desc");
              setSearchTerm("");
              dispatch(setCurrentPage(1));
            }}
            className="ml-auto px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Clear Filters
          </button>
        </div>

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
                  Arrival Date
                </TableHead>
                <TableHead className={tableStyles.tableHeaders}>
                  Priority Level
                </TableHead>
                <TableHead className={tableStyles.tableHeaders}>
                  Status
                </TableHead>
                <TableHead className={tableStyles.tableHeaders}>
                  Latest Note
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
                  <TableCell colSpan={10} className="text-center py-8">
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
                      {(() => {
                        const dateValue = submission.flight_date || submission.expected_arrival_date;
                        if (!dateValue) return 'N/A';
                        
                        try {
                          const date = new Date(dateValue);
                          return date.toLocaleDateString();
                        } catch {
                          return dateValue;
                        }
                      })()}
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
                      <div className="max-w-[200px]">
                        <span className="text-[12px] text-[#24282E] line-clamp-2">
                          {(() => {
                            // Handle latest_note as object or string
                            const latestNote = submission.latest_note || 
                                             submission.latest_comment || 
                                             submission.latest_issue_note ||
                                             getFieldValue(submission.latest_note);
                            
                            if (!latestNote) return "No notes";
                            
                            // If it's an object, extract the content field
                            if (typeof latestNote === 'object' && latestNote !== null) {
                              return latestNote.content || latestNote.note || JSON.stringify(latestNote);
                            }
                            
                            // If it's a string, return it directly
                            return String(latestNote);
                          })()}
                        </span>
                      </div>
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
                      <div className="flex justify-center items-center gap-3">
                        <EyeIcon
                          onClick={() => handleOpenModal(submission)}
                          className="cursor-pointer"
                        />
                        <AlertDialog
                          open={openDeleteId === submission.id}
                          onOpenChange={(open) => {
                            // Prevent closing while delete is in progress
                            if (deletingId === submission.id) return;
                            setOpenDeleteId(open ? submission.id : null);
                          }}
                        >
                          <AlertDialogTrigger asChild>
                            <button
                              type="button"
                              className="p-1 rounded hover:bg-red-50 focus:outline-none"
                              title="Delete application"
                            >
                              <TrashSvg className="w-4 h-4" />
                            </button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-white rounded-lg shadow-lg p-6 max-w-md">
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Delete this application?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will
                                permanently delete the application{" "}
                                <span className="font-semibold">
                                  #{getFieldValue(submission.application_id)}
                                </span>{" "}
                                and all related data.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel
                                disabled={deletingId === submission.id}
                              >
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-red-600 hover:bg-red-700"
                                disabled={deletingId === submission.id}
                                onClick={async (e) => {
                                  // Prevent Radix from auto-closing before the API call finishes
                                  e.preventDefault();
                                  const success = await handleDeleteApplication(
                                    submission.id
                                  );
                                  if (success) {
                                    setOpenDeleteId(null);
                                  }
                                }}
                              >
                                {deletingId === submission.id
                                  ? "Deleting..."
                                  : "Delete"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
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
