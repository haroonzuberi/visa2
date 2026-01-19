import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import styles from "./styles.module.css";

interface PhoneInputFieldProps {
  value: string;
  onChange: (value: string) => void;
  error?: any;
  touched?: any;
}

export default function PhoneInputField({
  value,
  onChange,
  error,
  touched,
}: PhoneInputFieldProps) {
  return (
    <div className={styles.inputWrapper}>
      <label className={styles.label}>Phone</label>
      <div className="relative w-full">
        <PhoneInput
          country={"us"}
          value={value}
          onChange={(phone) => onChange(phone)}
          inputClass="!w-full !h-[50px] !py-3 !pl-16  !pr-[100px] !text-gray-800  !bg-white !border !border-[#E9EAEA] !rounded-[12px] !focus:border-blue-500 !focus:ring-2 !focus:ring-blue-300 transition-all"
          containerClass="!w-full"
          buttonClass="!bg-gray-100 !border-r !border-[#E9EAEA] !py-4 !px-[10px] !rounded-l-[12px] !h-[50px]r"
          dropdownClass="!bg-white  !shadow-lg !rounded-lg "
          searchClass="!bg-gray-100 !text-gray-800 !p-2 !rounded-md !border !border-border-[#E9EAEA] !focus:border-blue-400 !focus:ring-1 !focus:ring-blue-300 transition-all"
          enableSearch
          searchPlaceholder="Search country..."
        />
      </div>
      {touched && error && <span className={styles.error}>{error}</span>}
    </div>
  );
}
