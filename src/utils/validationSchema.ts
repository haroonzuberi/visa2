import i18n from "@/i18n";
import * as Yup from "yup";

export const loginSchema = Yup.object().shape({
  email: Yup.string()
    .email(i18n.t("invalidEmail"))
    .required(i18n.t("emailRequired")),
  password: Yup.string()
    .min(6, i18n.t("passwordMinLength"))
    .required(i18n.t("passwordRequired")),
});

export const forgotPasswordSchema = Yup.object().shape({
  email: Yup.string()
    .email(i18n.t("invalidEmail"))
    .required(i18n.t("emailRequired")),
});