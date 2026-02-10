import "@/styles/globals.css";
import { Providers } from "@/store/provider";
import { plusJakartaSans } from "./fonts";
import { Inter } from "next/font/google";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Suspense } from "react";
import '../i18n';

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
    >
      <body
        className={`${inter.className} font-jakarta h-full ${plusJakartaSans.className}`}
      >
        <Providers>
          <Suspense>{children}</Suspense>
        </Providers>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </body>
    </html>
  );
}
