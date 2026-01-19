import React, { useRef, useState, useEffect } from 'react';

const CameraCapture = ({ onCapture, onClose, isLivenessMode = false }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [capturedFrames, setCapturedFrames] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
      }
    } catch (err) {
      setError('Failed to access camera: ' + err.message);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      setIsStreaming(false);
    }
  };

  const captureFrame = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      context.drawImage(videoRef.current, 0, 0, 640, 480);
      const imageBase64 = canvasRef.current.toDataURL('image/jpeg');
      if (isLivenessMode && capturedFrames.length < 2) {
        setCapturedFrames([...capturedFrames, imageBase64]);
      } else {
        onCapture(imageBase64);
        stopCamera();
      }
    }
  };

  return (
    <div className="modal">
      <video ref={videoRef} autoPlay playsInline style={{width:'640px', height:'480px'}} />
      <canvas ref={canvasRef} width={640} height={480} style={{display:'none'}} />
      {error && <p className="error">{error}</p>}
      <button onClick={captureFrame} disabled={!isStreaming}>Capture</button>
      <button onClick={onClose}>Cancel</button>
    </div>
  );
};

export default CameraCapture;
