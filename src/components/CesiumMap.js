import React, { useEffect, useState } from "react";
import {
  Viewer,
  Cartesian3,
  Math as CesiumMath,
  HeadingPitchRoll,
  Transforms,
  createOsmBuildingsAsync,
  Color,
  SampledPositionProperty,
  JulianDate,
} from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";
import * as Cesium from "cesium";

const useCesiumViewer = (droneData, cameraSettings) => {
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
        destination: Cartesian3.fromDegrees(lon, lat, alt ), 
        orientation: {
          heading: CesiumMath.toRadians(heading),
          pitch: CesiumMath.toRadians(cameraSettings.pitch),
        },
      });
    }
  }, [viewer, droneData, cameraSettings]);
};

const useCreateDroneModel = (viewer, droneData) => {
  useEffect(() => {
    if (viewer && droneData) {
      const { lon, lat, alt, heading } = droneData.position;
      const assetId = 2634684; 
      const id = "DroneModel"; // Unique ID for the entity

      const loadModel = async () => {
        try {
          const resource = await Cesium.IonResource.fromAssetId(assetId);

          const position = Cartesian3.fromDegrees(lon, lat, alt);
          const droneHeading = CesiumMath.toRadians(heading);
          const hpr = new HeadingPitchRoll(droneHeading, 0, 0);
          const orientation = Transforms.headingPitchRollQuaternion(position, hpr);

          viewer.entities.add({
            id: id,
            name: "Drone Model",
            position: position,
            orientation: orientation,
            model: {
              uri: resource,
              minimumPixelSize: 128,
              maximumScale: 20000,
              colorBlendMode: Cesium.ColorBlendMode.MIX,
              heightReference: Cesium.HeightReference.RELATIVE_TO_TERRAIN,
            },
          });

        } catch (error) {
          console.error("Error loading Ion model:", error);
        }
      };

      loadModel();

      viewer.scene.postRender.addEventListener(() => {
        // Check if the entity exists before updating
        const entity = viewer.entities.getById(id);
        if (entity) {
          const newPosition = Cartesian3.fromDegrees(lon, lat, alt);
          entity.position.setValue(newPosition);
        }
      });
    }
  }, [viewer, droneData]);
};

const useRenderTrajectory = (viewer, trajectory) => {
  useEffect(() => {
    if (viewer && trajectory.length > 0) {
      const sampledPosition = new SampledPositionProperty();

      const baseDate = new Date();

      trajectory.forEach((positionData) => {
        const position = positionData.position || positionData;

        const { lon, lat, alt } = position;
        if (typeof lon === 'number' && typeof lat === 'number') {
          const date = new Date(baseDate.getTime() + positionData.time_boot_ms);
          const time = JulianDate.fromDate(date);

          const cartesianPosition = Cartesian3.fromDegrees(lon, lat, alt ); // Adjust altitude to be above the map
          sampledPosition.addSample(time, cartesianPosition);
        } else {
          console.error('Invalid position data:', positionData);
        }
      });

      viewer.entities.add({
        polyline: {
          positions: trajectory.map(pos => Cartesian3.fromDegrees(pos.position.lon, pos.position.lat, pos.position.alt + 100)),
          width: 3,
          material: Color.YELLOW,
        },
      });
    }
  }, [viewer, trajectory]);
};

const CesiumMap = ({ droneData, trajectory }) => {
  const cameraSettings = {
    zoom: 400,
    heading: 0.0,
    pitch: -30.0, // Adjust pitch for a better view angle
  };

  const viewer = useCesiumViewer(droneData,  cameraSettings);
  useFlyToDrone(viewer, droneData, cameraSettings);
  useCreateDroneModel(viewer, droneData);
  useRenderTrajectory(viewer, trajectory);

  return (
    <div id="cesiumContainer" style={{ width: "100%", height: "80vh" }} />
  );
};

export default CesiumMap;
