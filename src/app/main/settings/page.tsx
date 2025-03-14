"use client";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
// import { updateUser } from "@/store/slices/authSlice";
// import { AppDispatch, RootState } from "@/store/store";
import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import styles from "./styles.module.css";
import Image from "next/image";
import ProfileImage from "@/Assets/Images/generic-profile.png";
import InputField from "@/components/ui/input/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail } from "lucide-react";
import EmailSvg from "@/Assets/svgs/EmailSvg";
import PhoneSvg from "@/Assets/svgs/PhoneSvg";
import CopySvg from "@/Assets/svgs/CopySvg";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { AppDispatch, RootState } from "@/store";
import { updateUser } from "@/store/slices/usersSlice";

const validationSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  phone: Yup.string(),
  // .required("Phone is required"),
  newPassword: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .matches(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: Yup.string().oneOf(
    [Yup.ref("newPassword")],
    "Passwords must match"
  ),
});

export default function Settings() {
  const dispatch = useDispatch<AppDispatch>();
  const { user, isLoading } = useSelector((state: RootState) => state.auth);
  const [activeTab, setActiveTab] = useState("personal");
  const [businessSettings, setBusinessSettings] = useState({
    sendInvoices: "yes",
    allowCancel: "yes",
    apiKey: "",
    selectedStatuses: ["status1"],
    anyFee: "",
    whatFee: "",
  });

  const initialValues = {
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    newPassword: "",
    confirmPassword: "",
  };

  const handleBusinessSettingsChange = (field: string, value: any) => {
    setBusinessSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (values: any, { setSubmitting }: any) => {
    try {
      const updateData: any = {
        name: values.name,
        email: values.email,
        phone: values.phone,
        ...(values.newPassword && { password: values.newPassword }),
      };

      await dispatch(updateUser({ id: user.id, data: updateData }));
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.settingsContainer}>
      <h1 className={styles.header}>Settings</h1>

      <div className={styles.mainCard}>
        <div className={styles.gridLayout}>
          {/* Left Column - Profile Info */}
          <div className={styles.profileCard}>
            <div className={styles.profileCardInner}>
              <div className={styles.profileImageContainer}>
                <Image
                  src={user?.avatar || ProfileImage}
                  alt="Profile"
                  fill
                  className="object-cover"
                />
              </div>
              <h2 className={styles.profileName}>{user?.name}</h2>
              <p className={styles.profileRole}>{user?.role || "Manager"}</p>

              <div className="w-full mt-6 space-y-4">
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>ID</span>
                  <span className={styles.infoValue}>{user?.id}</span>
                </div>
                <div className={styles.infoItem}>
                  <div className="flex justify-between items-center w-full">
                    <p className={styles.infoLabel}>Email</p>
                    <CopySvg />
                  </div>
                  <span className={styles.infoValue}>{user?.email}</span>
                </div>
                <div className={styles.infoItem}>
                  <div className="flex justify-between items-center w-full">
                    <p className={styles.infoLabel}>Phone Number</p>
                    <CopySvg />
                  </div>
                  <span className={styles.infoValue}>{user?.phone}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Joined</span>
                  <span className={styles.infoValue}>{user?.created_at}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Settings Form */}
          <div className={styles.formSection}>
            <Tabs defaultValue="personal" className="w-full">
              <TabsList className="border-b border-[#E9EAEA] w-full justify-start gap-8">
                <TabsTrigger value="personal" className={styles.tabButton}>
                  Personal Info
                </TabsTrigger>
                <TabsTrigger value="business" className={styles.tabButton}>
                  Business Settings
                </TabsTrigger>
              </TabsList>

              <TabsContent value="personal" className="mt-6">
                <Formik
                  initialValues={initialValues}
                  validationSchema={validationSchema}
                  onSubmit={handleSubmit}
                  enableReinitialize
                >
                  {({ errors, touched, isSubmitting }) => (
                    <Form className="space-y-6">
                      <div>
                        <Field name="name">
                          {({ field }: any) => (
                            <InputField
                              {...field}
                              label="Name"
                              fieldName="name"
                              placeHolder="Enter Name"
                              error={touched.name && errors.name}
                            />
                          )}
                        </Field>

                        <div className="mt-[10px]">
                          <Field name="email">
                            {({ field }: any) => (
                              <InputField
                                {...field}
                                icon={<EmailSvg />}
                                label="Email"
                                fieldName="email"
                                type="email"
                                placeHolder="Enter Email"
                                error={touched.email && errors.email}
                              />
                            )}
                          </Field>
                        </div>

                        <div className="mt-[10px]">
                          <Field name="phone">
                            {({ field }: any) => (
                              <InputField
                                {...field}
                                label="Phone Number"
                                fieldName="phone"
                                icon={<PhoneSvg color="#727A90" />}
                                placeHolder="Enter Phone Number"
                                error={touched.phone && errors.phone}
                              />
                            )}
                          </Field>
                        </div>
                      </div>

                      <div className={styles.formGrid}>
                        <Field name="newPassword">
                          {({ field }: any) => (
                            <InputField
                              {...field}
                              label="New Password"
                              fieldName="newPassword"
                              isPassword={true}
                              type="password"
                              placeHolder="Enter New Password"
                              error={touched.newPassword && errors.newPassword}
                            />
                          )}
                        </Field>

                        <Field name="confirmPassword">
                          {({ field }: any) => (
                            <InputField
                              {...field}
                              label="Confirm New Password"
                              fieldName="confirmPassword"
                              type="password"
                              isPassword={true}
                              placeHolder="Confirm Password"
                              error={
                                touched.confirmPassword &&
                                errors.confirmPassword
                              }
                            />
                          )}
                        </Field>
                      </div>

                      <div className="flex justify-start mt-8">
                        <Button
                          type="submit"
                          className={styles.saveButton}
                          disabled={isSubmitting || isLoading}
                        >
                          {isSubmitting || isLoading
                            ? "Saving..."
                            : "Save Changes"}
                        </Button>
                      </div>
                    </Form>
                  )}
                </Formik>
              </TabsContent>

              <TabsContent value="business" className="mt-6">
                <form className="">
                  {/* Send Invoices Section */}
                  <div className="">
                    <h3 className={styles.settingLabel}>
                      Send invoices to customers automatically?
                    </h3>
                    <RadioGroup
                      defaultValue={businessSettings.sendInvoices}
                      onValueChange={(value) =>
                        handleBusinessSettingsChange("sendInvoices", value)
                      }
                      className="flex gap-4 "
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="send-yes" />
                        <Label
                          className={styles.radioCheckLabel}
                          htmlFor="send-yes"
                        >
                          Yes
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="send-no" />
                        <Label
                          className={styles.radioCheckLabel}
                          htmlFor="send-no"
                        >
                          No
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* API Key Section */}
                  <div className="mt-[20px]">
                    <InputField
                      fieldName="apiKey"
                      label="Payment provider API key"
                      placeHolder="Enter API Key"
                      onChange={(e) =>
                        handleBusinessSettingsChange("apiKey", e.target.value)
                      }
                    />
                  </div>

                  {/* Allow Cancel Section */}
                  <div className="mt-[20px]">
                    <h3 className={styles.settingLabel}>
                      Allow users to cancel?
                    </h3>
                    <RadioGroup
                      defaultValue={businessSettings.allowCancel}
                      onValueChange={(value) =>
                        handleBusinessSettingsChange("allowCancel", value)
                      }
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="cancel-yes" />
                        <Label
                          className={styles.radioCheckLabel}
                          htmlFor="cancel-yes"
                        >
                          Yes
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="cancel-no" />
                        <Label
                          className={styles.radioCheckLabel}
                          htmlFor="cancel-no"
                        >
                          No
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Status Section */}
                  <div className="mt-[20px]">
                    <h3 className={styles.settingLabel}>In what Status</h3>
                    <div className="flex flex-row flex-wrap mt-[10px]">
                      {[
                        "Status Value",
                        "Status Value",
                        "Status Value",
                        "Status Value",
                      ].map((status, index) => (
                        <div
                          key={index}
                          className="flex items-center mr-[20px]"
                        >
                          <Checkbox
                            checked={businessSettings.selectedStatuses.includes(
                              `status${index + 1}`
                            )}
                            className="mr-[10px]"
                            onCheckedChange={(checked) => {
                              const newStatuses = checked
                                ? [
                                    ...businessSettings.selectedStatuses,
                                    `status${index + 1}`,
                                  ]
                                : businessSettings.selectedStatuses.filter(
                                    (s) => s !== `status${index + 1}`
                                  );
                              handleBusinessSettingsChange(
                                "selectedStatuses",
                                newStatuses
                              );
                            }}
                          />
                          <Label
                            className={styles.radioCheckLabel}
                            htmlFor={`status-${index}`}
                          >
                            {status}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Fee Section */}
                  <div className="grid grid-cols-2 gap-6 mt-[20px]">
                    <div className="space-y-4">
                      <InputField
                        fieldName="anyFee"
                        label="Any Fee?"
                        placeHolder="Enter fee amount"
                        onChange={(e) =>
                          handleBusinessSettingsChange("anyFee", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-4">
                      <InputField
                        fieldName="whatFee"
                        label="What Fee"
                        placeHolder="Enter fee description"
                        onChange={(e) =>
                          handleBusinessSettingsChange(
                            "whatFee",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>

                  <div className="flex justify-end mt-8">
                    <Button type="submit" className={styles.saveButton}>
                      Save Changes
                    </Button>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
