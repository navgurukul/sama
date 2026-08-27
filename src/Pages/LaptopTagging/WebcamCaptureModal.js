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
  const [capturedFile, setCapturedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

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
      setCapturedFile(null);
      setPreviewUrl(null);
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
        setCapturedFile(file);
        setPreviewUrl(URL.createObjectURL(blob));
      }
    }, 'image/jpeg', 0.9);
  };

  const handleRetake = () => {
    setCapturedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
  };

  const handleConfirm = () => {
    if (capturedFile) {
      onCapture([capturedFile]);
      handleClose();
    }
  };

  const handleClose = () => {
    setCapturedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullScreen>
      <DialogTitle>{previewUrl ? 'Review Photo' : 'Take Photo'}</DialogTitle>
      <DialogContent sx={{ p: 0, backgroundColor: '#000', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        {error && <Typography color="error" sx={{ p: 2 }}>{error}</Typography>}
        {loading && <CircularProgress sx={{ my: 4, color: 'white' }} />}
        <Box sx={{ width: '100%', height: '100%', display: (error || loading) ? 'none' : 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <video
            ref={videoRef}
            style={{ width: '100%', height: '100%', objectFit: 'contain', display: previewUrl ? 'none' : 'block' }}
            playsInline
            muted
          />
          {previewUrl && (
            <img 
              src={previewUrl} 
              alt="Preview" 
              style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
            />
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        {previewUrl ? (
          <>
            <Button onClick={handleRetake} color="secondary">Retake</Button>
            <Button variant="contained" onClick={handleConfirm} color="primary">
              Confirm & Upload
            </Button>
          </>
        ) : (
          <>
            <Button onClick={handleClose} color="secondary">Cancel</Button>
            <Button variant="contained" onClick={handleCapture} disabled={!!error || loading}>
              Snap Photo
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default WebcamCaptureModal;
