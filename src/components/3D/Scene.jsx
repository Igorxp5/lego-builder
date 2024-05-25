/* eslint-disable no-unused-vars */
/* eslint-disable react/no-unknown-property */
import { useEffect, useRef, useState, useMemo } from "react";
import {
  Brick,
  BrickCursor,
  MultiBrickCursor,
  Lights,
  Workspace,
  BrickOutline,
  DeleteBrick,
  Select,
} from ".";
import { Vector3 } from "three";
import {
  uID,
  useAnchorShorcuts,
  getMeasurementsFromDimensions,
  normalizePositionToSceneGrid,
  getBoundBoxFromMeasures,
  doBoundBoxCollideWithBoundBoxSet,
  GRID_UNIT,
  MIN_WORKSPACE_SIZE,
  EDIT_MODE,
  CREATE_MODE,
} from "../../utils";
import { ChangeColor } from "./ChangeColor";
import { useStore } from "../../store";

import { Others } from "./Others";

export const Scene = () => {
  const bricks = useStore((state) => state.bricks);
  const setBricks = useStore((state) => state.setBricks);

  const bricksBoundBox = useRef([]);

  const brickCursorRef = useRef();
  const multiBrickCursorRef = useRef();

  const mode = useStore((state) => state.mode);

  const isEditMode = mode === EDIT_MODE;
  const isCreateMode = mode === CREATE_MODE;

  const setSelectedBricks = useStore((state) => state.setSelectedBricks);
  const selectedBricks = useStore((state) => state.selectedBricks).map(
    (sel) => sel.userData
  ).filter((sel) => Object.keys(sel).length > 0);
  const hasSelectedBricks = selectedBricks.length > 0; 

  const selectedBricksAnchor = useMemo(() => {
    return selectedBricks.reduce((acc, brick) => {
      if(brick.position.x < acc.x) acc.setX(brick.position.x);
      if(brick.position.y < acc.y) acc.setY(brick.position.y);
      if(brick.position.z < acc.z) acc.setZ(brick.position.z);
      return acc;
    }, new Vector3(Infinity, Infinity, Infinity));
  }, [hasSelectedBricks]);

  const rotate = useStore((state) => state.rotate);
  const setRotate = useStore((state) => state.setRotate);

  const width = useStore((state) => !rotate ? state.width : state.depth);
  const depth = useStore((state) => !rotate ? state.depth : state.width);
  const anchorX = useStore((state) => state.anchorX);
  const anchorZ = useStore((state) => state.anchorZ);
  const color = useStore((state) => state.color);

  const room = useStore((state) => state.liveblocks.room);
  const self = useStore((state) => state.self);

  useAnchorShorcuts();

  const addBrick = () => {
    const measures = getMeasurementsFromDimensions({x: width, z: depth});
    const boundingBoxOfBrick = getBoundBoxFromMeasures(brickCursorRef.current.position, measures);
    const bricksBoundingBox = bricksBoundBox.current.map((bound) => bound.brickBoundingBox);

    if (!doBoundBoxCollideWithBoundBoxSet(boundingBoxOfBrick, bricksBoundingBox)) {
      const brickData = {
        position: new Vector3().copy(brickCursorRef.current.position),
        uID: uID(),
        dimensions: { x: width, z: depth },
        color: color,
      };

      setBricks((prevBricks) => [...prevBricks, brickData]);
    }
  };

  const updateBrickPosition = () => {
    const selected = selectedBricks.map((sel) => sel.uID);
    const bricksBoundingBox = bricksBoundBox.current.map((bound) => bound.brickBoundingBox);
    const selectedBricksNewProps = {};
    let canMove = true;
    for (let index = 0; index < selectedBricks.length; index++) {
      const brick = selectedBricks[index];
      selectedBricksNewProps[brick.uID] = {};
      const dimensions = {
        x: !rotate ? brick.dimensions.x : brick.dimensions.z, 
        z: !rotate ? brick.dimensions.z : brick.dimensions.x 
      }
      const position = new Vector3()
        .add(brick.position)
        .sub(selectedBricksAnchor)
        .applyAxisAngle(new Vector3(0, 1, 0), rotate ? Math.PI / 2 : 0)
        .add(multiBrickCursorRef.current.position);
      const measures = getMeasurementsFromDimensions(dimensions);
      const boundingBoxOfBrick = getBoundBoxFromMeasures(position, measures);
      if (doBoundBoxCollideWithBoundBoxSet(boundingBoxOfBrick, bricksBoundingBox)) {
        canMove = false;
        break;
      }
      selectedBricksNewProps[brick.uID].position = position;
      selectedBricksNewProps[brick.uID].dimensions = dimensions;
    }
    if (canMove) {
      setBricks((bricks) =>
        bricks.map((brick) => ({
          ...brick,
          ...(selected.includes(brick.uID) ? selectedBricksNewProps[brick.uID] : {})
        }))
      );
      setTimeout(() => {
        setSelectedBricks({});
      }, 5); // This timeout makes the Select component do not click underlying brick after the selected bricks has been moved
    }
  }

  const setBrickCursorPosition = (e) => {
    e.stopPropagation();

    const mousePosition = normalizePositionToSceneGrid(
      new Vector3()
      .copy(e.point)
      .add(e.face.normal)
      .setY(Math.abs(e.point.y))
    );

    const translatedXZMousePosition = new Vector3()
      .copy(mousePosition)
      .add(new Vector3(anchorX * GRID_UNIT.x, 0, anchorZ * GRID_UNIT.z));

    if (isCreateMode && brickCursorRef.current) {
      brickCursorRef.current.userData.mousePosition = mousePosition; 
      brickCursorRef.current.position.copy(translatedXZMousePosition);
    }

    if (isEditMode && multiBrickCursorRef.current) {
      multiBrickCursorRef.current.userData.mousePosition = mousePosition; 
      multiBrickCursorRef.current.position.copy(translatedXZMousePosition);
    }

    room.broadcastEvent({
      type: self.id,
      data: {
        x: translatedXZMousePosition.x,
        y: translatedXZMousePosition.y,
        z: translatedXZMousePosition.z,
        w: width,
        d: depth,
      },
    });

  };

  useEffect(() => {
    if (isCreateMode && brickCursorRef.current && brickCursorRef.current.userData.mousePosition) {
      brickCursorRef.current.position
        .copy(brickCursorRef.current.userData.mousePosition)
        .add(new Vector3(anchorX * GRID_UNIT.x, 0, anchorZ * GRID_UNIT.z));
    }

    if (isEditMode && multiBrickCursorRef.current && multiBrickCursorRef.current.userData.mousePosition) {
      multiBrickCursorRef.current.position
        .copy(multiBrickCursorRef.current.userData.mousePosition)
        .add(new Vector3(anchorX * GRID_UNIT.x, 0, anchorZ * GRID_UNIT.z));
    }
  }, [anchorX, anchorZ]);

  useEffect(() => {
    setRotate(false);
  }, [mode, hasSelectedBricks]);

  const onClick = (e) => {
    if (!isEditMode) {
      if (!isDrag.current) addBrick();
      else isDrag.current = false;
    } else if (hasSelectedBricks && !e.shiftKey) {
      updateBrickPosition();
    }
  };

  const mouseMove = (e) => {
    setBrickCursorPosition(e);
  };

  const isDrag = useRef(false);
  const timeoutID = useRef(null);

  useEffect(() => {
    const pointerDown = () => {
      timeoutID.current && clearTimeout(timeoutID.current);
      timeoutID.current = setTimeout(() => {
        isDrag.current = true;
      }, 300);
    };

    const pointerUp = () => {
      timeoutID.current && clearTimeout(timeoutID.current);
    };

    window.addEventListener("pointerdown", pointerDown);
    window.addEventListener("pointerup", pointerUp);

    return () => {
      window.removeEventListener("pointerdown", pointerDown);
      window.removeEventListener("pointerup", pointerUp);
    };
  }, []);

  return (
    <>
      <color attach="background" args={["#202025"]} />
      <Select box multiple>
        {bricks.map((b, i) => {
          return (
            <Brick
              key={b.uID}
              {...b}
              onClick={onClick}
              bricksBoundBox={bricksBoundBox}
              mouseMove={mouseMove}
            />
          );
        })}
        <DeleteBrick setBricks={setBricks} />
        <BrickOutline />
        <ChangeColor color={color} setBricks={setBricks} />
      </Select>
      <Lights />
      <Workspace
        onClick={onClick}
        mouseMove={mouseMove}
        workspaceSize={MIN_WORKSPACE_SIZE}
      />
      <BrickCursor
        ref={brickCursorRef}
        visible={isCreateMode}
        dimensions={{ x: width, z: depth }}
      />
      <MultiBrickCursor
        ref={multiBrickCursorRef}
        anchor={selectedBricksAnchor}
        rotate={rotate}
        bricks={selectedBricks}
      />
      <Others />
    </>
  );
};
