"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import Button from "@/components/ui/button/button";
import LoginLogo from "../../../Assets/Images/LoginLogo.png";
import styles from "./../styles.module.css";
import { useRouter, useSearchParams } from "next/navigation";
import "./../../globals.css";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "@/store";
import OTPInput from "react-otp-input";
import { verifyResetPin } from "@/store/slices/authSlice";
import { useTranslation } from "react-i18next";
import i18n from "@/i18n";

export default function OTPPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [OTP, setOTP] = useState("");
  const [email, setEmail] = useState<string>("");
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector((state) => state.auth);
  const { t } = useTranslation();

  useEffect(() => {
    // Get email from URL parameters
    const emailParam = searchParams.get("email");
    console.log("decoded", emailParam);
    if (!emailParam) {
      toast.error(t("emailNotFound"));
      router.push("/auth/forgot-password");
      return;
    }
    setEmail(decodeURIComponent(emailParam));
  }, [searchParams, router, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (OTP.length !== 4) {
      toast.error(t("invalidPin"));
      return;
    }

    try {
      await dispatch(
        verifyResetPin({
          email: email,
          pin: OTP,
        })
      ).unwrap();

      // After successful verification, redirect to reset password page
      router.push(
        `/auth/new-password?email=${encodeURIComponent(
          email
        )}&otp=${encodeURIComponent(OTP)}`
      );
    } catch (error) {
      console.error("OTP verification error:", error);
      toast.error(t("otpVerificationFailed"));
    }
  };

  return (
    <div className={styles.containerauth} dir={i18n.language === "he" ? "rtl" : "ltr"}>
      <div className={styles.card}>
        <div>
          <div className="flex items-center justify-center flex-col gap-7">
            <Image
              src={LoginLogo}
              alt="Example Image"
              width={156}
              height={93}
              className={styles.LoginLogo}
            />
            <h2 className={styles.title}>{t("otpTitle")}</h2>
            <span className={styles.WelcomeText}>
              {t("otpDescription")}
            </span>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className={styles.otpContainer}>
              <p className={styles.otpCheckMailText}>
                {t("otpDescription")}
              </p>
              <OTPInput
                value={OTP}
                onChange={setOTP}
                numInputs={4}
                renderInput={(props) => <input {...props} />}
                inputStyle={styles.otpInput}
                shouldAutoFocus={true}
                containerStyle={i18n.language === "he" ? { direction: "rtl" } : { direction: "ltr" }}
              />
            </div>

            <p className={styles.resendText}>
              {t("enterCodeToContinue")}
            </p>
            <Button
              buttonText={isLoading ? t("verifying") : t("continueToResetPassword")}
              type="submit"
              disabled={OTP.length !== 4 || isLoading}
            />
          </form>
        </div>
      </div>
    </div>
  );
}