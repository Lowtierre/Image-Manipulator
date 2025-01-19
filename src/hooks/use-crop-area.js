import { useEffect, useState } from "react";

export const useCropArea = ({ onCrop, containerRef }) => {
  const [cropArea, setCropArea] = useState({
    x: 50, // Posizione iniziale X
    y: 50, // Posizione iniziale Y
    width: 100, // Larghezza iniziale
    height: 100, // Altezza iniziale
  });

  const [dragging, setDragging] = useState(false);
  const [startPosition, setStartPosition] = useState({
    x: 0,
    y: 0,
  });
  const [resizing, setResizing] = useState(null);

  useEffect(() => {
    const handleMove = (e) => handleResize(e);
    const handleEnd = () => handleResizeEnd();

    if (resizing) {
      document.addEventListener("mousemove", handleMove);
      document.addEventListener("mouseup", handleEnd);
      document.addEventListener("touchmove", handleMove);
      document.addEventListener("touchend", handleEnd);
    }

    return () => {
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseup", handleEnd);
      document.removeEventListener("touchmove", handleMove);
      document.removeEventListener("touchend", handleEnd);
    };
  }, [resizing]);

  // Handler for moving crop area
  const handleMouseDown = (e) => {
    // Memorizza la posizione iniziale e imposta lo stato di trascinamento
    setDragging(true);
    setStartPosition({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e) => {
    if (!dragging || resizing) return;

    // Calcola il movimento del mouse e aggiorna la posizione del rettangolo
    const dx = e.clientX - startPosition.x;
    const dy = e.clientY - startPosition.y;

    setCropArea((prev) => ({
      ...prev,
      x: prev.x + dx,
      y: prev.y + dy,
    }));

    setStartPosition({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setDragging(false);
  };

  // Handler for resizing crop area
  const handleResizeStart = (handle) => {
    setResizing(handle);
  };

  const handleResize = (e) => {
    if (!resizing || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const clientX = e.clientX || e.touches[0].clientX;
    const clientY = e.clientY || e.touches[0].clientY;
    const relativeX = clientX - containerRect.left;
    const relativeY = clientY - containerRect.top;

    setCropArea((prev) => {
      let newArea = { ...prev };

      switch (resizing) {
        case "top-left":
          newArea.width += newArea.x - relativeX;
          newArea.height += newArea.y - relativeY;
          newArea.x = relativeX;
          newArea.y = relativeY;
          break;
        case "top-right":
          newArea.width = relativeX - newArea.x;
          newArea.height += newArea.y - relativeY;
          newArea.y = relativeY;
          break;
        case "bottom-left":
          newArea.width += newArea.x - relativeX;
          newArea.height = relativeY - newArea.y;
          newArea.x = relativeX;
          break;
        case "bottom-right":
          newArea.width = relativeX - newArea.x;
          newArea.height = relativeY - newArea.y;
          break;
        case "top":
          newArea.height += newArea.y - relativeY;
          newArea.y = relativeY;
          break;
        case "right":
          newArea.width = relativeX - newArea.x;
          break;
        case "bottom":
          newArea.height = relativeY - newArea.y;
          break;
        case "left":
          newArea.width += newArea.x - relativeX;
          newArea.x = relativeX;
          break;
        default:
          break;
      }

      // Imposta nuovi limiti minimi per larghezza/altezza (opzionale)
      newArea.width = Math.max(newArea.width, 40); // Larghezza minima
      newArea.height = Math.max(newArea.height, 40); // Altezza minima

      return newArea;
    });
  };

  const handleResizeEnd = () => {
    setResizing(null);
  };

  const applyCrop = (imageSrc, transform) => {
    const img = document.createElement("img");
    img.src = imageSrc; // Assicurati che questa sia l'immagine originale

    const { position, zoom } = transform;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = cropArea.width;
      canvas.height = cropArea.height;

      // Coordinate di crop normalizzate
      const normalizedX = (cropArea.x - position.x) / zoom;
      const normalizedY = (cropArea.y - position.y) / zoom;
      const normalizedWidth = cropArea.width / zoom;
      const normalizedHeight = cropArea.height / zoom;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(
        img,
        normalizedX, // Posizione di partenza nel container
        normalizedY, // Posizione di partenza nel container
        normalizedWidth,
        normalizedHeight,
        0, // Posizione di partenza nel canvas
        0,
        cropArea.width,
        cropArea.height
      );

      // Genera l'immagine ritagliata
      const croppedImage = canvas.toDataURL("image/png");

      // Passa l'immagine ritagliata alla callback
      if (onCrop) {
        onCrop(croppedImage);
      }
    };
  };

  return {
    cropArea,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    applyCrop,
    handleResizeStart,
    handleResize,
    handleResizeEnd,
  };
};
