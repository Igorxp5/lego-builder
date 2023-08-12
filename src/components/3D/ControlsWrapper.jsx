/* eslint-disable react/no-unknown-property */
/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
/* eslint-disable react/display-name */
import React, { useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import { useControls } from "leva";
import { OrbitControls } from "@react-three/drei";

export const ControlsWrapper = () => {
  const { setEvents, camera } = useThree();

  const [{ MultiSelect }, set] = useControls(() => ({
    MultiSelect: false,
  }));

  useEffect(() => {
    if (MultiSelect) {
      camera.position.set(0, 1000, 0);
      camera.lookAt(0, 0, 0);
    }
  }, [MultiSelect, camera]);

  const startTimeoutID = useRef();
  const endTimeoutID = useRef();

  const onStart = (e) => {
    if (startTimeoutID.current) clearTimeout(startTimeoutID.current);
    startTimeoutID.current = setTimeout(
      () => setEvents({ enabled: false }),
      500
    );
  };

  const onEnd = (e) => {
    if (endTimeoutID.current) clearTimeout(endTimeoutID.current);
    endTimeoutID.current = setTimeout(() => setEvents({ enabled: true }), 500);
  };

  return (
    <OrbitControls
      enabled={!MultiSelect}
      makeDefault
      onEnd={onEnd}
      onStart={onStart}
    />
  );
};
