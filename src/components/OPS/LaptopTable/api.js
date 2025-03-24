import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_LaptopAndBeneficiaryDetailsApi;

export const fetchLaptopData = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}?type=getLaptopData`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching laptop data:', error);
    throw error;
  }
};

export const updateLaptopData = async (payload) => {
  try {
    await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      mode: 'no-cors'
    });
    return true;
  } catch (error) {
    console.error('Error updating laptop data:', error);
    throw error;
  }
};