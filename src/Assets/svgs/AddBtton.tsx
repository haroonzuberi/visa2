import * as React from "react";
const AddButton = (props) => (
  <svg
    width={32}
    height={32}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <rect x={0.5} y={0.5} width={31} height={31} rx={9.5} stroke="#E9EAEA" />
    <g clipPath="url(#clip0_326_14595)">
      <path
        d="M23.3333 15.3333H16.6667V8.66666C16.6667 8.29847 16.3682 8 16 8C15.6318 8 15.3333 8.29847 15.3333 8.66666V15.3333H8.66666C8.29847 15.3333 8 15.6318 8 16C8 16.3682 8.29847 16.6667 8.66666 16.6667H15.3333V23.3333C15.3333 23.7015 15.6318 24 16 24C16.3682 24 16.6666 23.7015 16.6666 23.3333V16.6667H23.3333C23.7015 16.6667 23.9999 16.3682 23.9999 16C24 15.6318 23.7015 15.3333 23.3333 15.3333Z"
        fill="#727A90"
      />
    </g>
    <defs>
      <clipPath id="clip0_326_14595">
        <rect width={16} height={16} fill="white" transform="translate(8 8)" />
      </clipPath>
    </defs>
  </svg>
);
export default AddButton;
