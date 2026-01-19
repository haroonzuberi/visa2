"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Formik, Form } from "formik";
import styles from "./../styles.module.css";
import Button from "@/components/ui/button/button";
import LoginLogo from "../../../Assets/Images/LoginLogo.png";
import InputField from "@/components/ui/input/input";
import { useAppDispatch, useAppSelector } from "@/store";
import { loginSchema } from "@/utils/validationSchema";
import { loginUser } from "@/store/slices/authSlice";
import { useTranslation } from "react-i18next";
import i18n from "@/i18n";

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector((state) => state.auth);
  const { token } = useAppSelector((state) => state.auth);
  const { t } = useTranslation();

  const initialValues = {
    email: "",
    password: "",
  };

  const handleSubmit = async (values: typeof initialValues) => {
    try {
      console.log("Form submitted with values:", values);
      const result = await dispatch(
        loginUser({
          username: values.email,
          password: values.password,
        })
      ).unwrap();

      console.log("Login result:", result);

      if (result) {
        router.push("/main/dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  useEffect(() => {
    console.log("TOKEN_____", token);
    if (token && token !== "undefined" && token !== "null") {
      console.log("TOKEN___222__", token);
      router.push("/main/dashboard");
    }
  }, [token, router]);

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
          <h2 className={styles.title}>{t("signInLogIn")}</h2>
          <span className={styles.WelcomeText}>{t("welcomeBack")}</span>
        </div>
        <Formik
          initialValues={initialValues}
          validationSchema={loginSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, handleChange, handleBlur }) => (
            <Form className="flex flex-col gap-5">
              <InputField
                fieldName="email"
                placeHolder={t("email")}
                type="email"
                label={t("email")}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.email && errors.email}
              />
              <InputField
                fieldName="password"
                label={t("enterYourPassword")}
                placeHolder={t("password")}
                type="password"
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.password && errors.password}
              />
              <div
                onClick={() => router.push("/auth/forgot-password")}
                className="cursor-pointer"
              >
                <p className="text-[16px] font-[500] text-primary">
                  {t("forgotPassword")}
                </p>
              </div>
              <Button
                buttonText={isLoading ? t("loggingIn") : t("login")}
                type="submit"
                disabled={isLoading}
              />

              <div>
                <p className={styles.pageDesc}>
                  {t("privacyConsent", {
                    privacyPolicy: t("privacyPolicy"),
                  })}
                </p>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}