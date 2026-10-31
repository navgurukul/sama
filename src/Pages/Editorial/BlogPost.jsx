import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import BlogBeyondConnectivity from './BlogBeyondConnectivity';
import BlogEWaste from './BlogEWaste';
import BlogRethinkingInclusion from './BlogRethinkingInclusion';

export default function BlogPost() {
  const { slug } = useParams();

  switch (slug) {
    case 'beyond-connectivity':
      return <BlogBeyondConnectivity />;
    case 'from-e-waste-to-new-beginnings':
      return <BlogEWaste />;
    case 'rethinking-digital-inclusion':
      return <BlogRethinkingInclusion />;
    default:
      return <Navigate to="/comms" replace />;
  }
}
