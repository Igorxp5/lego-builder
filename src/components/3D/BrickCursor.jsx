/* eslint-disable react/no-unknown-property */
/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
/* eslint-disable react/display-name */
import React, { useMemo } from "react";
import { getMeasurementsFromDimensions, createGeometry } from "../../utils";

export const BrickCursor = ({position, dimensions, visible}) => {
  const { height, width, depth } = getMeasurementsFromDimensions(dimensions);

  const brickGeometry = useMemo(() => {
    return createGeometry({ width, height, depth, dimensions, knobDim: 0});
  }, [width, height, depth, dimensions]);

  return (
    <>
      <group
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
};
