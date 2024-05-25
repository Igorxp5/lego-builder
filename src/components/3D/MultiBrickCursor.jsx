/* eslint-disable react/no-unknown-property */
/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
/* eslint-disable react/display-name */
import React, { useMemo } from "react";
import { Vector3 } from "three";
import { getMeasurementsFromDimensions, createGeometry } from "../../utils";

export const MultiBrickCursor = ({position, anchor, bricks, rotate = false, visible = true}) => {
  const meshes = useMemo(() => {
    return bricks.map((brick) => {
      const dimensions = {
        x: !rotate ? brick.dimensions.x : brick.dimensions.z,
        z: !rotate ? brick.dimensions.z : brick.dimensions.x
      }
      const { height, width, depth } = getMeasurementsFromDimensions(dimensions);
      const brickGeometry = createGeometry({ width, height, depth, dimensions: dimensions, knobDim: 0});

      return {
        uID: brick.uID,
        relPosition: new Vector3()
          .copy(brick.position)
          .sub(anchor)
          .applyAxisAngle(new Vector3(0, 1, 0), rotate ? Math.PI / 2 : 0)
          .toArray(),
        geometry: brickGeometry
      }
    })
  }, [anchor, bricks, rotate]);

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
