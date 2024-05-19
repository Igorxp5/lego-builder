/* eslint-disable react/no-unknown-property */
/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
/* eslint-disable react/display-name */
import React, { useMemo } from "react";
import { Vector3 } from "three";
import { getMeasurementsFromDimensions, createGeometry } from "../../utils";

export const MultiBrickCursor = ({position, anchor, bricks, visible = true}) => {
  const meshes = useMemo(() => {
    return bricks.map((brick) => {
      const { height, width, depth } = getMeasurementsFromDimensions(brick.dimensions);
      const brickGeometry = createGeometry({ width, height, depth, dimensions: brick.dimensions, knobDim: 0});

      return {
        uID: brick.uID,
        relPosition: new Vector3().copy(brick.position).sub(anchor).toArray(),
        geometry: brickGeometry
      }
    })
  }, [anchor, bricks]);

  return (
    <>
      <group
        position={[position.x, position.y, position.z]}
        visible={visible}
      >
        {meshes.map((mesh) => {
          return (
            <mesh
              key={mesh.uID}
              position={mesh.relPosition}
              geometry={mesh.geometry}
            >
              <meshBasicMaterial
                color={"white"}
                transparent={true}
                opacity={0.3}
              />
            </mesh>
          );
        })}
      </group>
    </>
  );
};
