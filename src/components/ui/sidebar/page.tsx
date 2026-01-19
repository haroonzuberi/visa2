"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import VisaLogo from "../../../Assets/Images/LoginLogo.png";
import './../../../app/globals.css';
import { usePathname, useRouter } from "next/navigation";
import LeftIcon from "@/Assets/svgs/LeftIcon";
import styles from "./sidebar.module.css";
import CustomerListIcon from "@/Assets/svgs/CustomerListIcon";
import UserIcon from "@/Assets/svgs/UsersIcon";
import DashboardIcon from "@/Assets/svgs/Dashboard";
import KanbanSvg from "@/Assets/svgs/KanbanSvg";
import VisaSvg from "@/Assets/svgs/VisaSvg";
import ApplicationSidebar from "@/Assets/svgs/ApplicationSidebar";
import SettingsSvg from "@/Assets/svgs/SettingsSvg";
import AnalyticsSvg from "@/Assets/svgs/AnalyticsSvg";
import RefundedSvg from "@/Assets/svgs/RefundedSvg";
import { setSidebarOpen, toggleSidebar } from "@/store/slices/sidebarSlice";
import { useTranslation } from "react-i18next";
import i18n from 'i18next';

const menuItems = [
  {
    name: "Dashboard",
    icon: DashboardIcon,
    path: "/main/dashboard",
  },
  {
    name: "Manage Users",
    icon: UserIcon,
    path: "/main/users",
  },
  {
    name: "Customers List",
    icon: CustomerListIcon,
    path: "/main/customers",
  },
  {
    name: "Applicant List",
    icon: CustomerListIcon,
    path: "/main/applicants",
  },
  {
    name: "Applications List", // Fixed typo
    icon: ApplicationSidebar,
    path: "/main/applications",
  },
  {
    name: "Settings",
    icon: SettingsSvg,
    path: "/main/settings",
  },
  {
    name: "Visa Forms",
    icon: VisaSvg,
    path: "/main/forms",
  },
  {
    name: "Kanban Board",
    icon: KanbanSvg,
    path: "/main/kanban",
  },
  {
    name: "Analytics",
    icon: AnalyticsSvg,
    path: "/main/analytics",
  },
  {
    name: "Refunds Requests",
    icon: RefundedSvg,
    path: "/main/refunds",
  },
];

const Sidebar = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isOpen } = useAppSelector((state) => state.sidebar);
  const pathname = usePathname();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const { t } = useTranslation(); // Add useTranslation hook

  useEffect(() => {
    const handleResize = () => {
      dispatch(setSidebarOpen(window?.innerWidth >= 858));
    };

    handleResize();
    window?.addEventListener("resize", handleResize);
    return () => window?.removeEventListener("resize", handleResize);
  }, [dispatch]);

  const navigateWithSidebarToggle = (path: string) => {
    return new Promise<void>((resolve, reject) => {
      try {
        // Here you can add any conditions or logic that needs to succeed before toggling the sidebar.
        router.push(path); // Navigate to the new path
        resolve(); // Resolve the promise successfully
      } catch (error) {
        reject(error); // Reject the promise in case of an error
      }
    })
    .then(() => {
      // Once the navigation is successful, toggle the sidebar
      if (window.innerWidth < 640) {
        dispatch(toggleSidebar()); // Close the sidebar if width < 640px
      }
        })
    .catch((error) => {
      console.error("Error navigating to path:", error);
    });
  };

  const handleItemClick = (path: string) => {
    // Call the promise-based function
    navigateWithSidebarToggle(path);
  };


  return (
    <>
      <aside
        className={`h-[100%] ${styles.sidebar} ${
          !isOpen ? styles.sidebarClosed : styles.sidebarOpen
        }`}
      >
        <div className={styles.header}>
          <Image src={VisaLogo} alt="Visa Logo" width={89} height={53} />
          <div
            className={styles.toggleButton}
            onClick={() => dispatch(toggleSidebar())}
          >
            <LeftIcon />
          </div>
        </div>

        <div className={styles.content}>
          <ul className={styles.menuList}>
            <li>
              <div className={styles.menuHeader}>
                <span className={styles.menuTitle}>{t("mainMenu")}</span>
              </div>
            </li>

            {menuItems.map((item, index) => {
              const isActive = pathname === item.path;
              const isHovered = hoveredItem === item.path;
              const IconComponent = item.icon;

              return (
                <li key={index}>
                  <a
                    onClick={() => handleItemClick(item.path)} // Use the new function here
                    className={`cursor-pointer ${styles.menuItem} ${
                      isActive ? styles.menuItemActive : styles.menuItemInactive
                    }`}
                    onMouseEnter={() => setHoveredItem(item.path)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <div>
                      <IconComponent
                        color={isActive || isHovered ? "#42DA82" : "#727A90"}
                      />
                    </div>
                    <span className={styles.menuText}>{t(item.name)}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </aside>

      {isOpen && (
        <div
          className={styles.overlay}
          onClick={() => dispatch(toggleSidebar())}
        />
      )}
    </>
  );
};

export default Sidebar;
