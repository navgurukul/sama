import React, { useEffect } from "react";
import { Navigate } from 'react-router-dom';

function PrivateRoute({ children, reqired, ngoType }) {
  const isLoggedIn = localStorage.getItem('isLoggedIn');
  const roles = JSON.parse(localStorage.getItem('role')); // Retrieve the role array
  const NgoDetails = JSON.parse(localStorage.getItem('_AuthSama_'));
  const userNgoType = NgoDetails[0].Type;
  
  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }

  // If the user has the 'admin' role, grant access to all pages
  if (roles?.includes('admin')) {
    return children;
  }

  // If the user's role does not match the required role, redirect them
  // if (reqired && !roles?.includes(reqired)) {
  //   return <Navigate to="/" />;
  // }
  if (reqired === "ngo") {
    if (!roles?.includes("ngo")) {
      alert("Page not found.");
      return <Navigate to="/" />;
    }
    if (ngoType && userNgoType !== ngoType) {
      alert("Page not found.");
      if (ngoType === "1 to one"){
        return <Navigate to="/preliminary" />
      }else {
        return <Navigate to="/beneficiarydata" />
      };
      // return <Navigate to="/" />;
    }
  } else if (reqired && !roles?.includes(reqired)) {    
    alert("Page not found");
    return <Navigate to="/" />;
  }

  // If the user has the required role, render the children
  return children;
}

export default PrivateRoute;

