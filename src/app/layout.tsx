import "@/styles/globals.css";
import { Providers } from "@/store/provider";
import { plusJakartaSans } from "./fonts";
import { Inter } from "next/font/google";
import Image from "next/image";
import ToastProvider from "@/components/ToastProvider";
import I18nProvider from "@/components/I18nProvider";
import HideLoader from "@/components/HideLoader";
import LoginLogo from "@/Assets/Images/LoginLogo.png";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.className} ${plusJakartaSans.variable}`}
      suppressHydrationWarning
    >
      <body
        className={`${inter.className} font-jakarta ${plusJakartaSans.className}`}
        suppressHydrationWarning
      >
        {/* Initial page loader — rendered by server, visible before any JS loads */}
        <div id="page-loader">
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

        <I18nProvider>
          <Providers>
            {children}
          </Providers>
        </I18nProvider>
        <HideLoader />
        <ToastProvider />
      </body>
    </html>
  );
}
