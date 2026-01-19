"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import Image from "next/image";
import styles from "./../styles.module.css";
import Button from "@/components/ui/button/button";
import InputField from "@/components/ui/input/input";
import LoginLogo from "../../../Assets/Images/LoginLogo.png";
import { useAppDispatch, useAppSelector } from "@/store";
import {Suspense} from "react";
import { resetPassword } from "@/store/slices/authSlice";

export default function NewPassword() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector((state) => state.auth);
  const searchParams = useSearchParams();
  const [email, setEmail] = useState<string>("");
  const [otp, setOtp] = useState<string>("");

  useEffect(() => {
    const emailParam = searchParams.get("email");
    const otpParam = searchParams.get("otp");

    if (!emailParam || !otpParam) {
      toast.error("Required information missing. Please try again");
      router.push("/auth/forgot-password");
      return;
    }

    setEmail(decodeURIComponent(emailParam));
    setOtp(decodeURIComponent(otpParam));
  }, [searchParams, router]);

  const initialValues = {
    newPassword: "",
    confirmPassword: "",
  };

  const resetPasswordSchema = Yup.object().shape({
    newPassword: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("New password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("newPassword")], "Passwords must match")
      .required("Confirm password is required"),
  });

  const handleSubmit = async (values: typeof initialValues) => {
    try {
      await dispatch(
        resetPassword({
          email: email,
          new_password: values.newPassword, // Changed to match API expectation
          pin: otp,
        })
      ).unwrap();

      toast.success("Password reset successfully");
      setTimeout(() => {
        router.push("/auth/login");
      }, 1500); // Give time for the success message to be seen
    } catch (error) {
      console.error("Reset password error:", error);
      // Error toast is handled in the thunk
    }
  };
  return (
    <div className={styles.containerauth}>
      <div className={styles.card}>
        <div>
          <div className="flex items-center justify-center flex-col gap-7">
            <Image
              src={LoginLogo}
              alt="Logo"
              width={156}
              height={93}
              className={styles.LoginLogo}
            />
            <h2 className={styles.title}>Reset Password</h2>
            <span className={styles.WelcomeText}>
              Please enter your new password
            </span>
          </div>

          <Formik
            initialValues={initialValues}
            validationSchema={resetPasswordSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched, handleChange, handleBlur }) => (
              <Form className="flex flex-col gap-6">
                <div className="space-y-4">
                  <InputField
                    fieldName="newPassword"
                    label="New Password"
                    placeHolder="Enter new password"
                    type="password"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.newPassword && errors.newPassword}
                  />

                  <InputField
                    fieldName="confirmPassword"
                    label="Confirm Password"
                    placeHolder="Confirm your password"
                    type="password"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.confirmPassword && errors.confirmPassword}
                  />
                </div>

                <div className="mt-2">
                  <Button
                    buttonText={isLoading ? "Resetting..." : "Reset Password"}
                    type="submit"
                    disabled={isLoading}
                  />
                </div>

                <div className="text-center mt-4">
                  <span
                    className="text-primary cursor-pointer"
                    onClick={() => router.push("/auth/login")}
                  >
                    Back to Login
                  </span>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
}
