"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Sidebar from "../../components/ui/sidebar/page";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import LeftIcon from "@/Assets/svgs/LeftIcon";
import Header from "../../components/ui/header/page";
import { toggleSidebar } from "@/store/slices/sidebarSlice";
import { useEffect } from "react";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isOpen } = useAppSelector((state) => state.sidebar);
  const dispatch = useAppDispatch();

  useEffect(() => {}, []);

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-gray-50">
        {/* Sidebar Section */}
        <div
          className={`${
            isOpen ? "w-64" : "w-0"
          } transition-all duration-300 ease-in-out border-r border-[#E9EAEA] bg-white`}
        >
          <div className={`${isOpen ? "block" : "hidden"}`}>
            <Sidebar />
          </div>
        </div>

        {/* Main Content Section */}
        <div className="flex-1 w-full md:min-w-0 bg-white transition-all duration-300 ease-in-out">
          <div
            className={`${
              isOpen ? "" : "mx-[10px]"
            } bg-white h-[100vh] border-t border-[#E9EAEA] rounded-tl-[30px]`}
          >
            {/* Header */}
            <div className="border-b border-[#E9EAEA] px-[10px] flex items-center h-[76.76px] sticky top-0 bg-white">
              {!isOpen && (
                <div
                  className="mr-[20px] cursor-pointer"
                  onClick={() => dispatch(toggleSidebar())}
                >
                  <div className="transition-transform duration-300 rotate-180">
                    <LeftIcon />
                  </div>
                </div>
              )}
              <div className="w-full">
                <Header />
              </div>
            </div>

            {/* Page Content */}
            <div className="px-[20px] pt-[10px]">{children}</div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
