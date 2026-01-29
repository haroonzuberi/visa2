"use client";
import React from "react";
import styles from "./styles.module.css";
import SearchSvg from "@/Assets/svgs/SearchSvg";
import { Button } from "@/components/ui/button";
import FilterIconSvg from "@/Assets/svgs/FilterIconSvg";
import { useTranslation } from "react-i18next";

interface TableHeaderProps {
  header?: string;
  search?: boolean;
  searchQuery?: string;
  onSearchChange?: (value: string) => void;
  showFilters?: boolean;
  showSeeMore?: boolean;
}

const TableHeaderPage = ({ 
  header = "", 
  search = false,
  searchQuery = "",
  onSearchChange,
  showFilters = false,
  showSeeMore = false,
}: TableHeaderProps) => {
  const { t } = useTranslation();
  return (
    <>
      <div className="flex  flex-col-reverse justify-center sm:flex-row  items-center sm:justify-between p-[10px] sm:p-4">
        <div className="bg-white rounded-xl pt-[4px] sm:pt-0 ">
          <h2 className={styles.userListText}>{header}</h2>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-xl flex  flex-col-reverse justify-center sm:flex-row sm:justify-between items-center space-x-2 w-full sm:w-auto">
          {search && (
            <div className="search-container">
              <div className="search-icon">
                <SearchSvg />
              </div>
              <input
                className={`input-search ${styles.inputField}`}
                placeholder={t("searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => onSearchChange?.(e.target.value)}
              />
            </div>
          )}

         
        </div>
      </div>
      <hr />
    </>
  );
};

export default TableHeaderPage;
