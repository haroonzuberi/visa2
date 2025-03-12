"use client";
import { useState, useEffect } from "react";
import { getApiWithAuth } from "@/utils/api";
import styles from "./styles.module.css";

interface Customer {
  id: number;
  name: string;
  email: string;
}

interface CustomerAutocompleteProps {
  value: string;
  customerId: number | null;
  onChange: (value: string, customerId: number | null) => void;
  error?: any;
  touched?: any;
}

export default function CustomerAutocomplete({
  value,
  customerId,
  onChange,
  error,
  touched,
}: CustomerAutocompleteProps) {
  const [searchTerm, setSearchTerm] = useState(value);
  const [suggestions, setSuggestions] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSelected, setIsSelected] = useState(false);

  // Fetch initial customer data when customerId is available
  useEffect(() => {
    const fetchCustomerById = async () => {
      if (customerId && !value) {
        setIsLoading(true);
        try {
          const response: any = await getApiWithAuth(`customers/${customerId}`);
          if (response.success && response.data) {
            setSearchTerm(response.data.data.name);
            setIsSelected(true);
            // onChange(response.data.name, response.data.id);
          }
        } catch (error) {
          console.error("Error fetching customer:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchCustomerById();
  }, []);

  useEffect(() => {
    const fetchCustomers = async () => {
      if (searchTerm.length < 1 || isSelected) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        const response: any = await getApiWithAuth(
          `customers/?search=${searchTerm}`
        );
        if (response.success) {
          setSuggestions(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching customers:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchCustomers, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm, isSelected]);

  const handleSelectCustomer = (customer: Customer) => {
    setSearchTerm(customer.name);
    onChange(customer.name, customer.id);
    setSuggestions([]);
    setShowSuggestions(false);
    setIsSelected(true);
  };

  return (
    <div className={styles.autocompleteWrapper}>
      <label className={styles.label}>Customer</label>
      <div className={styles.inputWrapper}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setShowSuggestions(true);
            setIsSelected(false);
            if (!e.target.value) {
              onChange("", null);
            }
          }}
          onFocus={() => setShowSuggestions(true)}
          placeholder="Search customer..."
          className={styles.input}
        />
        {isLoading && <div className={styles.loader}></div>}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <ul className={styles.suggestionsList}>
          {suggestions.map((customer) => (
            <li
              key={customer.id}
              onClick={() => handleSelectCustomer(customer)}
              className={styles.suggestionItem}
            >
              <div className={styles.customerInfo}>
                <span className={styles.customerName}>{customer.name}</span>
                <span className={styles.customerEmail}>{customer.email}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
      {touched && error && <span className={styles.error}>{error}</span>}
    </div>
  );
}