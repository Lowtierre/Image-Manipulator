import React, { useState, useEffect, useRef } from "react";
import { useCropArea } from "../hooks/use-crop-area";
import CropArea from "./crop-area";
import { Icon } from "@iconify-icon/react/dist/iconify.js";

export default function ImageManipulator({
  imageSrc,
  containerWidth,
  containerHeight,
  onTransformChange,
  initialState,
  LoaderComponent,
  defaultCrop,
  onCrop,
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [imageDimensions, setImageDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [transform, setTransform] = useState({
    position: { x: 0, y: 0 },
    zoom: 1,
    rotation: 0,
    ...initialState,
  });
  const [dragging, setDragging] = useState(false);
  const [lastMousePosition, setLastMousePosition] = useState({ x: 0, y: 0 });
  const [crop, setCrop] = useState(defaultCrop);
  const containerRef = useRef();

  // Crop Area Function
  const {
    cropArea,
    handleMouseDown: handleMouseDownCropArea,
    handleMouseMove: handleMouseMoveCropArea,
    handleMouseUp: handleMouseUpCropArea,
    handleResizeStart: handleResizeStartCropArea,
    handleResize: handleResizeCropArea,
    handleResizeEnd: handleResizeEndCropArea,
    applyCrop,
  } = useCropArea({
    onCrop,
    containerRef,
  });

  useEffect(() => {
    // Carica l'immagine per ottenere le sue dimensioni
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      setImageDimensions({ width: img.width, height: img.height });

      // Calcola il minZoom e le coordinate iniziali
      const minZoom = Math.min(
        containerWidth / img.width,
        containerHeight / img.height
      );

      const defaultPosition = {
        x: (containerWidth - img.width * minZoom) / 2,
        y: (containerHeight - img.height * minZoom) / 2,
      };

      setTransform({
        position: defaultPosition,
        zoom: minZoom,
        rotation: 0,
      });
      setIsLoading(false);
    };

    return () => {
      setIsLoading(true);
    };
  }, [imageSrc, containerWidth, containerHeight, initialState]);

  // Utils
  const calculateBounds = (zoom) => {
    const imgWidth = imageDimensions.width * zoom;
    const imgHeight = imageDimensions.height * zoom;

    return {
      minX: Math.min(0, containerWidth - imgWidth),
      minY: Math.min(0, containerHeight - imgHeight),
      maxX: Math.max(0, containerWidth - imgWidth),
      maxY: Math.max(0, containerHeight - imgHeight),
    };
  };

  // Handler about positioning
  const handleMouseDown = (event) => {
    setDragging(true);
    setLastMousePosition({ x: event.clientX, y: event.clientY });
  };

  const handleMouseMove = (event) => {
    if (!dragging) return;

    const deltaX = event.clientX - lastMousePosition.x;
    const deltaY = event.clientY - lastMousePosition.y;

    setTransform((prev) => {
      const bounds = calculateBounds(prev.zoom);

      // Calcola la nuova posizione vincolata ai limiti
      const newPosition = {
        x: Math.min(
          bounds.maxX,
          Math.max(bounds.minX, prev.position.x + deltaX)
        ),
        y: Math.min(
          bounds.maxY,
          Math.max(bounds.minY, prev.position.y + deltaY)
        ),
      };

      onTransformChange?.({ ...prev, position: newPosition });
      return { ...prev, position: newPosition };
    });

    setLastMousePosition({ x: event.clientX, y: event.clientY });
  };

  const handleMouseUp = () => {
    setDragging(false);
  };

  // Handler about zooming
  const handleWheel = (event) => {
    const deltaZoom = event.deltaY * -0.0001;
    const newZoom = Math.max(
      transform.zoom + deltaZoom,
      Math.min(
        containerWidth / imageDimensions.width,
        containerHeight / imageDimensions.height
      )
    );

    const zoomFactor = newZoom / transform.zoom;
    const centerX = containerWidth / 2;
    const centerY = containerHeight / 2;

    const newX = centerX - (centerX - transform.position.x) * zoomFactor;
    const newY = centerY - (centerY - transform.position.y) * zoomFactor;

    const bounds = calculateBounds(newZoom);

    // Vincola la nuova posizione ai limiti
    const constrainedPosition = {
      x: Math.min(bounds.maxX, Math.max(bounds.minX, newX)),
      y: Math.min(bounds.maxY, Math.max(bounds.minY, newY)),
    };

    setTransform({
      ...transform,
      zoom: newZoom,
      position: constrainedPosition,
    });
    onTransformChange?.({
      ...transform,
      zoom: newZoom,
      position: constrainedPosition,
    });
  };

  return (
    <div>
      <div
        ref={containerRef}
        style={{
          width: containerWidth,
          height: containerHeight,
          overflow: "hidden",
          position: "relative",
          border: "1px solid black",
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Mostra lo spinner esterno se l'immagine non è caricata */}
        {isLoading && LoaderComponent && (
          <div
            className="loader"
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            <LoaderComponent />
          </div>
        )}
        <img
          src={imageSrc}
          alt="Transformable"
          style={{
            transform: `translate(${transform.position.x}px, ${transform.position.y}px) scale(${transform.zoom}) rotate(${transform.rotation}deg)`,
            position: "absolute",
            transformOrigin: "top left",
            top: 0,
            left: 0,
            cursor: dragging ? "grabbing" : "grab",
            opacity: isLoading ? 0 : 1,
          }}
          onMouseDown={handleMouseDown}
          onWheel={handleWheel}
          draggable={false}
        />
        {crop && (
          <CropArea
            cropArea={cropArea}
            handleMouseDown={handleMouseDownCropArea}
            handleMouseMove={handleMouseMoveCropArea}
            handleMouseUp={handleMouseUpCropArea}
            handleResizeStart={handleResizeStartCropArea}
            handleResize={handleResizeCropArea}
            handleResizeEnd={handleResizeEndCropArea}
          />
        )}
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 2,
        }}
      >
        <button onClick={() => applyCrop(imageSrc, transform)} disabled={!crop}>
          Crop
        </button>
        <button
          onClick={() => setCrop((prev) => !prev)}
          style={{
            cursor: "pointer",
          }}
        >
          <Icon icon="material-symbols:crop" width="24px" height="24px" />
        </button>
      </div>
    </div>
  );
}
