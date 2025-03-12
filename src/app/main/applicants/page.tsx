"use client";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
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
import TimeSvg from "@/Assets/svgs/TimeSvg";
import DropdownSVG from "@/Assets/svgs/DropdownSVG";
import TrashSvg from "@/Assets/svgs/TrashSvg";
import UserSvg from "@/Assets/svgs/UserSvg";
import EditSvg from "@/Assets/svgs/EditSvg";
import DownloadSvg from "@/Assets/svgs/DownloadSvg";
import GeneralData from "../../../components/ui/tableheader/page";
import TableFooter from "../../../components/ui/tablefooter/page";
import { toast } from "react-toastify";
import ConfirmDialog from "@/components/ui/confirmDialogue/confirmDialogu";
import {
  deleteUser,
  fetchUsers,
  setCurrentPage,
} from "@/store/slices/usersSlice";
import { PAGINATION_CONFIG } from "@/config/pagination";
import CreateUserModal from "@/components/modals/CreateUserModal/page";

export default function ApplicantsTable() {
  const dispatch = useAppDispatch();
  const { users, isLoading, error, currentPage, total } = useAppSelector(
    (state) => state.users
  );

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  useEffect(() => {
    const skip = (currentPage - 1) * PAGINATION_CONFIG.DEFAULT_PAGE_SIZE;
    // if (error) {
    //   return;
    // }
    dispatch(fetchUsers({ skip, search: searchQuery }));
  }, [currentPage, searchQuery]);

  // useEffect(() => {
  //   if (searchQuery.trim() === "") {
  //     setFilteredUsers(users);
  //   } else {
  //     const filtered = users.filter((user) =>
  //       Object.values(user).some((value) =>
  //         String(value).toLowerCase().includes(searchQuery.toLowerCase())
  //       )
  //     );
  //     setFilteredUsers(filtered);
  //   }
  // }, [users, searchQuery]);

  const handlePageChange = (page: number) => {
    const totalPages = Math.ceil(total / PAGINATION_CONFIG.DEFAULT_PAGE_SIZE);
    if (page >= 1 && page <= totalPages) {
      dispatch(setCurrentPage(page));
    }
  };
  const handleDeleteClick = (user: any) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (userToDelete) {
      try {
        // We'll implement this action in usersSlice
        await dispatch(deleteUser(userToDelete.id));
        // Refresh the users list
        // dispatch(fetchUsers({ skip: (currentPage - 1) * limit, limit }));
      } catch (error: any) {
        toast.error(error.message || "Failed to delete user");
      }
    }
    setIsDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  const handleCreateSuccess = () => {
    // Refresh the users list
    handleModalClose()
    // const skip = (currentPage - 1) * PAGINATION_CONFIG.DEFAULT_PAGE_SIZE;
    // dispatch(fetchUsers({ skip, search: searchQuery }));
  };

  const handleEditClick = (user: any) => {
    setSelectedUser(user);
    setIsCreateModalOpen(true);
  };

  const handleModalClose = () => {
    setIsCreateModalOpen(false);
    setSelectedUser(null);
  };

  // Helper functions
  function getRoleColor(role: string) {
    if (role) {
      switch (role.toLowerCase()) {
        case "admin":
          return styles.roleBtnRed;
        case "user":
          return styles.roleBtnBlue;
        default:
          return styles.roleBtnGreen;
      }
    }
    return styles.roleBtnGreen;
  }

  function getLastLoginTime(lastLogin: string) {
    if (!lastLogin) return "Never";
    const date = new Date(lastLogin);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 24) {
      return `${hours}hr ago`;
    }
    return `${Math.floor(hours / 24)}d ago`;
  }

  const LoadingSkeleton = () =>
    [...Array(PAGINATION_CONFIG.DEFAULT_PAGE_SIZE)].map((_, index) => (
      <TableRow key={index}>
        <TableCell>
          <div className="flex flex-col gap-2">
            <div className="h-4 w-24 bg-gray-200 rounded"></div>
            <div className="h-3 w-32 bg-gray-100 rounded"></div>
          </div>
        </TableCell>
        <TableCell>
          <div className="h-4 w-24 bg-gray-200 rounded "></div>
        </TableCell>
        <TableCell>
          <div className="h-4 w-28 bg-gray-200 rounded "></div>
        </TableCell>
        <TableCell>
          <div className="h-6 w-16 bg-gray-200 rounded-full "></div>
        </TableCell>
        <TableCell>
          <div className="h-4 w-16 bg-gray-200 rounded"></div>
        </TableCell>
        <TableCell>
          <div className="flex gap-2">
            <div className="h-8 w-8 bg-gray-200 rounded"></div>
            <div className="h-8 w-8 bg-gray-200 rounded"></div>
          </div>
        </TableCell>
      </TableRow>
    ));

  const NoDataRow = () => (
    <TableRow>
      <TableCell colSpan={6} className="text-center py-6">
        <p className="text-sm font-medium text-gray-400">No data found</p>
      </TableCell>
    </TableRow>
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
        {/* Header */}
        <GeneralData
          search={true}
          header="Applicants List"
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        {/* User Table */}
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
              ) : users.length === 0 ? (
                <NoDataRow />
              ) : (
                users.map((user, index) => (
                  <TableRow key={user.id || index} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className={tableStyles.userName}>
                          {user.name}
                        </span>
                        <span className={tableStyles.userEmail}>
                          {user.email}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className={` ${tableStyles.userName}`}>
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className={` ${tableStyles.userName}`}>
                      {user.phone || "N/A"}
                    </TableCell>
                    
                    <TableCell className={tableStyles.tableHeaders}>
                      {getLastLoginTime(user.last_login)}
                    </TableCell>
                    <TableCell className="">
                      <span className="flex align-center gap-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger>
                            <DropdownSVG className="cursor-pointer" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className={styles.dropdownItem}>
                            <DropdownMenuItem className="flex items-center p-4">
                              <UserSvg color="#727A90" className="w-4 h-4" />
                              <span className={styles.dropdownText}>
                                Change Account Type
                              </span>
                            </DropdownMenuItem>
                            <hr />
                            <DropdownMenuItem 
                              className="flex items-center p-4"
                              onClick={() => handleEditClick(user)}
                            >
                              <EditSvg className="w-4 h-4" />
                              <span className={styles.dropdownText}>Edit</span>
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
                        <TrashSvg
                          className="cursor-pointer"
                          onClick={() => handleDeleteClick(user)}
                        />
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        {/* Footer Section */}
        <TableFooter
          total={total}
          currentPage={currentPage}
          onPageChange={handlePageChange}
        />
      </div>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        setIsOpen={setIsDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        title="Delete User"
        description={`Are you sure you want to delete ${userToDelete?.name}? This action cannot be undone.`}
        triggerText={""}
      />

      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={handleModalClose}
        onSuccess={handleCreateSuccess}
        editData={selectedUser}
      />
    </>
  );
}
