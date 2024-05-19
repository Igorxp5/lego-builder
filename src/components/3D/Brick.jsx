/* eslint-disable react/no-unknown-property */
/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
/* eslint-disable react/display-name */
import React, { useMemo, useEffect, useRef } from "react";
import {
  CSSToHex,
  getMeasurementsFromDimensions,
  getBoundBoxFromMeasures,
  createGeometry,
} from "../../utils";
import { Vector3, Box3 } from "three";
import { motion } from "framer-motion-3d";

export const Brick = ({
  position,
  color = "#ff0000",
  dimensions = { x: 1, z: 1 },
  bricksBoundBox = { current: [] },
  uID = "",
  onClick = () => {},
  mouseMove = () => {},
}) => {
  const brickRef = useRef();

  const { height, width, depth } = getMeasurementsFromDimensions(dimensions);

  const brickGeometry = useMemo(() => {
    return createGeometry({ width, height, depth, dimensions });
  }, [width, height, depth, dimensions]);

  useEffect(() => {
    const brickBoundingBox = getBoundBoxFromMeasures(position, { width, height, depth });

    bricksBoundBox.current.push({ uID, brickBoundingBox });

    return () => {
      const newA = [];
      for (let i = 0; i < bricksBoundBox.current.length; i++) {
        const element = bricksBoundBox.current[i];
        if (element.uID !== uID) {
          newA.push(element);
        }
      }
      bricksBoundBox.current = newA;
    };
  }, [uID, bricksBoundBox]);

  return (
    <>
      <motion.group
        ref={brickRef}
        position={[position.x, position.y, position.z]}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 250, duration: 2 }}
        userData={{
          uID,
        }}
      >
        <mesh
          castShadow
          receiveShadow
          userData={{
            uID,
            dimensions,
            height,
            width,
            depth,
            type: `${dimensions.x}-${dimensions.z}`,
            position,
          }}
          onClick={onClick}
          geometry={brickGeometry}
          onPointerMove={mouseMove}
          transparent={true}
        >
          <meshStandardMaterial
            color={CSSToHex(color)}
            metalness={0.4}
            roughness={0.5}
          />
        </mesh>
      </motion.group>
    </>
  );
};
