import React, { useState, useCallback } from 'react';
import { 
  Box, 
  Button, 
  Paper, 
  Typography,
  Alert,
  CircularProgress
} from '@mui/material';
import { Upload, FileText, X } from 'lucide-react';

const FileUploadForm = () => {
  // Labels for file inputs
  const fileLabels = [
    "Employee Details Sheet",
    "Salary Information Document",
    "Performance Review Report"
  ];

  // State to store files and their statuses
  const [fileStates, setFileStates] = useState(
    fileLabels.reduce((acc, label) => ({
      ...acc,
      [label]: { file: null, status: 'pending' }
    }), {})
  );
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  // Handle drag events
  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('border-blue-500');
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-blue-500');
  };

  // Handle file drop
  const handleDrop = useCallback((e, label) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-blue-500');

    const file = e.dataTransfer.files[0];
    if (validateFile(file)) {
      handleFileSelection(file, label);
    }
  }, []);

  // Validate file type
  const validateFile = (file) => {
    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (!validTypes.includes(file.type)) {
      setError('Please upload only PDF or XLSX files');
      return false;
    }
    setError('');
    return true;
  };

  // Handle file selection
  const handleFileSelection = (file, label) => {
    setFileStates(prev => ({
      ...prev,
      [label]: { file, status: 'pending' }
    }));
  };

  // Handle file input change
  const handleFileChange = (event, label) => {
    const file = event.target.files[0];
    if (validateFile(file)) {
      handleFileSelection(file, label);
    }
  };

  // Remove file
  const handleRemoveFile = (label) => {
    setFileStates(prev => ({
      ...prev,
      [label]: { file: null, status: 'pending' }
    }));
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Check if all required files are present
    const missingFiles = fileLabels.filter(label => !fileStates[label].file);
    if (missingFiles.length > 0) {
      setError(`Please upload all required files: ${missingFiles.join(', ')}`);
      return;
    }
    setUploading(true);
    // Your API call logic here
    setUploading(false);
  };

  return (
    <Box className="flex flex-col items-center min-h-screen bg-gray-50 p-6">
      <Paper className="w-full max-w-2xl p-8">
        <Typography variant="h4" className="text-center mb-8">
          Document Upload System
        </Typography>

        {error && (
          <Alert severity="error" className="mb-6">
            {error}
          </Alert>
        )}

        <Box className="space-y-8">
          {fileLabels.map((label) => (
            <Box key={label} className="space-y-2">
              <Typography variant="subtitle1" className="font-medium">
                {label} *
              </Typography>

              {!fileStates[label].file ? (
                <Box
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, label)}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer"
                >
                  <input
                    type="file"
                    accept=".pdf,.xlsx"
                    onChange={(e) => handleFileChange(e, label)}
                    className="hidden"
                    id={`file-${label}`}
                  />
                  <label 
                    htmlFor={`file-${label}`}
                    className="cursor-pointer"
                  >
                    <Upload className="mx-auto mb-2" size={24} />
                    <Typography className="text-gray-600">
                      Drag and drop or click to upload PDF or XLSX
                    </Typography>
                  </label>
                </Box>
              ) : (
                <Box className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <Box className="flex items-center space-x-3">
                    <FileText size={20} className="text-blue-500" />
                    <Typography className="truncate max-w-md">
                      {fileStates[label].file.name}
                    </Typography>
                  </Box>
                  <Button
                    onClick={() => handleRemoveFile(label)}
                    className="min-w-0 p-1"
                  >
                    <X size={20} className="text-gray-500 hover:text-red-500" />
                  </Button>
                </Box>
              )}
            </Box>
          ))}
        </Box>

        <Box className="mt-8 flex justify-center">
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={uploading}
            className="w-full max-w-xs"
            startIcon={uploading ? <CircularProgress size={20} /> : null}
          >
            {uploading ? 'Uploading...' : 'Submit All Files'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default FileUploadForm;