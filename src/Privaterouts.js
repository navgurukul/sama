import React, { useEffect } from "react";
import { Navigate } from 'react-router-dom';

function PrivateRoute({ children, reqired }) {
  const isLoggedIn = localStorage.getItem('isLoggedIn');
  const roles = JSON.parse(localStorage.getItem('role')); // Retrieve the role array

  if (!isLoggedIn) {
    return <Navigate to="/Opslogin" />;
  }

  // If the user has the 'admin' role, grant access to all pages
  if (roles?.includes('admin')) {
    return children;
  }

  // If the user's role does not match the required role, redirect them
  if (reqired && !roles?.includes(reqired)) {
    return <Navigate to="/" />;
  }

  // If the user has the required role, render the children
  return children;
}

export default PrivateRoute;

