import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import MapComponent from "./components/MapComponent";
import CardComponent from "./components/CardComponent";
import './css/App.css';

const App = () => {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<CardComponent />} />
          <Route path="/map" element={<MapComponent />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
