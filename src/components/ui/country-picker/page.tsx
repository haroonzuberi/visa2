import { useMemo } from "react";
import Select from "react-select";
import countryList from "react-select-country-list";
import styles from "./styles.module.css";

interface CountryPickerProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  touched?: boolean;
}

export default function CountryPicker({
  value,
  onChange,
  error,
  touched,
}: CountryPickerProps) {
  const options = useMemo(() => countryList().getData(), []);

  return (
    <div className={styles.selectWrapper}>
      <label className={styles.label}>Country</label>
      <Select
        options={options}
        isSearchable
        styles={{
          control: (baseStyles, state) => ({
            ...baseStyles,
            height: '50px',
            borderRadius: '12px',
            borderColor: '#e6e6e7',
            '&:hover': {
              borderColor: '#42DA82'
            }
          }),
          option: (baseStyles, state) => ({
            ...baseStyles,
            backgroundColor: state.isSelected ? '#e6e6e7' : 'white',
            '&:hover': {
              backgroundColor: '#f8f8f8'
            }
          })
        }}
        value={options.find((option: any) => option.label === value)}
        onChange={(selectedOption) => onChange(selectedOption?.label || '')}
      />
      {touched && error && (
        <span className={styles.error}>{error}</span>
      )}
    </div>
  );
} 