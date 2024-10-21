import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const NgoDetails = () => {
  const { id } = useParams(); // Access the ID from the route
  const [ngo, setNgo] = useState(null);

  useEffect(() => {
    async function fetchNgoDetails() {
      try {
        const response = await axios.get(`API_ENDPOINT_TO_GET_NGO_DETAILS/${id}`);
        setNgo(response.data);
      } catch (error) {
        console.error('Error fetching NGO details:', error);
      }
    }
    fetchNgoDetails();
  }, [id]);

  if (!ngo) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>{ngo.organizationName}</h1>
      {/* Display more NGO details here */}
    </div>
  );
};

export default NgoDetails;
