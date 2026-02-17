"use client";
import CrossSvg from "@/Assets/svgs/CrossSvg";
import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import "@/styles/globals.css";
import { getApiWithAuth } from "@/utils/api";
import { toast } from "react-toastify";
import { BASE_URL } from "@/utils/api";
import { getAccessToken } from "@/utils/asyncStorage";
import React from "react";

interface Country {
  id: number;
  name: string;
  code: string;
  flag_emoji: string;
}

interface VisaType {
  id: number;
  name: string;
  code: string;
  description: string;
  is_active: boolean;
  price: number;
  duration: number;
  currency: string;
  internal_cost: number;
}

interface CountryWithVisaTypes {
  country: Country;
  visa_types: VisaType[];
}

interface NewApplicationProps {
  setIsNewApplication?: (value: boolean) => void;
  onClose: () => void;
  editData?: any; // Application data when editing
  onSuccess?: () => void; // Callback after successful create/update
}

const NewApplication = ({ setIsNewApplication, onClose, editData, onSuccess }: NewApplicationProps) => {
  // Quick Entry Form State
  const [countriesData, setCountriesData] = useState<CountryWithVisaTypes[]>([]);
  const [isLoadingCountries, setIsLoadingCountries] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [visaTypes, setVisaTypes] = useState<VisaType[]>([]);
  const [selectedVisaTypeId, setSelectedVisaTypeId] = useState<number | null>(null);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [internalNotes, setInternalNotes] = useState("");
  const [passportNumber, setPassportNumber] = useState("");
  const [pricePaid, setPricePaid] = useState("");
  const [passportPhoto, setPassportPhoto] = useState<File | null>(null);
  const [userPhoto, setUserPhoto] = useState<File | null>(null);
  const [otherDocuments, setOtherDocuments] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showVisaTypeDropdown, setShowVisaTypeDropdown] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);

  // Check if we're in edit mode
  const isEditMode = !!editData;

  // Fetch countries and visa types on component mount
  useEffect(() => {
    const fetchCountriesAndVisaTypes = async () => {
      setIsLoadingCountries(true);
      try {
        const response: any = await getApiWithAuth(`visa-types/by-country?is_active=true`);
        if (response.success && response.data?.data?.countries) {
          setCountriesData(response.data.data.countries);
        } else {
          toast.error("Failed to load countries");
        }
      } catch (error) {
        console.error("Error loading countries:", error);
        toast.error("Failed to load countries");
      } finally {
        setIsLoadingCountries(false);
      }
    };
    fetchCountriesAndVisaTypes();
  }, []);

  // Pre-populate form when editing
  useEffect(() => {
    if (editData && countriesData.length > 0) {
      // Extract data from editData
      const countryName = editData.values?.country?.value || editData.values?.country || editData.customer?.country || "";
      const visaTypeName = editData.values?.visa_type?.value || editData.values?.visa_type || editData.form_name || "";
      const emailValue = editData.customer?.email || editData.applicant?.email || editData.values?.email?.value || editData.values?.email || "";
      const phoneValue = editData.customer?.phone || editData.applicant?.phone || editData.values?.phone?.value || editData.values?.phone || editData.values?.phone_number?.value || editData.values?.phone_number || "";
      const passportNumberValue = editData.applicant?.passport_number || editData.values?.passport_number?.value || editData.values?.passport_number || "";
      const internalNotesValue = editData.values?.internal_notes?.value || editData.values?.internal_notes || "";
      const pricePaidValue = editData.values?.price_paid?.value || editData.values?.price_paid || "";

      // Set email and phone
      if (emailValue) setEmail(emailValue);
      if (phoneValue) setPhone(phoneValue);
      if (internalNotesValue) setInternalNotes(internalNotesValue);
      if (pricePaidValue) setPricePaid(String(pricePaidValue));
      if (passportNumberValue) setPassportNumber(passportNumberValue);

      // Find and set country
      if (countryName) {
        const foundCountry = countriesData.find(
          (item) => item.country.name.toLowerCase() === countryName.toLowerCase()
        );
        if (foundCountry) {
          setSelectedCountry(foundCountry.country);

          // After country is set, find and set visa type
          const countryData = countriesData.find(
            (item) => item.country.id === foundCountry.country.id
          );
          if (countryData && visaTypeName) {
            const foundVisaType = countryData.visa_types.find(
              (vt) => vt.name.toLowerCase() === visaTypeName.toLowerCase()
            );
            if (foundVisaType) {
              setSelectedVisaTypeId(foundVisaType.id);
            }
          }
        }
      }
    }
  }, [editData, countriesData]);

  // Update visa types when country is selected
  useEffect(() => {
    if (selectedCountry) {
      const countryData = countriesData.find(
        (item) => item.country.id === selectedCountry.id
      );
      if (countryData) {
        setVisaTypes(countryData.visa_types);

        // If we're in edit mode and haven't set visa type yet, try to set it now
        if (editData && !selectedVisaTypeId) {
          const visaTypeName = editData.values?.visa_type?.value || editData.values?.visa_type || editData.form_name || "";
          if (visaTypeName) {
            const foundVisaType = countryData.visa_types.find(
              (vt) => vt.name.toLowerCase() === visaTypeName.toLowerCase()
            );
            if (foundVisaType) {
              setSelectedVisaTypeId(foundVisaType.id);
            }
          }
        }
      } else {
        setVisaTypes([]);
      }
      // Only reset visa type if we're not in edit mode
      if (!editData) {
        setSelectedVisaTypeId(null);
      }
    } else {
      setVisaTypes([]);
      if (!editData) {
        setSelectedVisaTypeId(null);
      }
    }
  }, [selectedCountry, countriesData, editData]);

  const handleFileChange = (
    setter: (file: File | null) => void,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      const validExtensions = ['jpg', 'jpeg', 'png'];
      
      if (!fileExtension || !validExtensions.includes(fileExtension)) {
        toast.error("Please upload only JPG or PNG images");
        event.target.value = ''; // Reset the input
        return;
      }
      
      // Also check MIME type for additional validation
      const validMimeTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!validMimeTypes.includes(file.type)) {
        toast.error("Please upload only JPG or PNG images");
        event.target.value = ''; // Reset the input
        return;
      }
      
      setter(file);
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!selectedCountry || !selectedCountry.id) {
      toast.error("Please select a country");
      return;
    }
    if (!selectedVisaTypeId) {
      toast.error("Please select a visa type");
      return;
    }
    const trimmedPhone = phone.trim();
    const trimmedEmail = email.trim();
    const trimmedPricePaid = pricePaid.trim();

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("visa_type_id", selectedVisaTypeId.toString());
      formData.append("country", selectedCountry.name);
      formData.append("country_id", selectedCountry.id.toString());
      if (trimmedPhone) {
        formData.append("phone", trimmedPhone);
      }
      const trimmedPassportNumber = passportNumber.trim();
      if (trimmedPassportNumber) {
        formData.append("passport_number", trimmedPassportNumber);
      }
      if (trimmedEmail) {
        formData.append("email", trimmedEmail);
      }
      if (internalNotes.trim()) {
        formData.append("internal_notes", internalNotes);
      }
      if (trimmedPricePaid) {
        formData.append("price_paid", trimmedPricePaid);
      }
      // Only append files if they are provided (required for create, optional for edit)
      if (passportPhoto) {
        formData.append("passport_photo", passportPhoto);
      }
      if (userPhoto) {
        formData.append("user_photo", userPhoto);
      }
      if (otherDocuments) {
        formData.append("other_documents", otherDocuments);
      }

      // Use native fetch for FormData so the browser sets Content-Type with the correct
      // multipart boundary. Axios can merge default headers (e.g. Content-Type) which
      // breaks multipart parsing and can cause the server to save the entire request
      // body as the file (inflated size). Backend quick_entry.html uses fetch the same way.
      const token = getAccessToken();
      const headers: Record<string, string> = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const apiUrl = isEditMode
        ? `${BASE_URL}applications/quick-entry/${editData.id}`
        : `${BASE_URL}applications/quick-entry`;
      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(apiUrl, {
        method,
        headers,
        body: formData,
      });

      const data = await response.json();

      if (data?.success || response.status === 200 || response.status === 201) {
        toast.success(isEditMode ? "Application updated successfully!" : "Application created successfully!");
        // Reset form
        setSelectedCountry(null);
        setSelectedVisaTypeId(null);
        setPhone("");
        setEmail("");
        setInternalNotes("");
        setPassportNumber("");
        setPricePaid("");
        setPassportPhoto(null);
        setUserPhoto(null);
        setOtherDocuments(null);
        // Call success callback to refresh list
        if (onSuccess) {
          onSuccess();
        }
        onClose();
      } else {
        toast.error(data?.message || (isEditMode ? "Failed to update application" : "Failed to create application"));
      }
    } catch (error: any) {
      console.error("Error creating application:", error);
      toast.error(error?.message || "Failed to create application");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[90] overflow-y-auto">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm">
        <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-h-[90vh]">
          <div className="bg-white rounded-xl w-[90vw] xl:w-[800px] lg:w-[800px] md:w-[800px] h-[90vh] shadow-lg flex flex-col">
            {/* Header */}
            <div className="flex justify-between p-6 pb-0 items-center flex-shrink-0">
              <h2 className="text-lg font-semibold">
                {isEditMode ? "Edit Application" : "Add New Application"}
              </h2>
              <button
                className="border-[#E9EAEA] border-[1px] p-2 rounded-[10px]"
                onClick={onClose}
              >
                <CrossSvg size={24} />
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="flex-1 overflow-y-auto px-8 py-6">
                  <div className="mb-6">
                    <h1 className="text-[24px] font-bold text-[#24282E] mb-2">
                      Quick Application Entry
                    </h1>
                    <p className="text-[14px] text-[#727A90]">
                      Enter application data quickly. This will be linked directly with application data.
                    </p>
                  </div>

                  <div className="space-y-6">
                    {/* Country and Visa Type in one row */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* Country Dropdown */}
                      <div>
                        <label className="block text-[14px] font-[500] text-[#24282E] mb-2">
                          Select Country <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                            disabled={isLoadingCountries}
                            className="w-full px-4 py-3 border border-[#E9EAEA] rounded-[10px] bg-white flex items-center justify-between text-left disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <span className={selectedCountry ? "text-[#24282E]" : "text-[#727A90]"}>
                              {isLoadingCountries
                                ? "Loading countries..."
                                : selectedCountry
                                ? `${selectedCountry.flag_emoji} ${selectedCountry.name}`
                                : "Select Country"}
                            </span>
                            <ChevronDown className="w-5 h-5 text-[#727A90]" />
                          </button>
                          {showCountryDropdown && !isLoadingCountries && (
                            <>
                              <div
                                className="fixed inset-0 z-[5]"
                                onClick={() => setShowCountryDropdown(false)}
                              />
                              <div className="absolute z-10 w-full mt-2 bg-white border border-[#E9EAEA] rounded-[10px] shadow-lg max-h-60 overflow-y-auto">
                                {countriesData.length === 0 ? (
                                  <div className="px-4 py-3 text-[#727A90]">No countries available</div>
                                ) : (
                                  countriesData.map((item) => (
                                    <button
                                      key={item.country.id}
                                      type="button"
                                      onClick={() => {
                                        setSelectedCountry(item.country);
                                        setShowCountryDropdown(false);
                                        setSelectedVisaTypeId(null); // Reset visa type when country changes
                                      }}
                                      className="w-full px-4 py-3 text-left hover:bg-[#42DA8210] transition-colors border-b border-[#E9EAEA] last:border-b-0"
                                    >
                                      <div className="font-medium text-[#24282E]">
                                        {item.country.flag_emoji} {item.country.name}
                                      </div>
                                    </button>
                                  ))
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Visa Type Dropdown */}
                      <div>
                        <label className="block text-[14px] font-[500] text-[#24282E] mb-2">
                          Visa Type <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                        <button
                          type="button"
                          onClick={() => selectedCountry && setShowVisaTypeDropdown(!showVisaTypeDropdown)}
                          disabled={!selectedCountry}
                          className="w-full px-4 py-3 border border-[#E9EAEA] rounded-[10px] bg-white flex items-center justify-between text-left disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className={selectedVisaTypeId ? "text-[#24282E]" : "text-[#727A90]"}>
                            {selectedVisaTypeId
                              ? visaTypes.find((vt) => vt.id === selectedVisaTypeId)?.name
                              : !selectedCountry
                              ? "Please select a country first"
                              : visaTypes.length === 0
                              ? "No visa types available"
                              : "Select Visa Type"}
                          </span>
                          <ChevronDown className="w-5 h-5 text-[#727A90]" />
                        </button>
                        {showVisaTypeDropdown && selectedCountry && (
                          <>
                            <div
                              className="fixed inset-0 z-[5]"
                              onClick={() => setShowVisaTypeDropdown(false)}
                            />
                            <div className="absolute z-10 w-full mt-2 bg-white border border-[#E9EAEA] rounded-[10px] shadow-lg max-h-60 overflow-y-auto">
                              {visaTypes.length === 0 ? (
                                <div className="px-4 py-3 text-[#727A90]">No visa types available for {selectedCountry.name}</div>
                              ) : (
                                visaTypes.map((visaType) => (
                                  <button
                                    key={visaType.id}
                                    type="button"
                                    onClick={() => {
                                      setSelectedVisaTypeId(visaType.id);
                                      setShowVisaTypeDropdown(false);
                                    }}
                                    className="w-full px-4 py-3 text-left hover:bg-[#42DA8210] transition-colors border-b border-[#E9EAEA] last:border-b-0"
                                  >
                                    <div className="font-medium text-[#24282E]">{visaType.name}</div>
                                    <div className="text-[12px] text-[#727A90]">{visaType.description}</div>
                                  </button>
                                ))
                              )}
                            </div>
                          </>
                        )}
                      </div>
                      {!selectedCountry && (
                        <p className="text-[12px] text-[#727A90] mt-1">Please select a country first</p>
                      )}
                      </div>
                    </div>

                    {/* Phone, Email, Passport Number, and Price Paid */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* Phone Number */}
                      <div>
                        <label className="block text-[14px] font-[500] text-[#24282E] mb-2">
                          Phone
                        </label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full px-4 py-3 border border-[#E9EAEA] rounded-[10px] focus:outline-none focus:border-[#42DA82]"
                          placeholder="Enter phone number"
                        />
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-[14px] font-[500] text-[#24282E] mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full px-4 py-3 border border-[#E9EAEA] rounded-[10px] focus:outline-none focus:border-[#42DA82]"
                          placeholder="Enter email address"
                        />
                      </div>

                      {/* Passport Number (optional) */}
                      <div>
                        <label className="block text-[14px] font-[500] text-[#24282E] mb-2">
                          Passport Number
                        </label>
                        <input
                          type="text"
                          value={passportNumber}
                          onChange={(e) => setPassportNumber(e.target.value)}
                          className="w-full px-4 py-3 border border-[#E9EAEA] rounded-[10px] focus:outline-none focus:border-[#42DA82]"
                          placeholder="Enter passport number (optional)"
                        />
                      </div>

                      {/* Price Paid (optional) */}
                      <div>
                        <label className="block text-[14px] font-[500] text-[#24282E] mb-2">
                          Price Paid
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={pricePaid}
                          onChange={(e) => setPricePaid(e.target.value)}
                          className="w-full px-4 py-3 border border-[#E9EAEA] rounded-[10px] focus:outline-none focus:border-[#42DA82]"
                          placeholder="Enter price paid (optional)"
                        />
                      </div>
                    </div>

                    {/* Internal Notes */}
                    <div>
                      <label className="block text-[14px] font-[500] text-[#24282E] mb-2">
                        Raw Data
                      </label>
                      <textarea
                        value={internalNotes}
                        onChange={(e) => setInternalNotes(e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 border border-[#E9EAEA] rounded-[10px] focus:outline-none focus:border-[#42DA82] resize-none"
                        placeholder="Enter raw data..."
                      />
                    </div>

                    {/* File Uploads */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* Passport Photo */}
                      <div>
                        <label className="block text-[14px] font-[500] text-[#24282E] mb-2">
                          Passport Photo
                        </label>
                        <div className="border border-[#E9EAEA] rounded-[10px] p-4">
                          <input
                            type="file"
                            accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                            onChange={(e) => handleFileChange(setPassportPhoto, e)}
                            className="w-full text-[12px] text-[#727A90]"
                          />
                          <p className="text-[12px] text-[#727A90] mt-2">
                            Accepted: JPG, PNG
                          </p>
                          {passportPhoto && (
                            <p className="text-[12px] text-[#42DA82] mt-1">
                              Selected: {passportPhoto.name}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* User Photo */}
                      <div>
                        <label className="block text-[14px] font-[500] text-[#24282E] mb-2">
                          User Photo
                        </label>
                        <div className="border border-[#E9EAEA] rounded-[10px] p-4">
                          <input
                            type="file"
                            accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                            onChange={(e) => handleFileChange(setUserPhoto, e)}
                            className="w-full text-[12px] text-[#727A90]"
                          />
                          <p className="text-[12px] text-[#727A90] mt-2">
                            Accepted: JPG, PNG
                          </p>
                          {userPhoto && (
                            <p className="text-[12px] text-[#42DA82] mt-1">
                              Selected: {userPhoto.name}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Other Documents */}
                      <div>
                        <label className="block text-[14px] font-[500] text-[#24282E] mb-2">
                          Other Documents
                        </label>
                        <div className="border border-[#E9EAEA] rounded-[10px] p-4">
                          <input
                            type="file"
                            accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                            onChange={(e) => handleFileChange(setOtherDocuments, e)}
                            className="w-full text-[12px] text-[#727A90]"
                          />
                          <p className="text-[12px] text-[#727A90] mt-2">
                            Accepted: JPG, PNG
                          </p>
                          {otherDocuments && (
                            <p className="text-[12px] text-[#42DA82] mt-1">
                              Selected: {otherDocuments.name}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-4 pt-4">
                      <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2 border border-[#E9EAEA] rounded-[12px] text-[#24282E] font-semibold hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="px-6 py-2 bg-[#42DA82] text-white rounded-[12px] font-semibold hover:bg-[#42DA82]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? "Creating..." : "Create Application"}
                      </button>
                    </div>
                  </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewApplication;
