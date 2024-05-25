/* eslint-disable react/no-unknown-property */
/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
/* eslint-disable react/display-name */
import React, { forwardRef, useMemo } from "react";
import { getMeasurementsFromDimensions, createGeometry } from "../../utils";
import { Vector3 } from "three";

export const BrickCursor = forwardRef(
  (
    {
      position = new Vector3(),
      dimensions = { x: 1, z: 1 },
      visible = true
    },
    ref
  ) => {
    const { height, width, depth } = getMeasurementsFromDimensions(dimensions);

    const brickGeometry = useMemo(() => {
      return createGeometry({ width, height, depth, dimensions, knobDim: 0});
    }, [width, height, depth, dimensions]);

    return (
      <>
        <group
          ref={ref}
          position={[position.x, position.y, position.z]}
          visible={visible}
        >
          <mesh
            geometry={brickGeometry}
          >
            <meshBasicMaterial
              color={"white"}
              transparent={true}
              opacity={0.3}
            />
          </mesh>
        </group>
      </>
    );
});
