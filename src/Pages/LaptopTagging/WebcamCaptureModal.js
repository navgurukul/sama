import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  CircularProgress
} from '@mui/material';

const WebcamCaptureModal = ({ open, onClose, onCapture }) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const stopMediaTracks = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (open) {
      setError('');
      setLoading(true);
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then((stream) => {
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error('Error accessing webcam:', err);
          setError('Camera access denied or no camera found.');
          setLoading(false);
        });
    } else {
      stopMediaTracks();
    }

    return () => {
      stopMediaTracks();
    };
  }, [open, stopMediaTracks]);

  const handleCapture = () => {
    if (!videoRef.current) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
        onCapture([file]); // Pass as array to match existing fileList signature
        onClose();
      }
    }, 'image/jpeg', 0.9);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Take Photo</DialogTitle>
      <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {error && <Typography color="error">{error}</Typography>}
        {loading && <CircularProgress sx={{ my: 4 }} />}
        <Box sx={{ width: '100%', maxWidth: 500, backgroundColor: '#000', borderRadius: 2, overflow: 'hidden', display: (error || loading) ? 'none' : 'block' }}>
          <video
            ref={videoRef}
            style={{ width: '100%', height: 'auto', display: 'block' }}
            playsInline
            muted
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">Cancel</Button>
        <Button variant="contained" onClick={handleCapture} disabled={!!error || loading}>
          Take Photo
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WebcamCaptureModal;
