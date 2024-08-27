import React, { useEffect, useState } from 'react';

const DataTable = () => {
  const [data, setData] = useState([]);

  console.log(data,'data');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://script.google.com/macros/s/AKfycbzGawobNrL7pNoqp4oEtrqD3yR_tK00c_1Clw19sFzbS6WmlreU20Gl0vx1FVj0fIXL_w/exec'); // Replace YOUR_SCRIPT_ID with your actual script ID
        const result = await response.json(); // Parse the JSON from the response
        setData(result); // Store data in state
      } catch (error) {
        console.error('Error fetching data:', error);
        alert('An error occurred while fetching data.');
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <h2>Laptop Inventory</h2>
      <table>
        <thead>
          <tr>
            {data.length > 0 && Object.keys(data[0]).map((key, index) => (
              <th key={index}>{key}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index}>
              {Object.values(row).map((value, idx) => (
                <td key={idx}>{value}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
