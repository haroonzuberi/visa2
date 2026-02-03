"use client";
import { useState, useEffect, ReactElement } from "react";
import styles from "./styles.module.css";
import IndiaFlag from "@/Assets/svgs/IndiaFlag";
import { ChevronDown, ChevronUp } from "lucide-react";
import { getApiWithAuth, putAPIWithAuth } from "@/utils/api";
import { toast } from "react-toastify";
import { Check, X, Plus, Trash2, Star } from "lucide-react";

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
  const [defaultIndex, setDefaultIndex] = useState<number | null>(null); // Track which index is the default value (null means no default)
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
      // Skip _defaults key - it's metadata, not display data
      if (sectionKey === "_defaults") return;
      
      if (typeof sectionValue === "object" && sectionValue !== null) {
        transformed[sectionKey] = {};
        
        Object.entries(sectionValue).forEach(([fieldKey, fieldValue]: [string, any]) => {
          const displayKey = snakeToTitleCase(fieldKey);
          
          if (typeof fieldValue === "object" && fieldValue !== null && !Array.isArray(fieldValue)) {
            // Nested object (e.g., passport_details, family_details)
            transformed[sectionKey][displayKey] = {};
            Object.entries(fieldValue).forEach(([nestedKey, nestedValue]: [string, any]) => {
              const nestedDisplayKey = snakeToTitleCase(nestedKey);
              // For display, keep the value as-is (brackets will be parsed in renderField)
              transformed[sectionKey][displayKey][nestedDisplayKey] = nestedValue || "N/A";
            });
          } else {
            // For display, keep the value as-is (brackets will be parsed in renderField)
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
    // Value already has {} brackets around default from prepareValueForSave
    current[pathParts[pathParts.length - 1]] = value;

    setOriginalApiData(updatedData);
    return updatedData;
  };

  // Save updated default values to API
  const saveDefaultValues = async () => {
    if (!originalApiData || !selectedCountry) return;

    try {
      setIsSaving(true);
      // Create a copy without _defaults for the API payload (or include it if API supports it)
      const dataToSave = JSON.parse(JSON.stringify(originalApiData));
      // Keep _defaults in the data structure if API supports it, otherwise remove it
      // For now, we'll include it in case the API needs it
      
      const response: any = await putAPIWithAuth(`visa-default-values/${selectedCountry}`, {
        default_value: dataToSave,
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
      setDefaultIndex(null);
    }
  };

  // Parse value string to extract values and identify default (wrapped in {})
  const parseValueString = (valueStr: string): { values: string[]; defaultIndex: number | null } => {
    if (!valueStr || valueStr === "N/A") {
      return { values: [""], defaultIndex: null };
    }
    
    const parts = valueStr.split("\n").filter(v => v.trim() !== "");
    const values: string[] = [];
    let defaultIndex: number | null = null;
    
    parts.forEach((part, index) => {
      // Check if value is wrapped in {}
      if (part.startsWith("{") && part.endsWith("}")) {
        // Remove brackets and add to values
        const unwrappedValue = part.slice(1, -1);
        values.push(unwrappedValue);
        defaultIndex = values.length - 1; // Current index in values array
      } else {
        values.push(part);
      }
    });
    
    return { values: values.length > 0 ? values : [""], defaultIndex };
  };

  // Start editing a field
  const startEditing = (sectionKey: string, displayFieldKey: string, currentValue: string, parentPath?: string) => {
    const apiPath = getFieldApiPath(sectionKey, displayFieldKey, parentPath);
    setEditingField(apiPath);
    
    // Parse value string to extract values and default index
    const valueStr = currentValue === "N/A" ? "" : String(currentValue);
    const { values, defaultIndex: parsedDefaultIndex } = parseValueString(valueStr);
    
    console.log('=== startEditing Debug ===');
    console.log('Field:', displayFieldKey);
    console.log('currentValue:', currentValue);
    console.log('valueStr:', valueStr);
    console.log('parsed values:', values);
    console.log('parsedDefaultIndex:', parsedDefaultIndex);
    console.log('Value at defaultIndex:', parsedDefaultIndex !== null ? values[parsedDefaultIndex] : 'N/A');
    
    setEditingValues(values.length > 0 ? values : [""]);
    setDefaultIndex(parsedDefaultIndex);
  };

  // Cancel editing - reload original data to revert changes
  const cancelEditing = async () => {
    setEditingField(null);
    setEditingValues([]);
    setDefaultIndex(null);
    
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

  // Get filtered (non-empty) values and their original indices
  const getFilteredValuesWithIndices = () => {
    const filtered: Array<{ value: string; originalIndex: number }> = [];
    editingValues.forEach((value, index) => {
      if (value.trim() !== "") {
        filtered.push({ value, originalIndex: index });
      }
    });
    return filtered;
  };

  // Set/unset default value
  const toggleDefault = (index: number) => {
    // index is the position in editingValues array
    // We need to find the corresponding index in the filtered array
    const filtered = getFilteredValuesWithIndices();
    const filteredIndex = filtered.findIndex(item => item.originalIndex === index);
    
    if (filteredIndex === -1) {
      // Can't set empty value as default
      return;
    }
    
    let newDefaultIndex: number | null;
    if (defaultIndex === filteredIndex) {
      // Unset default if clicking the same index
      newDefaultIndex = null;
    } else {
      // Set new default (using filtered index)
      newDefaultIndex = filteredIndex;
    }
    
    // Update state and immediately update API data with the new default
    setDefaultIndex(newDefaultIndex);
    
    // Use functional update to get latest editingValues
    setEditingValues((currentValues) => {
      if (editingField && originalApiData) {
        const filteredValues = currentValues.filter(v => v.trim() !== "");
        let valueToSave: string;
        if (newDefaultIndex !== null && newDefaultIndex < filteredValues.length) {
          valueToSave = filteredValues.map((value, idx) => 
            idx === newDefaultIndex ? `{${value}}` : value
          ).join("\n");
        } else {
          valueToSave = filteredValues.join("\n");
        }
        console.log('=== toggleDefault ===');
        console.log('newDefaultIndex:', newDefaultIndex);
        console.log('filteredValues:', filteredValues);
        console.log('valueToSave:', valueToSave);
        updateApiDataValue(editingField, valueToSave);
      }
      return currentValues; // Don't change, just read
    });
  };

  // Remove an input field
  const removeInputField = (index: number) => {
    if (editingValues.length > 1) {
      const newValues = editingValues.filter((_, i) => i !== index);
      setEditingValues(newValues);
      
      // Recalculate default index based on filtered values
      const filteredBefore = getFilteredValuesWithIndices();
      const filteredAfter = newValues
        .map((value, idx) => ({ value, originalIndex: idx }))
        .filter(item => item.value.trim() !== "");
      
      let newDefaultIndex: number | null = null;
      if (defaultIndex !== null && defaultIndex < filteredBefore.length) {
        const defaultOriginalIndex = filteredBefore[defaultIndex].originalIndex;
        
        if (defaultOriginalIndex === index) {
          // If removing the default field, clear the default
          newDefaultIndex = null;
        } else {
          // Find the new filtered index for the default value
          const newFilteredIndex = filteredAfter.findIndex(
            item => item.originalIndex === (defaultOriginalIndex > index ? defaultOriginalIndex - 1 : defaultOriginalIndex)
          );
          newDefaultIndex = newFilteredIndex !== -1 ? newFilteredIndex : null;
        }
      }
      setDefaultIndex(newDefaultIndex);
      
      // Update API data immediately with {} brackets if default is set
      const apiPath = editingField;
      if (apiPath && originalApiData) {
        let valueToSave: string;
        if (newDefaultIndex !== null && newDefaultIndex < filteredAfter.length) {
          valueToSave = filteredAfter.map((item, idx) => 
            idx === newDefaultIndex ? `{${item.value}}` : item.value
          ).join("\n");
        } else {
          valueToSave = filteredAfter.map(item => item.value).join("\n");
        }
        updateApiDataValue(apiPath, valueToSave);
      }
    }
  };

  // Update a specific input value
  const updateInputValue = (index: number, value: string, sectionKey: string, displayFieldKey: string, parentPath?: string) => {
    const newValues = [...editingValues];
    newValues[index] = value;
    setEditingValues(newValues);
    
    // Recalculate default index if the default value became empty
    const filteredBefore = getFilteredValuesWithIndices();
    const filteredAfter = newValues
      .map((val, idx) => ({ value: val, originalIndex: idx }))
      .filter(item => item.value.trim() !== "");
    
    let updatedDefaultIndex = defaultIndex;
    if (defaultIndex !== null && defaultIndex < filteredBefore.length) {
      const defaultOriginalIndex = filteredBefore[defaultIndex].originalIndex;
      // If the default value became empty, clear it
      if (newValues[defaultOriginalIndex].trim() === "") {
        updatedDefaultIndex = null;
        setDefaultIndex(null);
      } else {
        // Find the new filtered index for the default value
        const newFilteredIndex = filteredAfter.findIndex(
          item => item.originalIndex === defaultOriginalIndex
        );
        if (newFilteredIndex !== -1) {
          updatedDefaultIndex = newFilteredIndex;
          setDefaultIndex(newFilteredIndex);
        } else {
          updatedDefaultIndex = null;
          setDefaultIndex(null);
        }
      }
    }
    
    // Update API data immediately with {} brackets if default is set
    const apiPath = getFieldApiPath(sectionKey, displayFieldKey, parentPath);
    let valueToSave: string;
    if (updatedDefaultIndex !== null && updatedDefaultIndex < filteredAfter.length) {
      valueToSave = filteredAfter.map((item, idx) => 
        idx === updatedDefaultIndex ? `{${item.value}}` : item.value
      ).join("\n");
    } else {
      valueToSave = filteredAfter.map(item => item.value).join("\n");
    }
    const updatedData = updateApiDataValue(apiPath, valueToSave);
    
    // Update display data immediately for real-time feedback
    if (updatedData) {
      const transformedData = transformApiDataToDisplayFormat(updatedData);
      setConfigurationData(transformedData);
    }
  };

  // Handle save - convert array to \n separated string, wrapping default value in {}
  const prepareValueForSave = (currentDefaultIndex: number | null = null): string => {
    // Use provided defaultIndex or fall back to state (to avoid stale closures)
    const indexToUse = currentDefaultIndex !== null ? currentDefaultIndex : defaultIndex;
    
    // Get filtered values with their original indices to preserve default correctly
    const filteredWithIndices = editingValues
      .map((value, originalIndex) => ({ value, originalIndex }))
      .filter(item => item.value.trim() !== "");
    
    console.log('=== prepareValueForSave Debug ===');
    console.log('editingValues:', editingValues);
    console.log('defaultIndex (state):', defaultIndex);
    console.log('indexToUse:', indexToUse);
    console.log('filteredWithIndices:', filteredWithIndices);
    
    if (indexToUse !== null && indexToUse < filteredWithIndices.length) {
      // Find which value in the filtered array corresponds to the defaultIndex
      // defaultIndex is the index in the filtered array from when editing started
      const defaultItem = filteredWithIndices[indexToUse];
      console.log('defaultItem:', defaultItem);
      if (defaultItem) {
        // Wrap the default value in {} brackets
        const valuesWithDefault = filteredWithIndices.map((item, idx) => {
          if (idx === indexToUse) {
            return `{${item.value}}`;
          }
          return item.value;
        });
        console.log('valuesWithDefault:', valuesWithDefault);
        return valuesWithDefault.join("\n");
      }
    }
    const result = filteredWithIndices.map(item => item.value).join("\n");
    console.log('No default, returning:', result);
    return result;
  };

  // Handle save on blur or enter
  const handleSave = async () => {
    if (editingField) {
      // Get the latest defaultIndex and editingValues from state to avoid stale closures
      let latestDefaultIndex: number | null = null;
      let latestEditingValues: string[] = [];
      
      // Use functional state updates to get latest values
      setDefaultIndex((prev) => {
        latestDefaultIndex = prev;
        return prev; // Don't change, just read
      });
      setEditingValues((prev) => {
        latestEditingValues = prev;
        return prev; // Don't change, just read
      });
      
      // Prepare value with latest state
      const filteredWithIndices = latestEditingValues
        .map((value, originalIndex) => ({ value, originalIndex }))
        .filter(item => item.value.trim() !== "");
      
      let valueToSave: string;
      if (latestDefaultIndex !== null && latestDefaultIndex < filteredWithIndices.length) {
        valueToSave = filteredWithIndices.map((item, idx) => {
          if (idx === latestDefaultIndex) {
            return `{${item.value}}`;
          }
          return item.value;
        }).join("\n");
      } else {
        valueToSave = filteredWithIndices.map(item => item.value).join("\n");
      }
      
      console.log('=== handleSave ===');
      console.log('latestDefaultIndex:', latestDefaultIndex);
      console.log('latestEditingValues:', latestEditingValues);
      console.log('valueToSave:', valueToSave);
      
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
            {editingValues.map((value, index) => {
              // Check if this index corresponds to the default in filtered array
              const filtered = getFilteredValuesWithIndices();
              const isDefault = defaultIndex !== null && 
                                defaultIndex < filtered.length && 
                                filtered[defaultIndex].originalIndex === index;
              return (
                <div key={index} className="flex items-center gap-2">
                  <div className="flex-1 relative">
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
                      className={`w-full py-2 border rounded-[8px] focus:outline-none focus:ring-2 text-[14px] text-[#24282E] ${
                        isDefault 
                          ? "px-3 pr-20 border-[#42DA82] bg-[#42DA8210] focus:ring-[#42DA82]/20" 
                          : "px-3 border-[#42DA82] focus:ring-[#42DA82]/20"
                      }`}
                      autoFocus={index === 0}
                      disabled={isSaving}
                      placeholder={`Option ${index + 1}`}
                    />
                    {isDefault && (
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#42DA82] text-white text-[10px] font-[600] px-2 py-0.5 rounded-[4px] pointer-events-none">
                        Default
                      </span>
                    )}
                  </div>
                  {/* Show star icon only if there are multiple input fields (dropdown) */}
                  {editingValues.length > 1 && (
                    <button
                      type="button"
                      onClick={() => toggleDefault(index)}
                      className={`p-1.5 rounded transition-all border ${
                        isDefault
                          ? "border-[#42DA82] bg-[#42DA8210]"
                          : "border-[#E9EAEA] hover:border-[#42DA82] hover:bg-[#42DA8210]"
                      }`}
                      title={isDefault ? "Remove as default" : "Set as default"}
                    >
                      <Star 
                        className={`w-4 h-4 ${
                          isDefault ? "text-[#42DA82] fill-[#42DA82]" : "text-[#727A90]"
                        }`} 
                      />
                    </button>
                  )}
                  {/* Show plus icon on last field */}
                  {index === editingValues.length - 1 && (
                    <button
                      type="button"
                      onClick={addInputField}
                      className="p-1.5 hover:bg-[#42DA82]/10 rounded transition-all border border-[#42DA82]"
                      title="Add another option"
                    >
                      <Plus className="w-4 h-4 text-[#42DA82]" />
                    </button>
                  )}
                  {/* Show delete icon on all fields (including last one) if there's more than one field */}
                  {editingValues.length > 1 && (
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
              );
            })}
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
            <div className="flex-1">
              {hasMultipleValues ? (
                <div className="flex flex-col gap-1">
                  {displayValue.split("\n").map((line, idx) => {
                    // Check if line is wrapped in {} brackets (default value)
                    const isDefault = line.startsWith("{") && line.endsWith("}");
                    const displayLine = isDefault ? line.slice(1, -1) : line; // Remove brackets for display
                    return (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="text-[14px] font-[400] text-[#727A90]">{displayLine || "N/A"}</span>
                        {isDefault && (
                          <span className="bg-[#42DA82] text-white text-[10px] font-[600] px-2 py-0.5 rounded-[4px]">
                            Default
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-[14px] font-[400] text-[#727A90]">
                  {displayValue.startsWith("{") && displayValue.endsWith("}") 
                    ? displayValue.slice(1, -1) 
                    : displayValue || "N/A"}
                </p>
              )}
            </div>
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
