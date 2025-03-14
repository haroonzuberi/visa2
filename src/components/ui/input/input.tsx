"use client";
import React, { useState } from "react";
import "./style.modules.css";
import { Eye, EyeOff } from "lucide-react";

interface InputFieldProps {
  fieldName: string;
  placeHolder: string;
  type?: string;
  label?: string;
  isPassword?: boolean;
  icon?: React.ReactNode;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  error?: any;
  disabled?: boolean;
  value?: string;
}

const InputField = ({
  fieldName,
  label,
  placeHolder,
  type = "text",
  isPassword = false,
  icon,
  onChange,
  value,
  onBlur,
  error,
  disabled = false,
}: InputFieldProps) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex flex-col items-start gap-2 w-full">
      <div className="flex items-center gap-2">
        {icon && <span className="text-gray-500">{icon}</span>}
        <span className="text-[18px] highlight-color font-[500] font-jakarta text-[#24282E]">
          {label ? label : fieldName}
        </span>
      </div>
      <div className="w-full relative">
        <input
          className={`input-text w-full pr-10 pl-10 ${
            error
              ? "focus:border-danger focus:outline-none focus:ring-1 focus:ring-danger border-danger"
              : "focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          }`}
          type={isPassword ? (showPassword ? "text" : "password") : type}
          name={fieldName}
          placeholder={placeHolder}
          onChange={onChange}
          disabled={disabled}
          onBlur={onBlur}
          value={value}
       
        />
        {isPassword && (
          <button
            type="button"
            className="absolute inset-y-0 right-3 flex items-center text-gray-500"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
        {error && (
          <span className="text-danger text-sm mt-1 block">{error}</span>
        )}
      </div>
    </div>
  );
};

export default InputField;
