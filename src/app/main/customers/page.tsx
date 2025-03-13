"use client";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCustomers, setCurrentPage } from "@/store/slices/customersSlice";
import { PAGINATION_CONFIG } from "@/config/pagination";
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
import styles from "./styles.module.css";
import tableStyles from "../table.styles.module.css";
import PlusGreenSvg from "@/Assets/svgs/PlusGreenSvg";
import CalendarSvg from "@/Assets/svgs/CalendarSvg";
import PhoneSvg from "@/Assets/svgs/PhoneSvg";
import DropdownSVG from "@/Assets/svgs/DropdownSVG";
import UserSvg from "@/Assets/svgs/UserSvg";
import EditSvg from "@/Assets/svgs/EditSvg";
import DownloadSvg from "@/Assets/svgs/DownloadSvg";
import GeneralData from "../../../components/ui/tableheader/page";
import TableFooter from "../../../components/ui/tablefooter/page";
import { useRouter, usePathname } from "next/navigation"; // ✅ Make sure to import from "next/navigation" in App Router (Next.js 13+)
import { AppDispatch, RootState } from "@/store";
import CreateCustomerModal from "@/components/modals/CreateCustomerModal/page";
// import { Skeleton } from "@/components/ui/skeleton";

export default function CustomerTable() {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch<AppDispatch>();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  // Get customers state from Redux
  const { customers, isLoading, error, total, currentPage } = useSelector(
    (state: RootState) => state.customers
  );

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const isFromDetails = searchParams.get("fromDetails");

    if (!isFromDetails) {
      fetchData();
    }
  }, []);
  // Fetch customers only when page changes or search term changes
  // useEffect(() => {
  //   const searchParams = new URLSearchParams(window.location.search);
  //   const isFromDetails = searchParams.get("fromDetails");

  //   if (!isFromDetails) {
  //     fetchData();
  //   }
  // }, [ searchTerm]);

  // Remove the original useEffect that was fetching on mount
  // Fetch customers on mount and when page changes
  // useEffect(() => {
  //   const skip = (currentPage - 1) * PAGINATION_CONFIG.DEFAULT_PAGE_SIZE;
  //   dispatch(fetchCustomers({ skip, search: searchTerm }));
  // }, [dispatch, currentPage, searchTerm]);

  const fetchData = () => {
    const skip = (currentPage - 1) * PAGINATION_CONFIG.DEFAULT_PAGE_SIZE;
    dispatch(fetchCustomers({ skip, search: searchTerm }));
  };
  // Handle page change
  const handlePageChange = (page: number) => {
    const totalPages = Math.ceil(total / PAGINATION_CONFIG.DEFAULT_PAGE_SIZE);
    if (page >= 1 && page <= totalPages) {
      dispatch(setCurrentPage(page));
      const skip = (page - 1) * PAGINATION_CONFIG.DEFAULT_PAGE_SIZE;
      dispatch(fetchCustomers({ skip, search: searchTerm }));
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    dispatch(setCurrentPage(1));
    dispatch(fetchCustomers({ skip: 0, search: value }));
  };

  const handleCreateSuccess = () => {
    // If we're not on page 1, go to page 1 to see the new item
    // if (currentPage !== 1) {
    //   handlePageChange(1);
    // } else {
    //   // Just refresh current page
    //   const skip = (currentPage - 1) * PAGINATION_CONFIG.DEFAULT_PAGE_SIZE;
    //   dispatch(fetchCustomers({ skip, search: searchTerm }));
    // }
    handleModalClose();
  };

  const handleModalClose = () => {
    setIsCreateModalOpen(false);
    setSelectedCustomer(null);
  };

  const handleEditClick = (customer: any) => {
    setSelectedCustomer(customer);
    setIsCreateModalOpen(true);
  };

  const handleNavigateToDetails = (customerId: string) => {
    router.push(`/main/customerDetails/${customerId}?fromPage=${currentPage}`);
  };

  const LoadingSkeleton = () =>
    [...Array(PAGINATION_CONFIG.DEFAULT_PAGE_SIZE)].map((_, index) => (
      <TableRow key={index} className="border-b border-gray-100">
        {/* Users (ID & Creation Source) - Aligned with first header */}
        <TableCell className="py-4">
          <div className="flex flex-col gap-1">
            <div className="h-4 w-[60px] bg-gray-200 rounded"></div>
            <div className="h-3 w-[100px] bg-gray-100 rounded"></div>
          </div>
        </TableCell>

        {/* Customers (Name & Email) - Aligned with second header */}
        <TableCell className="py-4">
          <div className="flex flex-col gap-1">
            <div className="h-4 w-[120px] bg-gray-200 rounded"></div>
            <div className="h-3 w-[180px] bg-gray-100 rounded"></div>
          </div>
        </TableCell>

        {/* Created Date - Aligned with third header */}
        <TableCell className="py-4">
          <div className="h-4 w-[140px] bg-gray-200 rounded"></div>
        </TableCell>

        {/* Phone - Aligned with fourth header */}
        <TableCell className="py-4">
          <div className="h-4 w-[120px] bg-gray-200 rounded"></div>
        </TableCell>

        {/* Last Order Date and Time - Aligned with fifth header */}
        <TableCell className="py-4">
          <div className="flex flex-col gap-1">
            <div className="h-4 w-[140px] bg-gray-200 rounded"></div>
            <div className="h-3 w-[100px] bg-gray-100 rounded"></div>
          </div>
        </TableCell>

        {/* Total Orders - Aligned with sixth header */}
        <TableCell className="py-4">
          <div className="h-4 w-[60px] bg-gray-200 rounded"></div>
        </TableCell>

        {/* Actions - Aligned with last header */}
        <TableCell className="py-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-gray-200 rounded"></div>
            <div className="h-8 w-[100px] bg-gray-200 rounded"></div>
          </div>
        </TableCell>
      </TableRow>
    ));

  return (
    <>
      {/* Header Section */}
      <div className="flex justify-between mt-3">
        <h1 className={styles.header}>Manage Customers</h1>
        <button
          type="button"
          className={styles.customerBtn}
          onClick={() => setIsCreateModalOpen(true)}
        >
          <PlusGreenSvg className={styles.btnPlusIcon} />
          Add New Customer
        </button>
      </div>
      <div className={tableStyles.mainContainer}>
        {/* Search Section */}
        <GeneralData
          search={true}
          header="Customer List"
          onSearchChange={handleSearch}
          searchQuery={searchTerm}
        />
        {/* Customer Table */}
        <div className="bg-white rounded-xl">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className={tableStyles.tableHeaders}>
                  Users
                </TableHead>
                <TableHead className={tableStyles.tableHeaders}>
                  Customers
                </TableHead>
                <TableHead className={tableStyles.tableHeaders}>
                  <span className="inline-flex items-center gap-2">
                    <CalendarSvg className="w-4 h-4" />
                    <span className={tableStyles.tableHeaders}>
                      Created date
                    </span>
                  </span>
                </TableHead>

                <TableHead className={tableStyles.tableHeaders}>
                  <span className="inline-flex items-center gap-2">
                    <PhoneSvg className="w-4 h-4" />
                    <span className={tableStyles.tableHeaders}>Phone</span>
                  </span>
                </TableHead>

                <TableHead className={tableStyles.tableHeaders}>
                  <span className="inline-flex items-center gap-2">
                    <PhoneSvg className="w-4 h-4" />
                    <span className={tableStyles.tableHeaders}>
                      Last Order Date and Time
                    </span>
                  </span>
                </TableHead>

                <TableHead className={tableStyles.tableHeaders}>
                  Total Orders
                </TableHead>
                <TableHead className={tableStyles.tableHeaders}>
                  <span className="inline-flex items-center gap-2">
                    <span className={tableStyles.tableHeaders}>Actions</span>
                    <DropdownSVG />
                  </span>
                </TableHead>
              </TableRow>
            </TableHeader>

            {isLoading ? (
              <TableBody>
                <LoadingSkeleton />
              </TableBody>
            ) : (
              <TableBody>
                {customers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No customers found
                    </TableCell>
                  </TableRow>
                ) : (
                  customers.map((customer: any, index: number) => (
                    <TableRow
                      key={customer.id || index}
                      className="hover:bg-gray-50"
                    >
                      <TableCell>
                        <div className="flex flex-col">
                          <span className={tableStyles.userEmail}>
                            #{customer.id}
                          </span>
                          <span className={tableStyles.userName}>
                            {customer.creation_source}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className={tableStyles.userName}>
                            {customer.name}
                          </span>
                          <span className={tableStyles.userEmail}>
                            {customer.email}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className={tableStyles.userName}>
                        {new Date(customer.created_at).toLocaleDateString(
                          "en-US",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          }
                        )}
                      </TableCell>
                      <TableCell className={tableStyles.userName}>
                        {customer.phone}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className={tableStyles.userName}>
                            {customer.lastOrderDate || "N/A"}
                          </span>
                          <span className={tableStyles.userEmail}>
                            {customer.lastOrderTime || "N/A"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className={tableStyles.tableName}>
                        <button
                          onClick={() => handleNavigateToDetails(customer.id)}
                          className="hover:text-primary"
                        >
                          {customer.totalOrders || 0}
                        </button>
                      </TableCell>
                      <TableCell className="">
                        <span className="flex  items-center gap-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger>
                              <DropdownSVG className="cursor-pointer" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              className={styles.dropdownItem}
                            >
                              <DropdownMenuItem className="flex items-center p-4">
                                <UserSvg color="#727A90" className="w-4 h-4" />
                                <span className={styles.dropdownText}>
                                  Change Account Type
                                </span>
                              </DropdownMenuItem>
                              <hr />
                              <DropdownMenuItem
                                className="flex items-center p-4"
                                onClick={() => handleEditClick(customer)}
                              >
                                <EditSvg className="w-4 h-4" />
                                <span className={styles.dropdownText}>
                                  Edit
                                </span>
                              </DropdownMenuItem>
                              <hr />
                              <DropdownMenuItem className="flex items-center p-4">
                                <DownloadSvg className="w-4 h-4" />
                                <span className={styles.dropdownText}>
                                  Resend Invite
                                </span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          <button
                            onClick={() => handleNavigateToDetails(customer.id)}
                            type="button"
                            className={styles.customerBtn}
                          >
                            All Orders
                          </button>
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            )}
          </Table>
        </div>
        {/* Footer Section with pagination */}
        <TableFooter
          currentPage={currentPage}
          total={total}
          // pageSize={PAGINATION_CONFIG.DEFAULT_PAGE_SIZE}
          onPageChange={handlePageChange}
        />
      </div>

      <CreateCustomerModal
        isOpen={isCreateModalOpen}
        onClose={handleModalClose}
        onSuccess={handleCreateSuccess}
        editData={selectedCustomer}
      />
    </>
  );
}
