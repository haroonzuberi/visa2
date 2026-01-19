"use client";

import { useRouter } from "next/navigation";
import { Formik, Form } from "formik";
import { useAppDispatch, useAppSelector } from "@/store";
import styles from "./../styles.module.css";
import Button from "@/components/ui/button/button";
import InputField from "@/components/ui/input/input";
import Image from "next/image";
import LoginLogo from "../../../Assets/Images/LoginLogo.png";
import { forgotPassword } from "@/store/slices/authSlice";
import { forgotPasswordSchema } from "@/utils/validationSchema";
import { useTranslation } from "react-i18next";
import { Trans } from "react-i18next";
import i18n from "@/i18n";

const ForgotPassword = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector((state) => state.auth);
  const { t } = useTranslation();

  const initialValues = {
    email: "",
  };

  const handleSubmit = async (values: typeof initialValues) => {
    try {
      await dispatch(forgotPassword(values.email)).unwrap();
      const encodedEmail = encodeURIComponent(values.email);
      // Navigate to OTP page with email parameter
      router.push(`/auth/otp?email=${encodedEmail}`);
    } catch (error) {
      console.error("Forgot password error:", error);
    }
  };

  return (
    <div className={styles.containerauth} dir={i18n.language === "he" ? "rtl" : "ltr"}>
      <div className={styles.card}>
        <div className="flex items-center justify-center flex-col gap-7">
          <Image
            src={LoginLogo}
            alt="Login Logo"
            width={156}
            height={93}
            className={styles.LoginLogo}
          />
          <h2 className={styles.title}>{t("forgotPasswordTitle")}</h2>
          <div className="flex items-center justify-center">
            <span className={`${styles.WelcomeText} w-[80%]`}>
              {t("forgotPasswordDescription")}
            </span>
          </div>
        </div>
        <Formik
          initialValues={initialValues}
          validationSchema={forgotPasswordSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, handleChange, handleBlur }) => (
            <Form className="flex flex-col gap-5 mt-[20px]">
              <InputField
                fieldName="email"
                placeHolder={t("enterYourEmail")}
                type="email"
                label={t("enterEmail")}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.email && errors.email}
              />
              <div className="mt-[10px]">
                <Button
                  buttonText={isLoading ? t("sending") : t("resetPassword")}
                  type="submit"
                  disabled={isLoading}
                />
              </div>
              <div>
                <p className={styles.pageDesc}>
                  <Trans
                    i18nKey="forgotPasswordPrivacyConsent"
                    components={{
                      privacyPolicyLink: (
                        <a href="/privacy-policy" className="text-black font-bold" />
                      ),
                    }}
                  />
                </p>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default ForgotPassword;