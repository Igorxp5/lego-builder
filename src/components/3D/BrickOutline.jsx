/* eslint-disable react/no-unknown-property */
/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
/* eslint-disable react/display-name */
// import { useSelect } from ".";
import React, { useLayoutEffect, useMemo, useRef } from "react";
import {
  createGeometry,
  getMeasurementsFromDimensions,
  KNOB_SIZE,
  OUTLINE_WIDTH,
} from "../../utils";
import { BackSide, Object3D } from "three";
import { useStore } from "../../store";

const dummy = new Object3D();

const OutlineMesh = ({ meshesData }) => {
  const ref = useRef();

  const dimensions = meshesData[0]?.dimensions;

  const { height, width, depth } = dimensions
    ? getMeasurementsFromDimensions(dimensions)
    : {};

  const outlineGeometry = useMemo(() => {
    return createGeometry({
      width: width + OUTLINE_WIDTH * 2,
      height: height + OUTLINE_WIDTH * 2,
      depth: depth + OUTLINE_WIDTH * 2,
      dimensions,
      knobDim: KNOB_SIZE + OUTLINE_WIDTH,
    });
  }, [width, height, depth, dimensions]);

  useLayoutEffect(() => {
    if (!ref.current) return;

    meshesData.forEach((meshData, i) => {
      dummy.position.set(
        meshData.position.x - OUTLINE_WIDTH,
        meshData.position.y - OUTLINE_WIDTH,
        meshData.position.z - OUTLINE_WIDTH);
      dummy.updateMatrix();
      ref.current.setMatrixAt(i, dummy.matrix);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  }, [meshesData]);

  return (
    <>
      <instancedMesh
        ref={ref}
        position={[0, 0.5, 0]}
        args={[outlineGeometry, null, meshesData.length]}
        raycast={() => {}}
      >
        <meshBasicMaterial color={"white"} side={BackSide} />
      </instancedMesh>
    </>
  );
};

export const BrickOutline = () => {
  const selected = useStore((state) => state.selectedBricks).map(
    (sel) => sel.userData
  );

  const selectedMeshes = useMemo(() => {
    const meshesAccrodingToType = {};

    for (let i = 0; i < selected.length; i++) {
      const currentSelected = selected[i];
      if (Object.keys(currentSelected).length > 0) {
        meshesAccrodingToType[currentSelected.type] = meshesAccrodingToType[
          currentSelected.type
        ]
          ? [...meshesAccrodingToType[currentSelected.type], currentSelected]
          : [currentSelected];
      }
    }

    return meshesAccrodingToType;
  }, [selected]);

  return (
    <>
      {Object.entries(selectedMeshes).map(([key, value]) => (
        <OutlineMesh key={key} meshesData={value} />
      ))}
    </>
  );
};
