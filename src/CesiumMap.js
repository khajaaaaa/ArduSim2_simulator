import React, { useEffect, useState, useCallback } from "react";
import {
  Viewer,
  Cartesian3,
  Math as CesiumMath,
  HeadingPitchRoll,
  Transforms,
  createOsmBuildingsAsync,
  Color,
  HeadingPitchRange,
} from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";
import * as Cesium from "cesium";

const CesiumMap = ({ droneData, droneColor }) => {
  const [viewer, setViewer] = useState(null);
  const [cameraSettings, setCameraSettings] = useState({
    zoom: 400,
    heading: 0.0,
    pitch: -15.0,
  });

  useEffect(() => {
    let viewerInstance = null;

    const initCesium = async () => {
      const newViewer = new Viewer("cesiumContainer", {
        terrain: Cesium.Terrain.fromWorldTerrain(),
        infoBox: false,
        selectionIndicator: false,
        shadows: true,
        shouldAnimate: true,
      });

      const osmBuildingsTileset = await createOsmBuildingsAsync();
      newViewer.scene.primitives.add(osmBuildingsTileset);

      viewerInstance = newViewer;
      setViewer(newViewer);

      // Fly to drone initial position
      flyToDrone(newViewer, droneData);

      // Create drone model
      createDroneModel(newViewer, droneData, droneColor);
    };

    initCesium();

    return () => {
      if (viewerInstance) {
        viewerInstance.destroy();
      }
    };
  }, [droneData, droneColor]);

  const flyToDrone = (viewer, droneData) => {
    const { lon, lat, alt, heading } = droneData.position;

    viewer.camera.flyTo({
      destination: Cartesian3.fromDegrees(lon, lat, alt),
      orientation: {
        heading: CesiumMath.toRadians(heading),
        pitch: CesiumMath.toRadians(cameraSettings.pitch),
      },
    });
  };

  const createDroneModel = (viewer, droneData, droneColor) => {
    const { lon, lat, alt, heading } = droneData.position;

    const url = "/models/CesiumDrone/CesiumDrone.gltf";
    const position = Cartesian3.fromDegrees(lon, lat, alt);
    const droneHeading = CesiumMath.toRadians(heading);
    const hpr = new HeadingPitchRoll(droneHeading, 0, 0);
    const orientation = Transforms.headingPitchRollQuaternion(position, hpr);

    const entity = viewer.entities.add({
      name: url,
      position: position,
      orientation: orientation,
      model: {
        uri: url,
        minimumPixelSize: 128,
        maximumScale: 20000,
        color: Color.fromCssColorString(droneColor),
        colorBlendMode: Cesium.ColorBlendMode.MIX,
        heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
      },
    });

    // Optionally, adjust the rendering order manually using scene.postRender
    viewer.scene.postRender.addEventListener(() => {
      // Raise the drone entity above other entities by modifying its position
      const newPosition = Cartesian3.fromDegrees(lon, lat, alt);
      entity.position.setValue(newPosition);
    });
  };

  return (
    <div>
      <div id="cesiumContainer" style={{ width: "100%", height: "80vh" }} />
    </div>
  );
};

export default CesiumMap;
