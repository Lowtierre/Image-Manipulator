import React from "react";
import { getCursorForHandle, getHandleStyle } from "../utils/cropUtils";

export default function CropArea({
  cropArea,
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
  handleResizeStart,
}) {
  return (
    <div
      className="crop-area"
      style={{
        position: "absolute",
        border: "2px dashed #fff",
        backgroundColor: "rgba(255, 255, 255, 0.3)",
        top: cropArea.y,
        left: cropArea.x,
        width: cropArea.width,
        height: cropArea.height,
        cursor: "move",
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Maniglie per ridimensionare */}
      {[
        "top-left",
        "top-right",
        "bottom-left",
        "bottom-right",
        "top",
        "right",
        "bottom",
        "left",
      ].map((handle) => (
        <div
          key={handle}
          className={`handle ${handle}`}
          onMouseDown={() => handleResizeStart(handle)}
          style={{
            position: "absolute",
            width: "10px",
            height: "10px",
            backgroundColor: "#eee",
            border: "1px solid #000",
            borderRadius: "5px",
            cursor: getCursorForHandle(handle),
            transform: "translate(-50%, -50%)",
            ...getHandleStyle(handle),
          }}
        />
      ))}
    </div>
  );
}
