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



const useCesiumViewer = (droneData, droneColor, cameraSettings) => {
  const [viewer, setViewer] = useState(null);

  useEffect(() => {
    let viewerInstance;

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

      setViewer(newViewer);
      viewerInstance = newViewer;
    };

    initCesium();

    return () => {
      if (viewerInstance) {
        viewerInstance.destroy();
      }
    };
  }, []);

  return viewer;
};

const useFlyToDrone = (viewer, droneData, cameraSettings) => {
  useEffect(() => {
    if (viewer && droneData) {
      const { lon, lat, alt, heading } = droneData.position;

      viewer.camera.flyTo({
        destination: Cartesian3.fromDegrees(lon, lat, alt),
        orientation: {
          heading: CesiumMath.toRadians(heading),
          pitch: CesiumMath.toRadians(cameraSettings.pitch),
        },
      });
    }
  }, [viewer, droneData, cameraSettings]);
};

const useCreateDroneModel = (viewer, droneData, droneColor) => {
  useEffect(() => {
    if (viewer && droneData) {
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

      viewer.scene.postRender.addEventListener(() => {
        const newPosition = Cartesian3.fromDegrees(lon, lat, alt);
        entity.position.setValue(newPosition);
      });
    }
  }, [viewer, droneData, droneColor]);
};

const CesiumMap = ({ droneData, droneColor }) => {
  const cameraSettings = {
    zoom: 400,
    heading: 0.0,
    pitch: -15.0,
  };

  const viewer = useCesiumViewer(droneData, droneColor, cameraSettings);
  useFlyToDrone(viewer, droneData, cameraSettings);
  useCreateDroneModel(viewer, droneData, droneColor);

  return (
    <div id="cesiumContainer" style={{ width: "100%", height: "80vh" }} />
  );
};

export default CesiumMap;
