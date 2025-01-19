export const getHandleStyle = (handle) => {
  switch (handle) {
    case "top-left":
      return { top: 0, left: 0 };
    case "top-right":
      return { top: 0, left: "100%" };
    case "bottom-left":
      return { top: "100%", left: 0 };
    case "bottom-right":
      return { top: "100%", left: "100%" };
    case "top":
      return { top: 0, left: "50%", width: "20px", height: "10px" };
    case "right":
      return { top: "50%", left: "100%", width: "10px", height: "20px" };
    case "bottom":
      return { top: "100%", left: "50%", width: "20px", height: "10px" };
    case "left":
      return { top: "50%", left: 0, width: "10px", height: "20px" };
    default:
      return {};
  }
};

export const getCursorForHandle = (handle) => {
  switch (handle) {
    case "top-left":
    case "bottom-right":
      return "nwse-resize";
    case "top-right":
    case "bottom-left":
      return "nesw-resize";
    case "top":
    case "bottom":
      return "ns-resize";
    case "left":
    case "right":
      return "ew-resize";
    default:
      return "default";
  }
};
