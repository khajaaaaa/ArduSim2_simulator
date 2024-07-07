import React, { useEffect, useRef, useState } from "react";
import {
  Viewer,
  Cartesian3,
  JulianDate,
  SampledPositionProperty,
  Color,
  Math as CesiumMath,
  Model,
  PolylineGlowMaterialProperty,
  HeadingPitchRoll,
  HeadingPitchRange,
  Transforms,
  Ellipsoid,
  IonResource,
  VelocityOrientationProperty,
  PathGraphics,
} from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";
import * as Cesium from "cesium";

const CesiumMap = ({ droneData, trajectory }) => {
  const cesiumContainerRef = useRef(null);
  const [viewer, setViewer] = useState(null);
  const [hpRoll, setHpRoll] = useState(new HeadingPitchRoll());
  const [speed, setSpeed] = useState(10);
  const deltaRadians = CesiumMath.toRadians(3.0);

  useEffect(() => {
    const viewerInstance = new Viewer(cesiumContainerRef.current, {
      shouldAnimate: true,
    });

    const canvas = viewerInstance.canvas;
    canvas.setAttribute("tabindex", "0");
    canvas.addEventListener("click", () => canvas.focus());
    canvas.focus();

    setViewer(viewerInstance);

    return () => {
      viewerInstance.destroy();
    };
  }, []);

  useEffect(() => {
    if (viewer) {
      const scene = viewer.scene;
      const camera = viewer.camera;
      const controller = scene.screenSpaceCameraController;

      const pathPosition = new SampledPositionProperty();
      viewer.entities.add({
        position: pathPosition,
        name: "path",
        path: {
          show: true,
          leadTime: Infinity,
          trailTime: Infinity,
          width: 10,
          resolution: 1,
          material: new PolylineGlowMaterialProperty({
            glowPower: 0.3,
            taperPower: 0.3,
            color: Color.PALEGOLDENROD,
          }),
        },
      });

      let position = Cartesian3.fromDegrees(-123.0744619, 44.0503706, 5000.0);
      let speedVector = new Cartesian3();
      const fixedFrameTransform = Transforms.localFrameToFixedFrameGenerator("north", "west");
      const hpRange = new HeadingPitchRange();
      let r = 0;

      const initializeModel = async () => {
        try {
          const airplaneUri = await IonResource.fromAssetId(2634684);
          const planePrimitive = await Model.fromGltfAsync({
            url: airplaneUri._url,
            modelMatrix: Transforms.headingPitchRollToFixedFrame(position, hpRoll, Ellipsoid.WGS84, fixedFrameTransform),
            minimumPixelSize: 128,
          });
          scene.primitives.add(planePrimitive);

          planePrimitive.readyEvent.addEventListener(() => {
            planePrimitive.activeAnimations.addAll({
              multiplier: 0.5,
              loop: Cesium.ModelAnimationLoop.REPEAT,
            });

            r = 2.0 * Math.max(planePrimitive.boundingSphere.radius, camera.frustum.near);
            controller.minimumZoomDistance = r * 0.5;
            const center = planePrimitive.boundingSphere.center;
            const heading = CesiumMath.toRadians(230.0);
            const pitch = CesiumMath.toRadians(-20.0);
            hpRange.heading = heading;
            hpRange.pitch = pitch;
            hpRange.range = r * 50.0;
            camera.lookAt(center, hpRange);
          });

          document.addEventListener("keydown", (e) => handleKeydown(e, hpRoll, setHpRoll, deltaRadians, speed, setSpeed));

          viewer.scene.preUpdate.addEventListener((scene, time) => {
            speedVector = Cartesian3.multiplyByScalar(Cartesian3.UNIT_X, speed / 10, speedVector);
            position = Cartesian3.add(position, speedVector, position);
            pathPosition.addSample(JulianDate.now(), position);
            Transforms.headingPitchRollToFixedFrame(position, hpRoll, Ellipsoid.WGS84, fixedFrameTransform, planePrimitive.modelMatrix);

            const fromBehind = document.getElementById("fromBehind");
            if (fromBehind && fromBehind.checked) {
              const center = planePrimitive.boundingSphere.center;
              hpRange.heading = hpRoll.heading;
              hpRange.pitch = hpRoll.pitch;
              camera.lookAt(center, hpRange);
            }
          });

        } catch (error) {
          console.error(`Error loading model: ${error}`);
        }
      };

      initializeModel();

      return () => {
        document.removeEventListener("keydown", handleKeydown);
      };
    }
  }, [viewer]);

  useEffect(() => {
    if (viewer && trajectory && trajectory.length > 0) {
      const flightData = trajectory.map(data => ({
        longitude: data.position.lon,
        latitude: data.position.lat,
        height: data.position.alt,
        time: data.time_boot_ms,
        heading: data.position.heading,
      }));

      const start = JulianDate.now();
      const stop = JulianDate.addSeconds(start, flightData.length * 30, new JulianDate());

      viewer.clock.startTime = start.clone();
      viewer.clock.stopTime = stop.clone();
      viewer.clock.currentTime = start.clone();
      viewer.timeline.zoomTo(start, stop);
      viewer.clock.multiplier = 50;
      viewer.clock.shouldAnimate = true;

      const positionProperty = new SampledPositionProperty();

      flightData.forEach((dataPoint, index) => {
        const time = JulianDate.addSeconds(start, index * 30, new JulianDate());
        const position = Cartesian3.fromDegrees(dataPoint.longitude, dataPoint.latitude, dataPoint.height);
        positionProperty.addSample(time, position);

        viewer.entities.add({
          description: `Location: (${dataPoint.longitude}, ${dataPoint.latitude}, ${dataPoint.height})`,
          position: position,
          point: { pixelSize: 10, color: Color.RED },
        });
      });

      const initializeAirplane = async () => {
        const airplaneUri = await IonResource.fromAssetId(2634684);
        const airplaneEntity = viewer.entities.add({
          position: positionProperty,
          model: { uri: airplaneUri._url },
          orientation: new VelocityOrientationProperty(positionProperty),
          path: new PathGraphics({
            width: 2,
            leadTime: Infinity,
            trailTime: Infinity,
          }),
        });

        viewer.trackedEntity = airplaneEntity;
      };

      initializeAirplane();
    }
  }, [viewer, trajectory]);

  const handleKeydown = (e, hpRoll, setHpRoll, deltaRadians, speed, setSpeed) => {
    const newHpRoll = { ...hpRoll };
    switch (e.code) {
      case "ArrowDown":
        if (e.shiftKey) {
          setSpeed(Math.max(speed - 1, 1));
        } else {
          newHpRoll.pitch -= deltaRadians;
          if (newHpRoll.pitch < -CesiumMath.TWO_PI) {
            newHpRoll.pitch += CesiumMath.TWO_PI;
          }
        }
        break;
      case "ArrowUp":
        if (e.shiftKey) {
          setSpeed(Math.min(speed + 1, 100));
        } else {
          newHpRoll.pitch += deltaRadians;
          if (newHpRoll.pitch > CesiumMath.TWO_PI) {
            newHpRoll.pitch -= CesiumMath.TWO_PI;
          }
        }
        break;
      case "ArrowRight":
        if (e.shiftKey) {
          newHpRoll.roll += deltaRadians;
          if (newHpRoll.roll > CesiumMath.TWO_PI) {
            newHpRoll.roll -= CesiumMath.TWO_PI;
          }
        } else {
          newHpRoll.heading += deltaRadians;
          if (newHpRoll.heading > CesiumMath.TWO_PI) {
            newHpRoll.heading -= CesiumMath.TWO_PI;
          }
        }
        break;
      case "ArrowLeft":
        if (e.shiftKey) {
          newHpRoll.roll -= deltaRadians;
          if (newHpRoll.roll < 0.0) {
            newHpRoll.roll += CesiumMath.TWO_PI;
          }
        } else {
          newHpRoll.heading -= deltaRadians;
          if (newHpRoll.heading < 0.0) {
            newHpRoll.heading += CesiumMath.TWO_PI;
          }
        }
        break;
      default:
    }
    setHpRoll(newHpRoll);
  };

  return (
    <div>
      <div id="cesiumContainer" ref={cesiumContainerRef} style={{ width: "100%", height: "80vh" }}></div>
      <div>
        <span id="heading"></span>
        <span id="pitch"></span>
        <span id="roll"></span>
        <span id="speed"></span>
        <input type="checkbox" id="fromBehind" />
      </div>
    </div>
  );
};

export default CesiumMap;
