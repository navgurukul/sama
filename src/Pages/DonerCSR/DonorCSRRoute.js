import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const DonorCSRRoute = ({ children }) => {
  const NgoDetails = JSON.parse(localStorage.getItem("_AuthSama_")) || [];
  const isAdmin = NgoDetails?.[0]?.role?.includes("admin");

  if (isAdmin) {
    // Admin can access /donorcsr
    return children;
  }

  // Non-admins trying to access /donorcsr without donorName
  return <Navigate to="/not-found" />; // or render <h2>Page Not Found</h2>
};

export default DonorCSRRoute;
