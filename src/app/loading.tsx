import Image from "next/image";
import LoginLogo from "@/Assets/Images/LoginLogo.png";

/**
 * App-level loading UI shown by Next.js during route transitions.
 */
export default function AppLoading() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: "40px",
        background: "#ffffff",
        zIndex: 9998,
      }}
    >
      <div className="page-loader-logo-wrap">
        <Image
          src={LoginLogo}
          alt="visa2.pro"
          width={156}
          height={93}
          priority
          style={{ width: "156px", height: "auto" }}
        />
      </div>
      <div className="page-loader-track">
        <div className="page-loader-fill" />
      </div>
    </div>
  );
}
