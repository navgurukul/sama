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
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

const WebcamCaptureModal = ({ open, onClose, onCapture }) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const imgRef = useRef(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [capturedFile, setCapturedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState(null);
  const [pendingFiles, setPendingFiles] = useState([]);

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
      setCrop(undefined);
      setCompletedCrop(null);
      setPendingFiles([]);
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
    setCrop(undefined);
    setCompletedCrop(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
  };

  const handleConfirm = (closeAfter = true) => {
    if (!completedCrop || !completedCrop.width || !completedCrop.height) {
      if (capturedFile) {
        const allFiles = [...pendingFiles, capturedFile];
        if (closeAfter) {
          onCapture(allFiles);
          handleClose();
        } else {
          setPendingFiles(allFiles);
          handleRetake();
        }
      }
      return;
    }

    const image = imgRef.current;
    if (!image) return;

    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = completedCrop.width * scaleX;
    canvas.height = completedCrop.height * scaleY;
    const ctx = canvas.getContext('2d');

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY
    );

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `cropped-${Date.now()}.jpg`, { type: 'image/jpeg' });
        const allFiles = [...pendingFiles, file];
        if (closeAfter) {
          onCapture(allFiles);
          handleClose();
        } else {
          setPendingFiles(allFiles);
          handleRetake();
        }
      }
    }, 'image/jpeg', 0.9);
  };

  const handleClose = () => {
    setCapturedFile(null);
    setCrop(undefined);
    setCompletedCrop(null);
    setPendingFiles([]);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullScreen>
      <DialogTitle>
        {previewUrl ? 'Review & Crop Photo' : 'Take Photo'}
        {pendingFiles.length > 0 && !previewUrl && (
          <Typography variant="subtitle2" color="success.main" sx={{ mt: 1 }}>
            {pendingFiles.length} photo(s) captured and ready to upload.
          </Typography>
        )}
      </DialogTitle>
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
            <ReactCrop 
              crop={crop} 
              onChange={c => setCrop(c)} 
              onComplete={c => setCompletedCrop(c)}
            >
              <img 
                ref={imgRef}
                src={previewUrl} 
                alt="Preview" 
                style={{ height: 'calc(100vh - 140px)', width: 'auto', maxWidth: '100vw', display: 'block' }} 
                onLoad={() => setCrop({ unit: '%', width: 80, height: 80, x: 10, y: 10 })}
              />
            </ReactCrop>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        {previewUrl ? (
          <>
            <Button onClick={handleRetake} color="secondary">Retake</Button>
            <Button variant="outlined" onClick={() => handleConfirm(false)} color="primary">
              Confirm & Add Another
            </Button>
            <Button variant="contained" onClick={() => handleConfirm(true)} color="primary">
              Confirm & Upload {pendingFiles.length > 0 ? `(${pendingFiles.length + 1})` : ''}
            </Button>
          </>
        ) : (
          <>
            <Button onClick={handleClose} color="secondary">Cancel</Button>
            <Button variant="contained" onClick={handleCapture} disabled={!!error || loading}>
              Snap Photo
            </Button>
            {pendingFiles.length > 0 && (
              <Button variant="contained" color="success" onClick={() => { onCapture(pendingFiles); handleClose(); }}>
                Upload {pendingFiles.length} Photos
              </Button>
            )}
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default WebcamCaptureModal;
