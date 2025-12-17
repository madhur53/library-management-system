// src/ui/ToastProvider.jsx
import React from "react";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

export function notifySuccess(msg) { toast.success(msg, { position: "top-right" }); }
export function notifyError(msg) { toast.error(msg, { position: "top-right" }); }
export function notifyInfo(msg) { toast.info(msg, { position: "top-right" }); }

export default function ToastProvider({ children }) {
  return (
    <>
      {children}
      <ToastContainer
        position="top-right"
        autoClose={3500}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
      />
    </>
  );
}
