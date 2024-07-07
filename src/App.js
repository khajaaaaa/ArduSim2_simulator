import React, { useState } from "react";
import MapComponent from "./components/MapComponent";
import './App.css';
import Logo from './images/trace.svg';

const App = () => {
  const [show3DModel, setShow3DModel] = useState(false);

  const handleLogoClick = () => {
    setShow3DModel(true);
  };

  return (
    <div className="App">
      {!show3DModel ? (
        <img src={Logo} alt="Logo" className="logo" onClick={handleLogoClick} />
      ) : (
        <MapComponent />
      )}
    </div>
  );
};

export default App;
