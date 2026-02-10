import { JSX } from "react";
import CrossSvg from "@/Assets/svgs/CrossSvg";
import { Check } from "lucide-react";
import { ApplicationData, Document, EditingFieldsMap } from "./types";
import { getApiWithAuth } from "@/utils/api";
import { toast } from "react-toastify";

// --- Polling helpers --------------------------------------------------------

export const pollApplicationDetails = async (
  applicationData: ApplicationData | null,
  setApplicationData: React.Dispatch<React.SetStateAction<ApplicationData | null>>,
  pollingInterval: React.MutableRefObject<NodeJS.Timeout | null>
) => {
  if (
    applicationData?.id &&
    applicationData.background_processing_status?.status === "in_progress"
  ) {
    try {
      const response: any = await getApiWithAuth(
        `form-submissions/${applicationData.id}`
      );
      if (response.success && response.data) {
        setApplicationData(response.data);

        // Stop polling if status is no longer 'in_progress'
        if (
          response.data.background_processing_status?.status !== "in_progress"
        ) {
          if (pollingInterval.current) {
            clearInterval(pollingInterval.current);
            pollingInterval.current = null;
          }
        }
      } else {
        toast.error("Failed to refresh application details");
      }
    } catch (error) {
      console.error("Error polling application details:", error);
      toast.error("Error while polling application details");
    }
  }
};

// --- Generic value helpers ---------------------------------------------------

export const getValue = (
  applicationData: ApplicationData | null,
  field: string
): string | number => {
  if (!applicationData || !applicationData.values) return "N/A";
  const fieldData = applicationData.values[field];
  if (!fieldData) return "N/A";
  if (
    typeof fieldData === "object" &&
    fieldData !== null &&
    "value" in fieldData
  ) {
    const docValue = (fieldData as any).value as any;
    if (
      typeof docValue === "object" &&
      docValue !== null &&
      "filename" in docValue
    ) {
      return (docValue as any).filename || "N/A";
    }
    if (typeof docValue === "string" || typeof docValue === "number") {
      return docValue || "N/A";
    }
  }
  if (typeof fieldData === "string" || typeof fieldData === "number") {
    return fieldData || "N/A";
  }
  return "N/A";
};

export const getDocumentInfo = (
  applicationData: ApplicationData | null,
  ...documentTypes: string[]
): { file_path: string; original_filename: string } | null => {
  if (!applicationData?.documents) return null;
  const docs = applicationData.documents;

  const extractFromEntry = (
    entry: Document | Document[]
  ): { file_path: string; original_filename: string } | null => {
    const doc = Array.isArray(entry) ? entry.find((d) => d?.file_path) : entry;
    if (!doc?.file_path) return null;
    return {
      file_path: doc.file_path,
      original_filename:
        doc.original_filename ||
        doc.file_path.split("/").pop() ||
        "download",
    };
  };

  for (const type of documentTypes) {
    const entry = docs[type];
    if (entry) {
      const info = extractFromEntry(entry as Document | Document[]);
      if (info) return info;
    }
  }

  const allEntries = Object.values(docs).flatMap((e) =>
    Array.isArray(e) ? e : [e]
  ) as Document[];
  for (const type of documentTypes) {
    const doc = allEntries.find(
      (d) => d?.document_type?.toUpperCase() === type.toUpperCase()
    );
    if (doc?.file_path) {
      return {
        file_path: doc.file_path,
        original_filename:
          doc.original_filename ||
          doc.file_path.split("/").pop() ||
          "download",
      };
    }
  }
  return null;
};

export const formatSectionTitle = (key: string): string => {
  const match = key.match(/^step_(\d+)_([\w\d_]+)$/i);
  if (match) {
    const [, stepNumber, rest] = match;
    return `Step ${stepNumber} ${rest
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase())}`;
  }
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

export const formatForDisplay = (value: any): string => {
  if (value === null || value === undefined || value === "") {
    return "N/A";
  }
  if (typeof value === "string") {
    return value
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }
  return String(value);
};

// Helper to safely get nested value from an object using dot-separated path
export const getNestedValue = (obj: any, path: string): any => {
  if (!obj || !path) return null;
  const parts = path.split(".");
  let current: any = obj;

  for (const part of parts) {
    if (current && typeof current === "object" && part in current) {
      current = current[part];
    } else {
      return null;
    }
  }

  return current;
};

// Helper to parse default options string (with {default} and optional newline-separated options)
export const parseDefaultOptions = (
  defaultValueStr: string
): { options: string[]; defaultOption: string | null } => {
  if (typeof defaultValueStr !== "string") {
    return { options: [], defaultOption: null };
  }

  const rawOptions = defaultValueStr
    .split("\n")
    .map((opt) => opt.trim())
    .filter(Boolean);

  let defaultOption: string | null = null;
  const cleanedOptions: string[] = [];

  rawOptions.forEach((opt) => {
    if (opt.startsWith("{") && opt.endsWith("}")) {
      const cleaned = opt.slice(1, -1).trim();
      if (cleaned) {
        cleanedOptions.push(cleaned);
        if (defaultOption === null) {
          defaultOption = cleaned;
        }
      }
    } else {
      cleanedOptions.push(opt);
    }
  });

  const uniqueOptions = Array.from(new Set(cleanedOptions));

  return { options: uniqueOptions, defaultOption };
};

// Local helper to check emptiness / N/A for display & editing logic
export const isEmptyOrNAForDisplay = (value: any): boolean => {
  if (value === null || value === undefined) return true;
  const str = String(value).trim();
  if (!str) return true;
  return str.toLowerCase() === "n/a";
};

// --- Default merging helpers -------------------------------------------------

const isEmptyOrNA = (value: any): boolean => {
  if (value === null || value === undefined) return true;
  const strValue = String(value).trim();
  return strValue === "" || strValue.toLowerCase() === "n/a";
};

const isValidDefault = (value: any): boolean => {
  if (value === null || value === undefined) return false;
  const strValue = String(value).trim();
  return strValue !== "" && strValue.toLowerCase() !== "n/a";
};

export const mergeWithDefaults = (extractedData: any, defaults: any): any => {
  if (!defaults || !extractedData) {
    return extractedData;
  }

  const merged: any = {};

  // Get all section keys from both extracted and default data
  const allSectionKeys = new Set([
    ...Object.keys(extractedData),
    ...Object.keys(defaults),
  ]);

  // Iterate through each section
  allSectionKeys.forEach((sectionKey) => {
    merged[sectionKey] = {};
    const extractedSection = extractedData[sectionKey] || {};
    const defaultSection = defaults[sectionKey] || {};

    // Get all field keys from both extracted and default sections
    const allFieldKeys = new Set([
      ...Object.keys(extractedSection),
      ...Object.keys(defaultSection),
    ]);

    allFieldKeys.forEach((fieldKey) => {
      const extractedValue = extractedSection[fieldKey];
      const defaultValue = defaultSection[fieldKey];

      // If extracted value is empty/N/A and default exists, use default
      if (isEmptyOrNA(extractedValue) && isValidDefault(defaultValue)) {
        merged[sectionKey][fieldKey] = defaultValue;
      }
      // If extracted value exists and is not empty, use it
      else if (!isEmptyOrNA(extractedValue)) {
        // Handle nested objects
        if (
          typeof extractedValue === "object" &&
          extractedValue !== null &&
          !Array.isArray(extractedValue)
        ) {
          if (typeof defaultValue === "object" && defaultValue !== null) {
            // Recursively merge nested objects
            const nestedMerged: any = {};
            const allNestedKeys = new Set([
              ...Object.keys(extractedValue),
              ...Object.keys(defaultValue),
            ]);

            allNestedKeys.forEach((nestedKey) => {
              const nestedExtracted = extractedValue[nestedKey];
              const nestedDefault = defaultValue[nestedKey];

              if (
                isEmptyOrNA(nestedExtracted) &&
                isValidDefault(nestedDefault)
              ) {
                nestedMerged[nestedKey] = nestedDefault;
              } else if (!isEmptyOrNA(nestedExtracted)) {
                nestedMerged[nestedKey] = nestedExtracted;
              } else {
                nestedMerged[nestedKey] =
                  nestedExtracted !== undefined ? nestedExtracted : nestedDefault;
              }
            });

            merged[sectionKey][fieldKey] = nestedMerged;
          } else {
            merged[sectionKey][fieldKey] = extractedValue;
          }
        } else {
          merged[sectionKey][fieldKey] = extractedValue;
        }
      }
      // If extracted value is empty but no default, use extracted (which will be empty/N/A)
      else {
        merged[sectionKey][fieldKey] =
          extractedValue !== undefined ? extractedValue : defaultValue;
      }
    });
  });

  return merged;
};

// --- Render helpers ----------------------------------------------------------

export const renderObjectContent = (
  data: any,
  basePath: string = "",
  level: number = 0,
  startEditing?: (path: string, value: any) => void,
  cancelEditing?: (path: string) => void,
  updateEditingValue?: (path: string, value: any) => void,
  saveField?: (path: string, fieldName: string) => void,
  editingFields?: EditingFieldsMap,
  defaultValues?: any
): JSX.Element => {
  if (Array.isArray(data)) {
    return (
      <div className="flex flex-col gap-3">
        {data.length > 0 ? (
          data.map((item, index) => {
            const itemPath = `${basePath}.${index}`;
            return (
              <div
                key={`array-item-${level}-${index}`}
                className="border border-[#E9EAEA] rounded-[10px] p-4 bg-white"
              >
                {typeof item === "object" && item !== null ? (
                  renderObjectContent(
                    item,
                    itemPath,
                    level + 1,
                    startEditing,
                    cancelEditing,
                    updateEditingValue,
                    saveField,
                    editingFields
                  )
                ) : (
                  <p>{formatForDisplay(item)}</p>
                )}
              </div>
            );
          })
        ) : (
          <p className="text-[14px] font-[500] text-[#727A90]">N/A</p>
        )}
      </div>
    );
  }

  if (typeof data !== "object" || data === null) {
    const fieldPath = basePath;
    const isEditing = editingFields && editingFields[fieldPath];
    const displayValue = isEditing ? editingFields[fieldPath].value : data;

    const defaultFieldValue =
      defaultValues && fieldPath
        ? getNestedValue(defaultValues, fieldPath)
        : null;

    let options: string[] = [];
    let defaultOption: string | null = null;

    if (typeof defaultFieldValue === "string") {
      const parsed = parseDefaultOptions(defaultFieldValue);
      options = parsed.options;
      defaultOption = parsed.defaultOption;
    }

    if (
      isEditing &&
      options.length > 0 &&
      editingFields &&
      editingFields[fieldPath] &&
      editingFields[fieldPath]!.value &&
      !options.includes(editingFields[fieldPath]!.value)
    ) {
      options = [...options, editingFields[fieldPath]!.value];
    }

    const selectValue =
      (isEditing && editingFields && editingFields[fieldPath]?.value) ||
      defaultOption ||
      (options.length > 0 ? options[0] : "");

    return (
      <div className="flex items-center gap-2 group">
        {isEditing ? (
          <>
            {options.length > 0 ? (
              <select
                value={selectValue}
                onChange={(e) =>
                  updateEditingValue?.(fieldPath, e.target.value)
                }
                className="flex-1 px-3 py-2 border border-[#42DA82] rounded-[8px] bg-white focus:outline-none focus:ring-2 focus:ring-[#42DA82]/20 text-[14px]"
                disabled={isEditing.isSaving}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    saveField?.(fieldPath, fieldPath.split(".").pop() || "");
                  } else if (e.key === "Escape") {
                    cancelEditing?.(fieldPath);
                  }
                }}
              >
                {options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={displayValue}
                onChange={(e) =>
                  updateEditingValue?.(fieldPath, e.target.value)
                }
                className="flex-1 px-3 py-2 border border-[#42DA82] rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#42DA82]/20 text-[14px]"
                disabled={isEditing.isSaving}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    saveField?.(fieldPath, fieldPath.split(".").pop() || "");
                  } else if (e.key === "Escape") {
                    cancelEditing?.(fieldPath);
                  }
                }}
              />
            )}
            <div className="flex items-center gap-1">
              {isEditing.isSaving ? (
                <div className="w-5 h-5 border-2 border-[#42DA82] border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <button
                    onClick={() =>
                      saveField?.(
                        fieldPath,
                        fieldPath.split(".").pop() || ""
                      )
                    }
                    className="p-1.5 hover:bg-[#42DA82]/10 rounded transition-colors"
                    title="Save"
                  >
                    <Check size={16} className="text-[#42DA82]" />
                  </button>
                  <button
                    onClick={() => cancelEditing?.(fieldPath)}
                    className="p-1.5 hover:bg-red-100 rounded transition-colors"
                    title="Cancel"
                    disabled={isEditing.isSaving}
                  >
                    <CrossSvg size={16} className="text-red-500" />
                  </button>
                </>
              )}
            </div>
          </>
        ) : (
          <>
            <p className="text-[14px] font-[500] text-[#24282E]">
              {formatForDisplay(data)}
            </p>
            <button
              onClick={() => {
                const currentValue = data;
                let initialValue = currentValue;

                if (isEmptyOrNAForDisplay(currentValue)) {
                  if (
                    typeof defaultFieldValue === "string" &&
                    defaultFieldValue.includes("\n")
                  ) {
                    const { defaultOption } =
                      parseDefaultOptions(defaultFieldValue);
                    initialValue = defaultOption || "";
                  } else {
                    initialValue = "";
                  }
                }

                startEditing?.(fieldPath, initialValue);
              }}
              className="p-1 hover:bg-[#42DA82]/10 rounded transition-all ml-1"
              title="Edit"
            >
              <svg
                className="w-4 h-4 text-[#727A90]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {Object.entries(data).map(([key, value]) => {
        const fieldPath = basePath ? `${basePath}.${key}` : key;

        return (
          <div key={key} className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <p className="font-bold text-[14px] text-[#24282E]">
                {formatForDisplay(key)}
              </p>
            </div>
            {renderObjectContent(
              value,
              fieldPath,
              level + 1,
              startEditing,
              cancelEditing,
              updateEditingValue,
              saveField,
              editingFields,
              defaultValues
            )}
          </div>
        );
      })}
    </div>
  );
};

