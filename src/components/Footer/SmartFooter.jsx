import React from 'react';
import { useLocation } from 'react-router-dom';
import Footer from './Footer';
import EditorialFooter from '../Editorial/EditorialFooter';

// Internal operational / dashboard prefixes
const DASHBOARD_PREFIXES = [
  '/dashboard',
  '/ops',
  '/corporate',
  '/corpretedb',
  '/donorcsr',
  '/pickup',
  '/pickup-request-by-donor',
  '/laptopinventory',
  '/laptop-tagging',
  '/laptop-stage',
  '/user-details',
  '/userdetails',
  '/data-assignment-form',
  '/documentupload',
  '/documentreupload',
  '/monthly-reporting',
  '/monthly-report',
  '/yearly-reporting',
  '/yearly-report',
  '/audit',
  '/afe',
  '/attentionneeded',
  '/ngoprofile',
  '/beneficiaryprofile',
  '/mouupload',
  '/question-selection',
  '/donormanager',
];

export default function SmartFooter() {
  const location = useLocation();
  const path = (location.pathname || '').toLowerCase();
  const isDashboard = DASHBOARD_PREFIXES.some((prefix) => path.startsWith(prefix));

  // If inside an internal operations dashboard, render internal Footer;
  // otherwise (including all public pages and 404s), render the EditorialFooter.
  if (isDashboard) {
    return <Footer />;
  }
  return <EditorialFooter />;
}
