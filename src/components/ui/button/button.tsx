"use client";
import React from "react";
import "./style.modules.css";
import i18n from "@/i18n";

interface ButtonProps {
  buttonText: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
}

const Button = ({
  buttonText,
  onClick,
  type = "button",
  disabled = false,
}: ButtonProps) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`btn-primary ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      aria-label={buttonText}
      dir={i18n.language === "he" ? "rtl" : "ltr"}
    >
      {buttonText}
    </button>
  );
};

export default Button;