"use client";
import { useState, useEffect, ReactElement } from "react";
import styles from "./styles.module.css";
import IndiaFlag from "@/Assets/svgs/IndiaFlag";
import { ChevronDown, ChevronUp } from "lucide-react";
import { getApiWithAuth, putAPIWithAuth } from "@/utils/api";
import { toast } from "react-toastify";
import { Check, X, Plus, Trash2 } from "lucide-react";

interface Country {
  name: string;
  code: string;
}

export default function Configurations() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [isLoadingCountries, setIsLoadingCountries] = useState(true);
  const [configurationData, setConfigurationData] = useState<any>(null);
  const [originalApiData, setOriginalApiData] = useState<any>(null); // Store original API format
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null); // Track which field is being edited (path like "step_01_registration.nationality_region")
  const [editingValues, setEditingValues] = useState<string[]>([]); // Array of values for multi-input support
  const [isSaving, setIsSaving] = useState(false);
  const [accordionState, setAccordionState] = useState<Record<string, boolean>>({
    "step_01_registration": true,
    "step_02_applicant_details": true,
    "step_03_address_details": true,
    "step_04_visa_details": true,
  });

  // Fetch countries from API
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setIsLoadingCountries(true);
        const response: any = await getApiWithAuth("visa-default-values/");
        
        if (response.success && response.data?.data?.countries) {
          const countriesList = response.data.data.countries.map((country: string) => ({
            name: country.charAt(0).toUpperCase() + country.slice(1).toLowerCase(),
            code: country.toLowerCase(),
          }));
          setCountries(countriesList);
          
          // Set default selection to "india" if available, otherwise first country
          const defaultCountry = countriesList.find((c: Country) => c.code === "india") || countriesList[0];
          if (defaultCountry) {
            setSelectedCountry(defaultCountry.code);
          }
        } else {
          toast.error("Failed to load countries");
        }
      } catch (error: any) {
        console.error("Error fetching countries:", error);
        toast.error("Failed to load countries");
      } finally {
        setIsLoadingCountries(false);
      }
    };

    fetchCountries();
  }, []);

  // Fetch default values for selected country
  useEffect(() => {
    const fetchDefaultValues = async () => {
      if (!selectedCountry) return;

      try {
        setIsLoadingData(true);
        const response: any = await getApiWithAuth(`visa-default-values/${selectedCountry}`);
        
        if (response.success && response.data?.data?.default_value) {
          const apiData = response.data.data.default_value;
          setOriginalApiData(JSON.parse(JSON.stringify(apiData))); // Deep copy
          const transformedData = transformApiDataToDisplayFormat(apiData);
          setConfigurationData(transformedData);
        } else {
          toast.error("Failed to load default values");
          setConfigurationData(null);
        }
      } catch (error: any) {
        console.error("Error fetching default values:", error);
        toast.error("Failed to load default values");
        setConfigurationData(null);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchDefaultValues();
  }, [selectedCountry]);

  // Transform snake_case to Title Case
  const snakeToTitleCase = (str: string): string => {
    return str
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  // Transform Title Case back to snake_case
  const titleCaseToSnake = (str: string): string => {
    return str
      .split(" ")
      .map((word) => word.toLowerCase())
      .join("_");
  };

  // Transform API response structure to display format
  const transformApiDataToDisplayFormat = (apiData: any): any => {
    const transformed: any = {};

    Object.entries(apiData).forEach(([sectionKey, sectionValue]: [string, any]) => {
      if (typeof sectionValue === "object" && sectionValue !== null) {
        transformed[sectionKey] = {};
        
        Object.entries(sectionValue).forEach(([fieldKey, fieldValue]: [string, any]) => {
          const displayKey = snakeToTitleCase(fieldKey);
          
          if (typeof fieldValue === "object" && fieldValue !== null && !Array.isArray(fieldValue)) {
            // Nested object (e.g., passport_details, family_details)
            transformed[sectionKey][displayKey] = {};
            Object.entries(fieldValue).forEach(([nestedKey, nestedValue]: [string, any]) => {
              const nestedDisplayKey = snakeToTitleCase(nestedKey);
              transformed[sectionKey][displayKey][nestedDisplayKey] = nestedValue || "N/A";
            });
          } else {
            transformed[sectionKey][displayKey] = fieldValue || "N/A";
          }
        });
      }
    });

    return transformed;
  };

  const toggleAccordion = (sectionKey: string) => {
    setAccordionState((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
  };

  // Get country flag component or emoji
  const getCountryFlag = (countryCode: string): ReactElement | string => {
    const flagMap: Record<string, ReactElement | string> = {
      india: <IndiaFlag className="w-5 h-5" />,
      vietnam: "🇻🇳",
    };
    return flagMap[countryCode] || "🌍";
  };

  const formatSectionTitle = (key: string): string => {
    const titles: Record<string, string> = {
      step_01_registration: "Step 01 Registration",
      step_02_applicant_details: "Step 02 Applicant Details",
      step_03_address_details: "Step 03 Address Details",
      step_04_visa_details: "Step 04 Visa Details",
    };
    return titles[key] || key;
  };

  const formatFieldName = (key: string): string => {
    return key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase());
  };

  // Get the API path for a field (e.g., "step_01_registration.nationality_region")
  const getFieldApiPath = (sectionKey: string, displayFieldKey: string, parentPath?: string): string => {
    const snakeKey = titleCaseToSnake(displayFieldKey);
    if (parentPath) {
      return `${parentPath}.${snakeKey}`;
    }
    return `${sectionKey}.${snakeKey}`;
  };

  // Update value in original API data structure
  const updateApiDataValue = (path: string, value: string) => {
    if (!originalApiData) return;

    const pathParts = path.split(".");
    const updatedData = JSON.parse(JSON.stringify(originalApiData)); // Deep copy

    let current = updatedData;
    for (let i = 0; i < pathParts.length - 1; i++) {
      if (!current[pathParts[i]]) {
        current[pathParts[i]] = {};
      }
      current = current[pathParts[i]];
    }
    current[pathParts[pathParts.length - 1]] = value;

    setOriginalApiData(updatedData);
    return updatedData;
  };

  // Save updated default values to API
  const saveDefaultValues = async () => {
    if (!originalApiData || !selectedCountry) return;

    try {
      setIsSaving(true);
      const response: any = await putAPIWithAuth(`visa-default-values/${selectedCountry}`, {
        default_value: originalApiData,
      });

      if (response.success) {
        toast.success("Default values updated successfully");
        // Refresh the display data
        const transformedData = transformApiDataToDisplayFormat(originalApiData);
        setConfigurationData(transformedData);
      } else {
        toast.error(response.data?.message || "Failed to update default values");
      }
    } catch (error: any) {
      console.error("Error saving default values:", error);
      toast.error("Failed to update default values");
    } finally {
      setIsSaving(false);
      setEditingField(null);
    }
  };

  // Start editing a field
  const startEditing = (sectionKey: string, displayFieldKey: string, currentValue: string, parentPath?: string) => {
    const apiPath = getFieldApiPath(sectionKey, displayFieldKey, parentPath);
    setEditingField(apiPath);
    // Split by \n to support multiple values, or start with one empty input
    const valueStr = currentValue === "N/A" ? "" : String(currentValue);
    const values = valueStr ? valueStr.split("\n").filter(v => v.trim() !== "") : [""];
    setEditingValues(values.length > 0 ? values : [""]);
  };

  // Cancel editing - reload original data to revert changes
  const cancelEditing = async () => {
    setEditingField(null);
    setEditingValues([]);
    
    // Reload original data from API to revert any unsaved changes
    if (selectedCountry) {
      try {
        const response: any = await getApiWithAuth(`visa-default-values/${selectedCountry}`);
        if (response.success && response.data?.data?.default_value) {
          const apiData = response.data.data.default_value;
          setOriginalApiData(JSON.parse(JSON.stringify(apiData)));
          const transformedData = transformApiDataToDisplayFormat(apiData);
          setConfigurationData(transformedData);
        }
      } catch (error) {
        console.error("Error reloading data:", error);
      }
    }
  };

  // Add a new input field
  const addInputField = () => {
    setEditingValues([...editingValues, ""]);
  };

  // Remove an input field
  const removeInputField = (index: number) => {
    if (editingValues.length > 1) {
      const newValues = editingValues.filter((_, i) => i !== index);
      setEditingValues(newValues);
      // Update API data immediately
      const apiPath = editingField;
      if (apiPath && originalApiData) {
        const valueToSave = newValues.join("\n");
        updateApiDataValue(apiPath, valueToSave);
      }
    }
  };

  // Update a specific input value
  const updateInputValue = (index: number, value: string, sectionKey: string, displayFieldKey: string, parentPath?: string) => {
    const newValues = [...editingValues];
    newValues[index] = value;
    setEditingValues(newValues);
    
    // Update API data immediately
    const apiPath = getFieldApiPath(sectionKey, displayFieldKey, parentPath);
    const valueToSave = newValues.join("\n");
    const updatedData = updateApiDataValue(apiPath, valueToSave);
    
    // Update display data immediately for real-time feedback
    if (updatedData) {
      const transformedData = transformApiDataToDisplayFormat(updatedData);
      setConfigurationData(transformedData);
    }
  };

  // Handle save - convert array to \n separated string
  const prepareValueForSave = (): string => {
    return editingValues.filter(v => v.trim() !== "").join("\n");
  };

  // Handle save on blur or enter
  const handleSave = async () => {
    if (editingField) {
      // Update the API data with the joined values before saving
      const valueToSave = prepareValueForSave();
      updateApiDataValue(editingField, valueToSave);
      await saveDefaultValues();
    }
  };

  const renderField = (
    sectionKey: string,
    fieldKey: string,
    fieldValue: any,
    level: number = 0,
    parentPath?: string
  ): ReactElement => {
    if (typeof fieldValue === "object" && fieldValue !== null && !Array.isArray(fieldValue)) {
      // Nested object - render as sub-section with bold heading
      const nestedParentPath = parentPath 
        ? `${parentPath}.${titleCaseToSnake(fieldKey)}`
        : `${sectionKey}.${titleCaseToSnake(fieldKey)}`;
      
      return (
        <div className={`flex flex-col gap-4 ${level > 0 ? "mt-2" : ""}`}>
          <p className="text-[14px] font-[600] text-[#24282E] mb-1">{fieldKey}</p>
          {Object.entries(fieldValue).map(([subKey, subValue]) => (
            <div key={subKey}>
              {renderField(sectionKey, subKey, subValue, level + 1, nestedParentPath)}
            </div>
          ))}
        </div>
      );
    }

    const apiPath = getFieldApiPath(sectionKey, fieldKey, parentPath);
    const isEditing = editingField === apiPath;
    const displayValue = fieldValue === "N/A" ? "" : String(fieldValue);
    // Check if value contains newlines (multiple values)
    const hasMultipleValues = displayValue.includes("\n");

    return (
      <div className="flex flex-col gap-1">
        <p className="text-[14px] font-[600] text-[#24282E]">
          {fieldKey}
        </p>
        {isEditing ? (
          <div className="flex flex-col gap-2">
            {editingValues.map((value, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={value}
                  onChange={(e) => updateInputValue(index, e.target.value, sectionKey, fieldKey, parentPath)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && e.ctrlKey) {
                      // Ctrl+Enter to save
                      handleSave();
                    } else if (e.key === "Escape") {
                      cancelEditing();
                    }
                  }}
                  className="flex-1 px-3 py-2 border border-[#42DA82] rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#42DA82]/20 text-[14px] text-[#24282E]"
                  autoFocus={index === 0}
                  disabled={isSaving}
                  placeholder={`Option ${index + 1}`}
                />
                {index === editingValues.length - 1 ? (
                  <button
                    type="button"
                    onClick={addInputField}
                    className="p-1.5 hover:bg-[#42DA82]/10 rounded transition-all border border-[#42DA82]"
                    title="Add another option"
                  >
                    <Plus className="w-4 h-4 text-[#42DA82]" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => removeInputField(index)}
                    className="p-1.5 hover:bg-red-100 rounded transition-all border border-red-300"
                    title="Remove this option"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                )}
              </div>
            ))}
            <div className="flex items-center gap-1 mt-1">
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-[#42DA82] border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleSave}
                    className="p-1 hover:bg-[#42DA82]/10 rounded transition-all"
                    title="Save"
                  >
                    <Check className="w-4 h-4 text-[#42DA82]" />
                  </button>
                  <button
                    type="button"
                    onClick={cancelEditing}
                    className="p-1 hover:bg-red-100 rounded transition-all"
                    title="Cancel"
                  >
                    <X className="w-4 h-4 text-red-500" />
                  </button>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <p className="text-[14px] font-[400] text-[#727A90]">
              {hasMultipleValues ? (
                <span className="flex flex-col gap-1">
                  {displayValue.split("\n").map((line, idx) => (
                    <span key={idx}>{line || "N/A"}</span>
                  ))}
                </span>
              ) : (
                displayValue || "N/A"
              )}
            </p>
            <button
              type="button"
              onClick={() => startEditing(sectionKey, fieldKey, displayValue, parentPath)}
              className="p-1 hover:bg-[#42DA82]/10 rounded transition-all ml-1"
              title="Edit"
            >
              <svg className="w-4 h-4 text-[#727A90]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="mt-3">
        <h1 className={styles.header}>Configurations</h1>
      </div>

      <div className="bg-white rounded-xl p-6 mt-4">
        <h2 className="text-[20px] font-[600] text-[#24282E] mb-6">Extracted Visa Data</h2>
        
        {/* Country Selector Section */}
        <div className="mb-6">
          <label className="block text-[14px] font-[500] text-[#24282E] mb-3">
            Select Country
          </label>
          {isLoadingCountries ? (
            <div className="flex items-center gap-2 text-[14px] text-[#727A90]">
              <div className="w-4 h-4 border-2 border-[#42DA82] border-t-transparent rounded-full animate-spin"></div>
              Loading countries...
            </div>
          ) : countries.length > 0 ? (
            <div className="flex gap-4 flex-wrap">
              {countries.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => setSelectedCountry(country.code)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-[10px] border transition-all ${
                    selectedCountry === country.code
                      ? "border-[#42DA82] bg-[#42DA8210]"
                      : "border-[#E9EAEA] bg-white hover:border-[#42DA82]"
                  }`}
                >
                  {typeof getCountryFlag(country.code) === "string" ? (
                    <span className="text-[20px]">{getCountryFlag(country.code) as string}</span>
                  ) : (
                    getCountryFlag(country.code) as ReactElement
                  )}
                  <span className="text-[14px] font-[500] text-[#24282E]">{country.name}</span>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-[14px] text-[#727A90]">No countries available</p>
          )}
        </div>

        {/* Accordions Section */}
        {isLoadingData ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex flex-col items-center gap-4">
              <div className="w-8 h-8 border-4 border-[#42DA82] border-t-transparent rounded-full animate-spin"></div>
              <span className="text-[14px] text-[#727A90]">Loading default values...</span>
            </div>
          </div>
        ) : configurationData && Object.keys(configurationData).length > 0 ? (
          <div className="flex flex-col gap-3">
            {Object.entries(configurationData).map(([sectionKey, sectionData]) => {
              const isOpen = accordionState[sectionKey] ?? false;
              return (
                <div
                  key={sectionKey}
                  className="border border-[#E9EAEA] rounded-[12px] overflow-hidden bg-white shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() => toggleAccordion(sectionKey)}
                    className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#42DA8210] transition-colors"
                  >
                    <span className="text-[16px] font-[600] text-[#24282E]">
                      {formatSectionTitle(sectionKey)}
                    </span>
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 text-[#24282E]" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-[#24282E]" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-5 py-4 flex flex-col gap-4 border-t border-[#E9EAEA]">
                      {Object.entries(sectionData as any).map(([fieldKey, fieldValue]) => (
                        <div key={fieldKey}>
                          {renderField(sectionKey, fieldKey, fieldValue)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : selectedCountry ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-[14px] text-[#727A90]">No default values available for this country</p>
          </div>
        ) : (
          <div className="flex items-center justify-center py-8">
            <p className="text-[14px] text-[#727A90]">Please select a country to view default values</p>
          </div>
        )}
      </div>
    </>
  );
}
