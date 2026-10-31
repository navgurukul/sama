import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import EditorialHeader from '../Editorial/EditorialHeader';

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
  '/about-initiative'
];

export default function SmartHeader() {
  const location = useLocation();
  const isEditorial = EDITORIAL_ROUTES.includes(location.pathname) || location.pathname.startsWith('/blog');

  if (isEditorial) {
    return <EditorialHeader />;
  }
  return <Navbar />;
}
