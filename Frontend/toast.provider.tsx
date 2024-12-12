"use client";

import { ToastContainer } from "react-toastify";
import { useBreakpoint } from "@/use-breakpoint";
import "react-toastify/dist/ReactToastify.css";
interface ToastProviderProps {
  children: React.ReactNode;
}

export default function ToastProvider({ children }: ToastProviderProps) {
  const isMobile = useBreakpoint("md");
  return (
    <>
      {children}
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover={false}
        theme="dark"
        style={
          !isMobile
            ? {
                width: "100%",
                padding: "0",
                margin: "0",
              }
            : {
                width: "115px",
                padding: "0",
                margin: "0",
              }
        }
      />
    </>
  );
}
