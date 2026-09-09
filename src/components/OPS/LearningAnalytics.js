import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import TableView from '../../Pages/DonerCSR/TableView';

const LearningAnalytics = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('metric') !== 'learningAnalytics') {
      navigate('/afe?metric=learningAnalytics', { replace: true });
    }
  }, [location, navigate]);

  const searchParams = new URLSearchParams(location.search);
  if (searchParams.get('metric') !== 'learningAnalytics') {
    return null; // wait until URL updates to avoid fetching wrong data
  }

  // Render TableView without props so it acts as standalone and fetches its own data
  return <TableView />;
};

export default LearningAnalytics;
