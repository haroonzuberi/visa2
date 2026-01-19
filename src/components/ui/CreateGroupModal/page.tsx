import { postAPIWithAuth } from "@/utils/api";
import { useState } from "react";
import { toast } from "react-toastify";
import InputField from "../input/input";
import PhoneInputField from "../phone-input/page";
import Button from "../button/button";

export default function CreateGroupModal({
  handleSelectGroup,
  setShowCreateForm,
}) {
  const [formData, setFormData] = useState({
    name: "",
    contact_email: "",
    contact_phone: "",
    description: "",
    contact_name: "",
  });
  const [errors, setErrors] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    let newErrors:any = {};
    if (!formData.name) newErrors.name = "Group Name is required";
    if (!formData.contact_name)
      newErrors.contact_name = "Contact Name is required";
    if (!formData.contact_email) {
      newErrors.contact_email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact_email)) {
      newErrors.contact_email = "Invalid email format";
    }
    if (!formData.contact_phone)
      newErrors.contact_phone = "Phone number is required";
    if (!formData.description)
      newErrors.description = "Description is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateNewGroup = async () => {
    if (!validate()) return;
    try {
      setIsLoading(true);
      const response:any = await postAPIWithAuth("groups/", formData);
      if (response.success) {
        handleSelectGroup(response.data.data);
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
    <div className="fixed inset-0 z-90 overflow-y-auto">
      <div className="fixed inset-0 bg-black/10 backdrop-blur-sm">
        <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-h-[90vh]">
          <div className="bg-white rounded-xl w-[80vw] xl:w-[800px] lg:w-[800px] md:w-[800px] h-[700px] overflow-y-auto shadow-lg px-[30px] py-[20px]">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Create New Group
            </h3>
            <InputField
              type="text"
              placeHolder="Enter group name"
              value={formData.name}
              onChange={handleChange}
              label="Group Name"
              fieldName="name"
              error={errors.name}
            />
            <InputField
              type="text"
              placeHolder="Enter contact name"
              value={formData.contact_name}
              onChange={handleChange}
              label="Contact Name"
              fieldName="contact_name"
              error={errors.contact_name}
            />
            <InputField
              label="Email"
              type="email"
              placeHolder="Enter contact email"
              value={formData.contact_email}
              onChange={handleChange}
              fieldName="contact_email"
              error={errors.contact_email}
            />
            <PhoneInputField
              value={formData.contact_phone}
              onChange={(value) =>
                setFormData({ ...formData, contact_phone: value })
              }
              error={errors.contact_phone}
            />
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Description
              </label>
              <textarea
                placeholder="Add a short description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring focus:ring-green-300 focus:outline-none transition"
                rows={3}
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.description}
                </p>
              )}
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-5 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateNewGroup}
                className="px-5 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? "Creating..." : "Create Group"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
