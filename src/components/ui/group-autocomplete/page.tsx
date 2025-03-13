"use client";
import { useState, useEffect, useRef } from "react";
import { getApiWithAuth, postAPIWithAuth } from "@/utils/api";
import styles from "./styles.module.css";
import { Plus } from "lucide-react";
import { toast } from "react-toastify";
import PhoneInputField from "../phone-input/page";
import InputField from "../input/input";
import * as Yup from "yup";
import { Formik, Form } from "formik";

interface Group {
  id: number;
  name: string;
  contact_email: string;
}

interface GroupAutocompleteProps {
  value: string;
  groupId: number | null;
  onChange: (value: string, groupId: number | null) => void;
  error?: any;
  touched?: any;
}

export default function GroupAutocomplete({
  value,
  groupId,
  onChange,
  error,
  touched,
}: GroupAutocompleteProps) {
  const [searchTerm, setSearchTerm] = useState(value);
  const [suggestions, setSuggestions] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newGroupData, setNewGroupData] = useState({
    name: "",
    contact_name: "",
    contact_email: "",
    contact_phone: "",
    description: "",
  });
  const wrapperRef = useRef<HTMLDivElement>(null);
  const initialValues = {
    name: "",
    contact_email: "",
    contact_phone: "",
    description: "",
    contact_name: "",
  };

  // Validation Schema using Yup
  const validationSchema = Yup.object({
    name: Yup.string().required("Group Name is required"),
    contact_name: Yup.string().required("Group Name is required"),

    contact_email: Yup.string()
      .email("Invalid email format")
      .required("Email is required"),
    contact_phone: Yup.string().required("Phone number is required"),
    description: Yup.string().required("Description is required"),
  });

  // Form submission handler
  // const handleSubmit = (values: any) => {
  //   handleCreateNewGroup(values); // Pass form values to the submission function
  // };

  // Handle click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        setShowCreateForm(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch initial group data when groupId is available
  useEffect(() => {
    const fetchGroupById = async () => {
      if (groupId && !value) {
        setIsLoading(true);
        try {
          const response: any = await getApiWithAuth(`groups/${groupId}`);
          if (response.success) {
            setSearchTerm(response.data.name);
            onChange(response.data.name, groupId);
          }
        } catch (error) {
          console.error("Error fetching group:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchGroupById();
  }, [groupId]);

  // Fetch suggestions when user types
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchTerm.trim() && !showCreateForm) {
        setIsLoading(true);
        try {
          const response: any = await getApiWithAuth(
            `groups?search=${searchTerm}`
          );
          if (response.success) {
            setSuggestions(response.data.data || []);
          }
        } catch (error) {
          console.error("Error fetching suggestions:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setSuggestions([]);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm, showCreateForm]);

  const handleSelectGroup = (group: Group) => {
    setSearchTerm(group.name);
    onChange(group.name, group.id);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleCreateNewGroup = async (
    values: any,
    { setSubmitting, resetForm }: any
  ) => {
    try {
      if (isLoading) return; // Prevent double submission
      setIsLoading(true);

      const response: any = await postAPIWithAuth("groups/", values);
      if (response.success) {
        const newGroup = response.data.data;
        console.log("newGroup", newGroup);
        handleSelectGroup(newGroup);
        setShowCreateForm(false);
        resetForm();
        toast.success("Group created successfully");
      }
    } catch (error) {
      console.error("Error creating group:", error);
      toast.error("Failed to create group");
    } finally {
      setIsLoading(false);
      setSubmitting(false);
    }
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <label className="text-[#24282E] text-[18px] font-[500] font-jakarta block mb-2">
        Group
      </label>
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            onChange(e.target.value, null);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          className="w-full px-4 py-2 border-2 border-[#E9EAEA] rounded-[12px] focus:outline-none focus:border-[#42DA82]"
          placeholder="Search group..."
        />
        {isLoading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="w-5 h-5 border-2 border-[#42DA82] border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {showSuggestions && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
          {suggestions.length > 0 ? (
            <ul className="py-1">
              {suggestions.map((group) => (
                <li
                  key={group.id}
                  onClick={() => handleSelectGroup(group)}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  <div className="flex flex-col">
                    <span className="text-[14px] text-gray-900">
                      {group.name}
                    </span>
                    <span className="text-[12px] text-gray-500">
                      {group.contact_email}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            !showCreateForm && (
              <div
                className="px-4 py-3 text-[14px] text-[#42DA82] hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                onClick={() => setShowCreateForm(true)}
              >
                <Plus className="w-4 h-4" />
                <span>Create new group</span>
              </div>
            )
          )}
        </div>
      )}
      {showCreateForm && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-2xl p-6 h-[300px] overflow-auto">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            Create New Group
          </h3>

          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleCreateNewGroup}
          >
            {({ values, handleChange, handleBlur, errors, touched }: any) => (
              <Form className="space-y-4">
                {/* Group Name Field */}
                <InputField
                  type="text"
                  placeHolder="Enter group name"
                  value={values.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  label="Group Name"
                  fieldName="name"
                  error={touched.name && errors.name}
                />

                {/* Contact Name Field */}
                <InputField
                  type="text"
                  placeHolder="Enter contact name"
                  value={values.contact_name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  label="Contact Name"
                  fieldName="contact_name"
                  error={touched.contact_name && errors.contact_name}
                />

                {/* Contact Email Field */}
                <InputField
                  label="Email"
                  type="email"
                  placeHolder="Enter contact email"
                  value={values.contact_email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  fieldName="contact_email"
                  error={touched.contact_email && errors.contact_email}
                />

                {/* Phone Number Field */}
                <PhoneInputField
                  value={values.contact_phone}
                  onChange={(value) =>
                    handleChange({ target: { name: "contact_phone", value } })
                  }
                  error={errors.contact_phone}
                  touched={touched.contact_phone}
                />

                {/* Description Field */}
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Description
                  </label>
                  <textarea
                    placeholder="Add a short description"
                    name="description"
                    value={values.description}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring focus:ring-green-300 focus:outline-none transition"
                    rows={3}
                  />
                  {touched.description && errors.description && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.description}
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-2 ">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-5 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating..." : "Create Group"}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      )}

      {touched && error && (
        <span className="text-red-500 text-sm mt-1">{error}</span>
      )}
    </div>
  );
}
