"use client";
import { useState, useEffect, useRef } from "react";
import { getApiWithAuth, postAPIWithAuth } from "@/utils/api";
import styles from "./styles.module.css";
import { Plus } from "lucide-react";
import { toast } from "react-toastify";
import PhoneInputField from "../phone-input/page";

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
    contact_email: "",
    contact_phone: "",
    description: "",
  });
  const wrapperRef = useRef<HTMLDivElement>(null);

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

  const handleCreateNewGroup = async () => {
    try {
      setIsLoading(true);
      const response: any = await postAPIWithAuth("groups", newGroupData);
      if (response.success) {
        const newGroup = response.data.data;
        handleSelectGroup(newGroup);
        setShowCreateForm(false);
        toast.success("Group created successfully");
      }
    } catch (error) {
      console.error("Error creating group:", error);
      toast.error("Failed to create group");
    } finally {
      setIsLoading(false);
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
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
          <h3 className="text-[16px] font-semibold mb-4">Create New Group</h3>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Group Name"
              value={newGroupData.name}
              onChange={(e) =>
                setNewGroupData({ ...newGroupData, name: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-200 rounded-lg"
            />
            <input
              type="email"
              placeholder="Contact Email"
              value={newGroupData.contact_email}
              onChange={(e) =>
                setNewGroupData({
                  ...newGroupData,
                  contact_email: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-gray-200 rounded-lg"
            />
            <PhoneInputField
              value={""}
              onChange={function (value: string): void {
                throw new Error("Function not implemented.");
              }}
            />
            <textarea
              placeholder="Description"
              value={newGroupData.description}
              onChange={(e) =>
                setNewGroupData({
                  ...newGroupData,
                  description: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-gray-200 rounded-lg"
              rows={3}
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateNewGroup}
                className="px-4 py-2 bg-[#42DA82] text-white rounded-lg hover:bg-[#3bc574]"
                disabled={isLoading}
              >
                {isLoading ? "Creating..." : "Create Group"}
              </button>
            </div>
          </div>
        </div>
      )}

      {touched && error && (
        <span className="text-red-500 text-sm mt-1">{error}</span>
      )}
    </div>
  );
}
