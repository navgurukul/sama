import React from 'react';
import { Grid, TextField, Button } from '@mui/material';

const SearchBar = ({ idQuery, setIdQuery, macQuery, setMacQuery, onSearch, handleReset, loading }) => {
  const handleSearchClick = (e) => {
    e.preventDefault(); // Prevent default form behavior
    onSearch();
  };
  
  return (
    <form onSubmit={handleSearchClick}>
      <Grid container spacing={2} style={{ marginBottom: '20px', marginTop: '80px' }}>
        <Grid item xs={12} sm={5}>
          <TextField
            label="Search by Serial No"
            variant="outlined"
            fullWidth
            value={idQuery}
            onChange={(e) => setIdQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSearch()}
            disabled={macQuery !== ''}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            label="Search by Mac Address"
            variant="outlined"
            fullWidth
            value={macQuery}
            onChange={(e) => setMacQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSearch()}
            disabled={idQuery !== ''}
          />
        </Grid>
        <Grid item xs={12} sm={1}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            onClick={onSearch}
          >
            Search
          </Button>
        </Grid>
        <Grid item xs={12} sm={2}>
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleReset}
            disabled={loading}
            sx={{ marginLeft: '10px' }}
          >
            Reset All
          </Button>
        </Grid>
      </Grid>
    </form>
  );
};

export default SearchBar;