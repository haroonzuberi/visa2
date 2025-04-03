"use client";
import { useEffect, useState } from "react";
import styles from "./styles.module.css";
import tableStyles from "../table.styles.module.css";
import PlusGreenSvg from "@/Assets/svgs/PlusGreenSvg";
import GeneralData from "@/components/ui/tableheader/page";
import TableFooterComponent from "@/components/ui/tablefooter/page";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import EditSvg from "@/Assets/svgs/EditSvg";
import TrashSvg from "@/Assets/svgs/TrashSvg";
import { Button } from "@/components/ui/button";
import DropdownSVG from "@/Assets/svgs/DropdownSVG";
import { AppDispatch, RootState } from "@/store";
import { useDispatch, useSelector } from "react-redux";
import { PAGINATION_CONFIG } from "@/config/pagination";
import {
  fetchApplications,
  setCurrentPage,
} from "@/store/slices/applicationsSlice";

// Add this skeleton component
const FormsSkeleton = () => {
  return (
    <div className={styles.tableContainer}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className={tableStyles.tableHeaders}>
              Visa Id & Name
            </TableHead>
            <TableHead className={tableStyles.tableHeaders}>
              # of started
            </TableHead>
            <TableHead className={tableStyles.tableHeaders}>
              # of paid
            </TableHead>
            <TableHead className={tableStyles.tableHeaders}>
              Total Revenue
            </TableHead>
            <TableHead className={`w-[20px] ${tableStyles.tableHeaders}`}>
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {[...Array(PAGINATION_CONFIG.DEFAULT_PAGE_SIZE)].map((_, index) => (
            <TableRow key={index} className="hover:bg-gray-50">
              <TableCell>
                <div className="flex flex-col gap-1">
                  <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </TableCell>
              <TableCell>
                <div className="h-5 w-16 bg-gray-200 rounded animate-pulse"></div>
              </TableCell>
              <TableCell>
                <div className="h-5 w-16 bg-gray-200 rounded animate-pulse"></div>
              </TableCell>
              <TableCell>
                <div className="h-5 w-24 bg-gray-200 rounded animate-pulse"></div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-4">
                  <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default function Forms() {
  const dispatch = useDispatch<AppDispatch>();
  const [searchTerm, setSearchTerm] = useState("");
  const { applications, isLoading, error, total, currentPage } = useSelector(
    (state: RootState) => state.applicantions
  );

  // const [currentPage, setCurrentPage] = useState(1);

  const handlePageChange = (page: number) => {
    dispatch(setCurrentPage(page));
  };
  useEffect(() => {
    const skip = (currentPage - 1) * PAGINATION_CONFIG.DEFAULT_PAGE_SIZE;
    dispatch(fetchApplications({ skip, search: searchTerm }));
  }, [dispatch, currentPage, searchTerm]);

  if (isLoading || !applications) {
    return (
      <>
        {/* Page Header */}
        <div className="flex justify-between mt-3">
          <h1 className={styles.header}>Manage Visa forms</h1>
          <button type="button" className={styles.createFormBtn}>
            <PlusGreenSvg className={styles.btnPlusIcon} />
            Create New Form
          </button>
        </div>

        <div className={tableStyles.mainContainer}>
          {/* Header */}
          <GeneralData
            search={true}
            header="Visa Lists"
            searchQuery={searchTerm}
            onSearchChange={setSearchTerm}
          />

          {/* Forms Table with Skeleton */}
          <div className="bg-white rounded-xl w-full">
            <FormsSkeleton />
          </div>

          {/* Footer Section */}
          <TableFooterComponent
            total={0}
            currentPage={1}
            onPageChange={() => {}}
          />
        </div>
      </>
    );
  }

  return (
    <>
      {/* Page Header */}
      <div className="flex justify-between mt-3">
        <h1 className={styles.header}>Manage Visa forms</h1>
        <button type="button" className={styles.createFormBtn}>
          <PlusGreenSvg className={styles.btnPlusIcon} />
          Create New Form
        </button>
      </div>

      <div className={tableStyles.mainContainer}>
        {/* Header */}
        <GeneralData
          search={true}
          searchQuery={searchTerm}
          onSearchChange={setSearchTerm}
          header="Visa Lists"
          showSeeMore={true}
          showFilters={true}
        />

        {/* Forms Table */}
        <div className="bg-white rounded-xl w-ful">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className={tableStyles.tableHeaders}>
                  Visa Id & Name
                </TableHead>
                <TableHead className={tableStyles.tableHeaders}>
                  # of started
                </TableHead>
                <TableHead className={tableStyles.tableHeaders}>
                  # of paid
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-2">
                    <span className={tableStyles.tableHeaders}>
                      Total Revenue
                    </span>
                  </div>
                </TableHead>
                <TableHead className={` w-[20px] ${tableStyles.tableHeaders}`}>
                  <span className="flex items-center  gap-2 ">
                    Actions
                    <DropdownSVG />
                  </span>
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {applications.map((form) => (
                <TableRow key={form.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div className="flex flex-col">
                      <span className={tableStyles.id}>{form.id}</span>
                      <span className={tableStyles.userName}>{form.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className={tableStyles.userName}>N/A </TableCell>
                  <TableCell className={tableStyles.userName}>N/A </TableCell>
                  <TableCell className={tableStyles.userName}>N/A </TableCell>
                  <TableCell>
                    <div className="flex items-center  gap-4">
                      {/* <EditSvg className="w-[20px] h-[20px]" /> */}
                      {/* <TrashSvg className="w-[20px] h-[20px]" /> */}
                      <Button className={styles.copyBtn}>
                        Copy form iframe code
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
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
    </>
  );
}
