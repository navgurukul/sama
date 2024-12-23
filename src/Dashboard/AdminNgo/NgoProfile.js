import {useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import NGODetails from './NgoDetails';
import { fetchNgoDetails } from '../Redux/ngoSlice';

function NgoProfile() {
  const NgoId = JSON.parse(localStorage.getItem('_AuthSama_'));
  const id = NgoId[0]?.NgoId;
  const dispatch = useDispatch();
  console.log ("id", id)
  
  // Fetching state from Redux
  const { ngoDetails, status, error } = useSelector((state) => state.ngo);

  useEffect(() => {
    if (id) {
      dispatch(fetchNgoDetails(id));
    }
  }, [id, dispatch]);

  // Handle loading and error states
  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (status === 'failed') {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      {ngoDetails ? (
        <NGODetails ngo={ngoDetails} />
      ) : (
        <div>No NGO details available</div>
      )}
    </div>
  );
}


export default NgoProfile;