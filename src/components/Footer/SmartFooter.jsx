import React from 'react';
import { useLocation } from 'react-router-dom';
import Footer from './Footer';
import EditorialFooter from '../Editorial/EditorialFooter';

const EDITORIAL_ROUTES = [
  '/',
  '/about',
  '/initiatives',
  '/sama-saathi',
  '/our-approach',
  '/labs',
  '/giving',
  '/first-laptop',
  '/bfg',
  '/build-for-good',
  '/ourteam',
  '/comms',
  '/donate',
  '/contact',
  '/corporatepartner',
  '/privacy-policy',
  '/ourgoverment',
  '/our-government',
  '/communitypartners',
  '/about-initiative',
  '/login',
  '/signup',
  '/ngoregistration'
];

export default function SmartFooter() {
  const location = useLocation();
  const isEditorial =
    EDITORIAL_ROUTES.includes(location.pathname) ||
    location.pathname.startsWith('/blog') ||
    location.pathname.startsWith('/ngoregistration');

  if (isEditorial) {
    return <EditorialFooter />;
  }
  return <Footer />;
}
