// components/Chip.tsx
import React, { useState, useRef, useEffect } from 'react';
import styles from "./../../../app/main/customerDetails/[id]/styles.module.css";
import DropDownRedSvg from '@/Assets/svgs/DropdownRedSvg';

// Expandable Icon (Chevron Down/Right)
const ExpandableIcon = () => (
  <svg
    className="w-4 h-4 ml-1"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 5l7 7-7 7"
    />
  </svg>
);

// Dropdown Icon (Down Arrow)
const DropDownSvg = () => (
  <svg
    className="w-4 h-4 ml-1"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 9l-7 7-7-7"
    />
  </svg>
);

// Checkmark Icon (for Add Application ID, as shown in Figma)
const CheckmarkIcon = () => (
  <svg
    className="w-4 h-4 ml-1 text-green-500"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 13l4 4L19 7"
    />
  </svg>
);

type HoverItem = 'haveIssues' | 'govPaid' | 'cancel';

interface ChipProps {
  status: string;
  className?: string; // Added optional className prop
}

const Chip = ({ status, className }: ChipProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<HoverItem | null>(null);
  const [cancelCheckbox, setCancelCheckbox] = useState(false); // State for Cancel checkbox
  const [cancelInput, setCancelInput] = useState(''); // State for Cancel input
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null); // State for selected issue in Have Issues
  const [otherIssueInput, setOtherIssueInput] = useState(''); // State for Other issue input
  const [govPaidCheckbox, setGovPaidCheckbox] = useState(false); // State for Gov fee paid checkbox
  const [govPaidInput, setGovPaidInput] = useState(''); // State for Gov fee paid input
  const chipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sample array of issues for Have Issues (you can replace this with dynamic data)
  const issues = [
    'Issue 1: Payment Delay',
    'Issue 2: Documentation Error',
    'Issue 3: Technical Glitch',
    'Issue 4: Missing Information',
  ];

  // Close dropdown if clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (chipRef.current && !chipRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setHoveredItem(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleMouseEnter = (item: HoverItem) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setHoveredItem(item);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setHoveredItem(null);
    }, 200);
  };

  // Cleanup timeout on unmount or when state changes
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="relative inline-block" ref={chipRef}>
      {/* Chip */}
      <span
        className={`${styles.tableChip} flex items-center gap-1`}
        onClick={toggleDropdown}
      >
        {status}
        <DropDownRedSvg />
      </span>

      {/* Main Dropdown Menu */}
      {isOpen && (
        <div className={`absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 ${styles.dropdownItem}`}>
          <ul className="py-1">
            <li className={`px-4 py-2 border-b-[1px] border-b-[#E9EAEA] hover:bg-gray-100 cursor-pointer border-bottom ${styles.dropdownText}`}>
              New
            </li>
            <li className={`px-4 py-2 border-b-[1px] border-b-[#E9EAEA] hover:bg-gray-100 cursor-pointer ${styles.dropdownText}`}>
              Ready to be applied
            </li>
            <li
              className={`px-4 py-2 hover:bg-gray-100 border-b-[1px] border-b-[#E9EAEA] cursor-pointer relative flex items-center ${styles.dropdownText}`}
              onMouseEnter={() => handleMouseEnter('haveIssues')}
              onMouseLeave={handleMouseLeave}
            >
              <ExpandableIcon />
              Have Issues
              {hoveredItem === 'haveIssues' && (
                <div className="absolute right-full top-0 mt-0 mr-2 w-48 bg-white rounded-md shadow-lg z-20">
                  <ul className="py-1">
                    {issues.map((issue, index) => (
                      <li key={index} className={`px-4 py-2 hover:bg-gray-100 border-b-[1px] border-b-[#E9EAEA] flex items-center ${styles.dropdownText}`}>
                        <input
                          type="radio"
                          name="issue"
                          value={issue}
                          checked={selectedIssue === issue}
                          onChange={() => setSelectedIssue(issue)}
                          className="mr-2"
                        />
                        {issue}
                      </li>
                    ))}
                    <li className={`px-4 py-2 hover:bg-gray-100 flex items-center ${styles.dropdownText}`}>
                      <input
                        type="radio"
                        name="issue"
                        value="other"
                        checked={selectedIssue === 'other'}
                        onChange={() => setSelectedIssue('other')}
                        className="mr-2"
                      />
                      Other
                    </li>
                    {selectedIssue === 'other' && (
                      <li className="px-4 py-2">
                        <input
                          type="text"
                          value={otherIssueInput}
                          onChange={(e) => setOtherIssueInput(e.target.value)}
                          placeholder="Enter your issue..."
                          className="w-full p-2 border border-gray-300 rounded-md text-sm"
                        />
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </li>
            <li className={`px-4 py-2 hover:bg-gray-100 border-b-[1px] border-b-[#E9EAEA] cursor-pointer ${styles.dropdownText}`}>
              Need to pay gov fee
            </li>
            <li
              className={`px-4 py-2 hover:bg-gray-100 border-b-[1px] border-b-[#E9EAEA] cursor-pointer relative flex items-center ${styles.dropdownText}`}
              onMouseEnter={() => handleMouseEnter('govPaid')}
              onMouseLeave={handleMouseLeave}
            >
              <ExpandableIcon />
              Gov fee paid
              {hoveredItem === 'govPaid' && (
                <div className="absolute right-full top-0 mt-0 mr-2 w-48 bg-white rounded-md shadow-lg z-20">
                  <ul className="py-1">
                    <li className="px-4 py-2 hover:bg-gray-100 flex items-center">
                      <input
                        type="checkbox"
                        checked={govPaidCheckbox}
                        onChange={(e) => setGovPaidCheckbox(e.target.checked)}
                        className="mr-2"
                      />
                      <span className={styles.dropdownText}>
                        Add Application ID
                      </span>
                      {govPaidCheckbox && <CheckmarkIcon />}
                    </li>
                    {govPaidCheckbox && (
                      <li className="px-4 py-2">
                        <input
                          type="text"
                          value={govPaidInput}
                          onChange={(e) => setGovPaidInput(e.target.value)}
                          placeholder="Enter Application ID..."
                          className="w-full p-2 border border-gray-300 rounded-md text-sm"
                        />
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </li>
            <li
              className={`px-4 py-2 hover:bg-gray-100 border-b-[1px] border-b-[#E9EAEA] cursor-pointer relative flex items-center ${styles.dropdownText}`}
              onMouseEnter={() => handleMouseEnter('cancel')}
              onMouseLeave={handleMouseLeave}
            >
              <ExpandableIcon />
              Cancel
              {hoveredItem === 'cancel' && (
                <div className="absolute right-full top-0 mt-0 mr-2 w-48 bg-white rounded-md shadow-lg z-20">
                  <ul className="py-1">
                    <li className="px-4 py-2 hover:bg-gray-100 flex items-center">
                      <input
                        type="checkbox"
                        checked={cancelCheckbox}
                        onChange={(e) => setCancelCheckbox(e.target.checked)}
                        className="mr-2"
                      />
                      <span className={styles.dropdownText}>
                        Add Reason
                      </span>
                    </li>
                    {cancelCheckbox && (
                      <li className="px-4 py-2">
                        <input
                          type="text"
                          value={cancelInput}
                          onChange={(e) => setCancelInput(e.target.value)}
                          placeholder="Enter notes..."
                          className="w-full p-2 border border-gray-300 rounded-md text-sm"
                        />
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </li>
            <li className={`px-4 py-2 hover:bg-gray-100 cursor-pointer ${styles.dropdownText}`}>
              Resend invite
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default Chip;