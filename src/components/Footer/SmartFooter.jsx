import React from 'react';
import { useLocation } from 'react-router-dom';
import Footer from './Footer';
import EditorialFooter from '../Editorial/EditorialFooter';

const EDITORIAL_ROUTES = new Set([
  '',
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
  '/team',
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
]);

export default function SmartFooter() {
  const location = useLocation();
  const normalizedPath = (location.pathname || '').toLowerCase().replace(/\/+$/, '') || '/';

  const isEditorial =
    EDITORIAL_ROUTES.has(normalizedPath) ||
    normalizedPath.startsWith('/ourteam') ||
    normalizedPath.startsWith('/team') ||
    normalizedPath.startsWith('/blog') ||
    normalizedPath.startsWith('/ngoregistration');

  if (isEditorial) {
    return <EditorialFooter />;
  }
  return <Footer />;
}
