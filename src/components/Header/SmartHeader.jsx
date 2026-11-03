import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import EditorialHeader from '../Editorial/EditorialHeader';

const DASHBOARD_PREFIXES = [
  '/dashboard',
  '/ops',
  '/ngo',
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
  '/beneficiarydata',
  '/mouupload',
  '/question-selection',
  '/donormanager',
  '/preliminary',
  '/submission-success',
  '/edit-user',
  '/edit-form',
  '/edit-yearly-form',
  '/laptop-with-issues',
  '/user-details',
  '/beneficiaryProfile',
  '/beneficiaryprofile',
];

export default function SmartHeader() {
  const location = useLocation();
  const path = (location.pathname || '').toLowerCase();
  const isLoggedIn = typeof window !== 'undefined' && !!localStorage.getItem('isLoggedIn');
  const isDashboard = DASHBOARD_PREFIXES.some((prefix) => path.startsWith(prefix));

  if (isLoggedIn) {
    return <Navbar />;
  }

  if (isDashboard) {
    return <Navbar />;
  }

  return <EditorialHeader />;
}
