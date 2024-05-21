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

  const mode = useStore((state) => state.mode);

  const isEditMode = mode === EDIT_MODE;
  const isCreateMode = mode === CREATE_MODE;

  const rotate = useStore((state) => state.rotate);
  const setRotate = useStore((state) => state.setRotate);

  const setSelectedBricks = useStore((state) => state.setSelectedBricks);
  const selectedBricks = useStore((state) => state.selectedBricks).map(
    (sel) => sel.userData
  ).filter((sel) => Object.keys(sel).length > 0).map((brick) => {
    const { x, z } = brick.dimensions;
    return {
      ...brick,
      dimensions: { x: !rotate ? x : z, z: !rotate ? z : x }
    };
  });

  const selectedBricksAnchor = useMemo(() => {
    return selectedBricks.reduce((acc, brick) => {
      if(brick.position.x < acc.x) acc.setX(brick.position.x);
      if(brick.position.y < acc.y) acc.setY(brick.position.y);
      if(brick.position.z < acc.z) acc.setZ(brick.position.z);
      return acc;
    }, new Vector3(Infinity, Infinity, Infinity));
  });

  const width = useStore((state) => !rotate ? state.width : state.depth);
  const depth = useStore((state) => !rotate ? state.depth : state.width);
  const anchorX = useStore((state) => state.anchorX);
  const anchorZ = useStore((state) => state.anchorZ);
  const color = useStore((state) => state.color);

  const [rawMousePosition, setRawMousePosition] = useState(new Vector3());
  const [mouseIntersect, setMouseIntersect] = useState(new Vector3());

  const room = useStore((state) => state.liveblocks.room);
  const self = useStore((state) => state.self);

  useAnchorShorcuts();

  const addBrick = () => {
    const measures = getMeasurementsFromDimensions({x: width, z: depth});
    const boundingBoxOfBrick = getBoundBoxFromMeasures(mouseIntersect, measures);
    const bricksBoundingBox = bricksBoundBox.current.map((bound) => bound.brickBoundingBox);

    if (!doBoundBoxCollideWithBoundBoxSet(boundingBoxOfBrick, bricksBoundingBox)) {
      const brickData = {
        position: mouseIntersect,
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
    const selectedBricksNewPosition = {};
    let canMove = true;
    for (let index = 0; index < selectedBricks.length; index++) {
      const brick = selectedBricks[index];
      const dimensions = {
        x: !rotate ? brick.dimensions.x : brick.dimensions.z,
        z: !rotate ? brick.dimensions.z : brick.dimensions.x
      }
      const measures = getMeasurementsFromDimensions(dimensions);
      const boundingBoxOfBrick = getBoundBoxFromMeasures(mouseIntersect, measures);
      const newPosition = new Vector3()
        .copy(mouseIntersect)
        .add(brick.position)
        .sub(selectedBricksAnchor);
      selectedBricksNewPosition[brick.uID] = newPosition;
      if (doBoundBoxCollideWithBoundBoxSet(boundingBoxOfBrick, bricksBoundingBox)) {
        canMove = false;
        break;
      }
    }
    if (canMove) {
      setBricks((bricks) =>
        bricks.map((brick) => ({
          ...brick,
          position: selected.includes(brick.uID) ? selectedBricksNewPosition[brick.uID] : brick.position,
          dimensions: {
            x: !selected.includes(brick.uID) || !rotate ? brick.dimensions.x : brick.dimensions.z,
            z: !selected.includes(brick.uID) || !rotate ? brick.dimensions.z : brick.dimensions.x
          }
        }))
      );
      setTimeout(() => {
        setSelectedBricks({});
      }, 5); // This timeout makes the Select component do not click underlying brick after the selected bricks has been moved
      setRotate(false);
    }
  }

  const setBrickCursorPosition = (e) => {
    e.stopPropagation();

    const mousePosition = new Vector3()
      .copy(e.point)
      .add(e.face.normal)
      .setY(Math.abs(e.point.y));

    setRawMousePosition(mousePosition);

    updateMouseIntersectWithTranslation();

    room.broadcastEvent({
      type: self.id,
      data: {
        x: mouseIntersect.x,
        y: mouseIntersect.y,
        z: mouseIntersect.z,
        w: width,
        d: depth,
      },
    });

  };

  const updateMouseIntersectWithTranslation = () => {
    const normalizedMousePosition = normalizePositionToSceneGrid(rawMousePosition);
    normalizedMousePosition.add(
      new Vector3(anchorX * GRID_UNIT.x, 0, anchorZ * GRID_UNIT.z)
    );

    setMouseIntersect(normalizedMousePosition);
  }

  useEffect(() => {
    updateMouseIntersectWithTranslation();
  }, [anchorX, anchorZ]);

  useEffect(() => {
    setRotate(false);
  }, [mode]);

  const onClick = (e) => {
    if (!isEditMode) {
      if (!isDrag.current) addBrick();
      else isDrag.current = false;
    } else if (selectedBricks.length > 0 && !e.shiftKey) {
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
        position={mouseIntersect}
        visible={isCreateMode}
        dimensions={{ x: width, z: depth }}
      />
      <MultiBrickCursor
        anchor={selectedBricksAnchor}
        position={mouseIntersect}
        bricks={selectedBricks}
      />
      <Others />
    </>
  );
};
