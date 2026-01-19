import * as React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DropDownProps {
  fieldName: string;
  label?: string;
  options: string[] | number[];
  icon?: React.ReactNode;
  onChange?: (value: string) => void;
  defaultValue?: string;
}

const DropDown: React.FC<DropDownProps> = ({
  fieldName,
  label,
  options,
  icon,
  onChange,
  defaultValue = "",
}) => {
  const [selectedValue, setSelectedValue] = React.useState<string | number>(
    defaultValue
  );

  const handleChange = (value: string) => {
    setSelectedValue(value);
    if (onChange) {
      onChange(value);
    }
  };

  return (
    <div className="flex flex-col items-start gap-2 w-full">
      {/* Label and Icon */}
      <div className="flex items-center gap-2">
        {icon && <span className="text-gray-500">{icon}</span>}
        <span className="text-[18px] font-[500] highlight-color font-jakarta text-[#24282E]">
          {label ? label : fieldName}
        </span>
      </div>

      {/* Dropdown */}
      <Select onValueChange={handleChange} defaultValue={defaultValue}>
        <SelectTrigger className="w-full text-[#727A90] h-[52px] bg-transparent border-2 border-[#E9EAEA] rounded-[12px] px-3 py-2 text-[18px] font-[400] focus:border-primary focus:ring-1 focus:ring-primary">
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent className="bg-white border border-[#E9EAEA] rounded-[12px] shadow-md">
          <SelectGroup>
            {options.map((ele, index) => (
              <SelectItem
                key={index}
                value={String(ele)}
                className="text-[18px] font-[400] px-4 py-2 hover:bg-[#F3F4F6] text-[#727A90] cursor-pointer transition-all duration-200"
              >
                {ele}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export default DropDown;
