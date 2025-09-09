import React from "react";
import { Outlet } from "react-router-dom";

const DonorCSRRoute = ({ children }) => {
  const NgoDetails = JSON.parse(localStorage.getItem("_AuthSama_")) || [];
  const isAdmin = NgoDetails?.[0]?.role?.includes("admin");

  if (isAdmin) {
    return children || <Outlet />;
  }

  // Inline 404 UI
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        flexDirection: "column",
      }}
    >
      <h1 style={{ fontSize: "4rem", color: "#ff4d4f" }}>404</h1>
      <h2>Page Not Found</h2>
      <p>The page you are looking for doesn’t exist.</p>
    </div>
  );
};

export default DonorCSRRoute;
