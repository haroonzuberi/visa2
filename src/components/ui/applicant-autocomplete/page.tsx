"use client";
import { useState, useEffect, useRef } from "react";
import { getApiWithAuth } from "@/utils/api";
import { Plus } from "lucide-react";
import InputField from "../input/input";
import { Field } from "formik";
import styles from "./styles.module.css";

interface Applicant {
  id: number;
  name: string;
  email: string;
  phone: string;
}

interface ApplicantAutocompleteProps {
  name: string;
  value: string;
  applicantId: number | null;
  customerId: number | null;
  onChange: (name: string, id: number | null) => void;
  error?: any;
  touched?: any;
}

export default function ApplicantAutocomplete({
  name,
  value,
  applicantId,
  customerId,
  onChange,
  error,
  touched,
}: ApplicantAutocompleteProps) {
  const [searchTerm, setSearchTerm] = useState(value);
  const [suggestions, setSuggestions] = useState<Applicant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Handle click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!searchTerm || !customerId) {
        setSuggestions([]);
        return;
      }

      try {
        setIsLoading(true);
        const response: any = await getApiWithAuth(
          `applicants/?search=${searchTerm}&customer_id=${customerId}`
        );
        if (response.success) {
          setSuggestions(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching applicants:", error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm, customerId]);

  const handleSelectApplicant = (applicant: Applicant) => {
    setSearchTerm(applicant.name);
    onChange(applicant.name, applicant.id);
    setShowSuggestions(false);
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <label className={styles.label}>Applicant</label>
      <div className={styles.inputWrapper}>
        <input
          type="text"
          value={searchTerm}
          name={name}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setShowSuggestions(true);
            // setIsSelected(false);
            if (!e.target.value) {
              onChange("", null);
            }
          }}
          onFocus={() => setShowSuggestions(true)}
          placeholder="Search Applicant..."
          className={styles.input}
        />
        {isLoading && <div className={styles.loader}></div>}
      </div>

      {showSuggestions && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
          {suggestions.length > 0 ? (
            <ul className="py-1">
              {suggestions.map((applicant) => (
                <li
                  key={applicant.id}
                  onClick={() => handleSelectApplicant(applicant)}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  <div className="flex flex-col">
                    <span className="text-[14px] text-gray-900">
                      {applicant.name}
                    </span>
                    <span className="text-[12px] text-gray-500">
                      {applicant.email} • {applicant.phone}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-3 text-gray-500">No applicants found</div>
          )}
        </div>
      )}
      {touched && error && <span className={styles.error}>{error}</span>}
    </div>
  );
}
