"use client";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchApplicants,
  deleteApplicant,
  setCurrentPage,
} from "@/store/slices/applicantsSlice";
import { AppDispatch, RootState } from "@/store";
import { PAGINATION_CONFIG } from "@/config/pagination";
import styles from "./styles.module.css";
import tableStyles from "../table.styles.module.css";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import GeneralData from "@/components/ui/tableheader/page";
import TableFooter from "@/components/ui/tablefooter/page";
import ConfirmDialog from "@/components/ui/confirmDialogue/confirmDialogu";
import CreateApplicantModal from "@/components/modals/CreateApplicantModal/page";
import PlusGreenSvg from "@/Assets/svgs/PlusGreenSvg";
import CalendarSvg from "@/Assets/svgs/CalendarSvg";
import PhoneSvg from "@/Assets/svgs/PhoneSvg";
import DropdownSVG from "@/Assets/svgs/DropdownSVG";
import EditSvg from "@/Assets/svgs/EditSvg";
import TrashSvg from "@/Assets/svgs/TrashSvg";
import TimeSvg from "@/Assets/svgs/TimeSvg";

export default function ApplicantsTable() {
  const dispatch = useDispatch<AppDispatch>();
  const { applicants, isLoading, total, currentPage } = useSelector(
    (state: RootState) => state.applicants
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [applicantToDelete, setApplicantToDelete] = useState<any>(null);

  useEffect(() => {
    const skip = (currentPage - 1) * PAGINATION_CONFIG.DEFAULT_PAGE_SIZE;
    dispatch(fetchApplicants({ skip, search: searchQuery }));
  }, [currentPage, searchQuery, dispatch]);

  const handlePageChange = (page: number) => {
    dispatch(setCurrentPage(page));
  };

  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false);
    setSelectedApplicant(null);
  };

  const handleEditClick = (applicant: any) => {
    setSelectedApplicant(applicant);
    setIsCreateModalOpen(true);
  };

  const handleDeleteClick = (applicant: any) => {
    setApplicantToDelete(applicant);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (applicantToDelete) {
      await dispatch(deleteApplicant(applicantToDelete.id));
      setIsDeleteDialogOpen(false);
      setApplicantToDelete(null);
    }
  };

  const LoadingSkeleton = () => (
    <>
      {[...Array(PAGINATION_CONFIG.DEFAULT_PAGE_SIZE)].map((_, index) => (
        <TableRow key={index}>
          <TableCell>
            <div className="flex flex-col gap-2">
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </TableCell>
          <TableCell>
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
          </TableCell>
          <TableCell>
            <div className="h-4 w-28 bg-gray-200 rounded animate-pulse"></div>
          </TableCell>
          <TableCell>
            <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
          </TableCell>
          <TableCell>
            <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
          </TableCell>
        </TableRow>
      ))}
    </>
  );

  return (
    <>
      <div className="flex justify-between mt-3">
        <h1 className={styles.header}>Manage Applicants</h1>
        <button
          type="button"
          className={styles.userBtn}
          onClick={() => setIsCreateModalOpen(true)}
        >
          <PlusGreenSvg className={styles.btnPlusIcon} />
          Add Applicant
        </button>
      </div>

      <div className={tableStyles.mainContainer}>
        <GeneralData
          search={true}
          header="Applicants List"
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        {/* Applicants Table */}
        <div className="bg-white rounded-xl">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-[14px] font-[500] text-[#727A90]">
                  Applicants
                </TableHead>
                <TableHead className={tableStyles.tableHeaders}>
                  {" "}
                  <span className="inline-flex items-center gap-2">
                    <CalendarSvg className="w-4 h-4" />
                    <span className={tableStyles.tableHeaders}>
                      Created date
                    </span>
                  </span>
                </TableHead>

                <TableHead className={tableStyles.tableHeaders}>
                  {" "}
                  <span className="inline-flex items-center gap-2">
                    <PhoneSvg className="w-4 h-4" />
                    <span className={tableStyles.tableHeaders}>Phone</span>
                  </span>
                </TableHead>

                <TableHead className={tableStyles.tableHeaders}>
                  {" "}
                  <span className="inline-flex items-center gap-2">
                    <TimeSvg className="w-4 h-4" />
                    <span className={tableStyles.tableHeaders}>Passport Number</span>
                  </span>
                </TableHead>
                <TableHead className={tableStyles.tableHeaders}>
                  {" "}
                  <span className="inline-flex items-center gap-2">
                    <span className={tableStyles.tableHeaders}>Actions</span>
                    <DropdownSVG />
                  </span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <LoadingSkeleton />
              ) : applicants.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    No applicants found
                  </TableCell>
                </TableRow>
              ) : (
                applicants.map((applicant) => (
                  <TableRow key={applicant.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className={tableStyles.userName}>
                          {applicant.name}
                        </span>
                        <span className={tableStyles.userEmail}>
                          {applicant.email}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(applicant.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className={` ${tableStyles.userName}`}>
                      {applicant.phone || "N/A"}
                    </TableCell>
                    
                    <TableCell className={tableStyles.tableHeaders}>
                    {applicant.passport_number}
                                        </TableCell>
                    <TableCell className="">
                      <span className="flex align-center gap-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger>
                            <DropdownSVG className="cursor-pointer" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-white ">
                            <DropdownMenuItem
                              onClick={() => handleEditClick(applicant)}
                              className="bg-white"
                            >
                              <EditSvg className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <TrashSvg
                          className="cursor-pointer"
                          onClick={() => handleDeleteClick(applicant)}
                        />
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <TableFooter
          total={total}
          currentPage={currentPage}
          onPageChange={handlePageChange}
        />
      </div>

      <CreateApplicantModal
        isOpen={isCreateModalOpen}
        onClose={() => {
            setSelectedApplicant(null)
            setIsCreateModalOpen(false)
        }}
        onSuccess={handleCreateSuccess}
        editData={selectedApplicant}
      />

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        setIsOpen={setIsDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        title="Delete Applicant"
        description={`Are you sure you want to delete ${applicantToDelete?.name}? This action cannot be undone.`}
        triggerText=""
      />
    </>
  );
}
