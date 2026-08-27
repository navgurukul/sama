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
    <Dialog open={open} onClose={onClose} fullScreen>
      <DialogTitle>Take Photo</DialogTitle>
      <DialogContent sx={{ p: 0, backgroundColor: '#000', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        {error && <Typography color="error" sx={{ p: 2 }}>{error}</Typography>}
        {loading && <CircularProgress sx={{ my: 4, color: 'white' }} />}
        <Box sx={{ width: '100%', height: '100%', display: (error || loading) ? 'none' : 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <video
            ref={videoRef}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
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
