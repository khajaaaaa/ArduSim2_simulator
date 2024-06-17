import React from "react";
import { createRoot } from 'react-dom/client';
import * as Cesium from "cesium";
import CesiumMap from "./App";

Cesium.Ion.defaultAccessToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5NjUyNGE3My0wMWI1LTQwODAtOTRhNy1iZTRhZWFlYTg1MDciLCJpZCI6MjIxNTMyLCJpYXQiOjE3MTgxMTE2MTh9.VbcSd8oL_HzCAbeJiwzWn3GJgQTy5r7izDWk9ewx7oQ";

const container = document.getElementById('root');
const root = createRoot(container); // Create a root.
root.render(<CesiumMap/>); // Initial render