import "./styles/App.css";
import ImageManipulator from "./components/image-manipulator";
import image from "./image1.jpg";

// App
function App() {
  const handleOnCrop = (img) => {
    const link = document.createElement("a");
    link.href = img;
    link.download = "cropped-image.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="App">
      <header className="App-header">
        <ImageManipulator
          imageSrc={image}
          containerWidth={640}
          containerHeight={360}
          defaultCrop={true}
          onCrop={handleOnCrop}
        />
      </header>
    </div>
  );
}

export default App;
