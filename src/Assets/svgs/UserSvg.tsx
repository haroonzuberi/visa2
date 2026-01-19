import * as React from "react";
const UserSvg = (props: any) => (
  <svg
    width={18}
    height={18}
    viewBox="0 0 18 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M9 9C11.4853 9 13.5 6.98528 13.5 4.5C13.5 2.01472 11.4853 0 9 0C6.51472 0 4.5 2.01472 4.5 4.5C4.5 6.98528 6.51472 9 9 9Z"
      fill={props.color ? props.color : '#019BF4'}
    />
    <path
      d="M9 10.4995C5.27379 10.5037 2.25415 13.5233 2.25 17.2495C2.25 17.6637 2.58578 17.9995 2.99999 17.9995H15C15.4142 17.9995 15.75 17.6637 15.75 17.2495C15.7458 13.5233 12.7262 10.5036 9 10.4995Z"
      fill={props.color ? props.color : '#019BF4'}
    />
  </svg>
);
export default UserSvg;
