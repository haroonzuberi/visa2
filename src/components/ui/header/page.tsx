"use client";
import React, { useState, useEffect } from "react";
import "./styles.modules.css";
import './../../../app/globals.css';
import FlagSvg from "@/Assets/svgs/FlagSvg";
import PlusSvg from "@/Assets/svgs/PlusSvg";
import DropdownSVG from "@/Assets/svgs/DropdownSVG";
import ProfileImage from "../../../Assets/Images/generic-profile.png";
import Image from "next/image";
import SearchSvg from "@/Assets/svgs/SearchSvg";
import { useAppDispatch, useAppSelector } from "@/store";
import { toast } from "react-toastify";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { getCurrentUser, logout } from "@/store/slices/authSlice";
import NotificationPopover from "../notificationPopover/page";
import NotificationModal from "@/components/modals/NotificationsModal/page";

const Header = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const isModalOpen = searchParams.get("modal") === "seeMore";
  const closeModal = () => {
    console.log("Close Modal Function Working In Header Component");
    router.push(pathname, { scroll: false });
  };
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useAppDispatch();
  const { user, isLoading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getCurrentUser());
  }, [dispatch]);

  const handleLogout = () => {
    try {
      dispatch(logout());
      toast.success("Logged out successfully");
      router.push("/auth/login");
    } catch (error: any) {
      toast.error("Logout failed");
    }
    setIsOpen(false);
  };

  return (
    <div className="header-container">
      <div className="header-content">
        {/* Search Input */}
        <div className="search-container">
          <div className="search-icon">
            <SearchSvg />
          </div>
          <input type="text" className="input-search" placeholder="Search..." />
        </div>

        {/* Right Section */}
        <div className="right-section">
          <div className="icons-group flex items-center space-x-4">
            {/* Notification Popover */}
            <NotificationPopover />
            {isModalOpen && <NotificationModal closeModal={closeModal} />}
            {/* Other Icons */}
            <FlagSvg />
            <div className="plus-icon">
              <PlusSvg />
            </div>
            <div className="divider hidden sm:block"></div>
          </div>

          {/* Profile Dropdown */}
          <div className="relative">
            <div className="profile-section" onClick={() => setIsOpen(!isOpen)}>
              <div className="profile-image">
                <Image src={ProfileImage} alt="Profile" />
              </div>
              <div className="profile-info hidden sm:block">
                <p className="profile-name">{user?.name || "Loading..."}</p>
                <p className="profile-role">{user?.role || "User"}</p>
              </div>
              <DropdownSVG />
            </div>

            {isOpen && (
              <div className="dropdown-menu">
                <ul>
                  <li className="dropdown-item">Profile</li>
                  <li className="dropdown-item">Settings</li>
                  <li className="dropdown-item" onClick={handleLogout}>
                    Logout
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
