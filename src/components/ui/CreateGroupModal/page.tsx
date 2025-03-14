import { postAPIWithAuth } from "@/utils/api";
import { Form, Formik } from "formik";
import { useState } from "react";
import { toast } from "react-toastify";
import * as Yup from "yup";
import InputField from "../input/input";
import PhoneInputField from "../phone-input/page";
import Button from "../button/button";

export default function CreateGroupModal({
  handleSelectGroup,
  setShowCreateForm,
}) {
  const initialValues = {
    name: "",
    contact_email: "",
    contact_phone: "",
    description: "",
    contact_name: "",
  };
  const [isLoading, setIsLoading] = useState(false);

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
  const handleCreateNewGroup = async (
    values: any,
  ) => {
    try {
      //   if (isLoading) return; // Prevent double submission
      //   setIsLoading(true);
      //   const response: any = await postAPIWithAuth("groups/", values);
      //   if (response.success) {
      //     const newGroup = response.data.data;
      //     console.log("newGroup", newGroup);
      //     handleSelectGroup(newGroup);
      //     setShowCreateForm(false);
      //     resetForm();
      //     toast.success("Group created successfully");
      //   }
    } catch (error) {
      console.error("Error creating group:", error);
      toast.error("Failed to create group");
    } finally {
      setIsLoading(false);
    }
  };

  // Va
  return (
    <div className=" fixed inset-0 z-90 overflow-y-auto">
      <div className="fixed inset-0 bg-black/10 backdrop-blur-sm">
        <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-h-[90vh]">
          <div className="bg-white rounded-xl w-[80vw] xl:w-[800px] lg:w-[800px] md:w-[800px] h-[700px] overflow-y-auto shadow-lg; px-[30px] py-[20px]">
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

                    {/* <Button
                      buttonText={isLoading ? "Resetting..." : "Reset Password"}
                      type="submit"
                      disabled={isLoading}
                    /> */}
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>
    </div>
  );
}
