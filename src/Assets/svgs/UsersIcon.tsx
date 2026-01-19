import * as React from "react";
const UserIcon = ({ color = "#42DA82", props }: any) => (
  <svg
    width={16}
    height={16}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M8 8C10.2091 8 12 6.20914 12 4C12 1.79086 10.2091 0 8 0C5.79086 0 4 1.79086 4 4C4 6.20914 5.79086 8 8 8Z"
      fill={color}
    />
    <path
      d="M8 9.33252C4.68781 9.33621 2.00369 12.0203 2 15.3325C2 15.7007 2.29847 15.9992 2.66666 15.9992H13.3333C13.7015 15.9992 14 15.7007 14 15.3325C13.9963 12.0203 11.3122 9.33618 8 9.33252Z"
      fill={color}
    />
  </svg>
);
export default UserIcon;
