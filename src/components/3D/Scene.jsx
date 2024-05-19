/* eslint-disable no-unused-vars */
/* eslint-disable react/no-unknown-property */
import { useEffect, useRef, useState, useMemo } from "react";
import {
  Brick,
  BrickCursor,
  Lights,
  Workspace,
  BrickOutline,
  DeleteBrick,
  Select,
} from ".";
import { Vector3 } from "three";
import {
  uID,
  getMeasurementsFromDimensions,
  normalizePositionToSceneGrid,
  getBoundBoxFromDimensions,
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

  const width = useStore((state) => state.width);
  const depth = useStore((state) => state.depth);
  const color = useStore((state) => state.color);

  const [mouseIntersect, setMouseIntersect] = useState(new Vector3());

  const room = useStore((state) => state.liveblocks.room);
  const self = useStore((state) => state.self);

  const addBrick = () => {
    const dimensions = getMeasurementsFromDimensions({x: width, z: depth});
    const boundingBoxOfBrickToBeAdded = getBoundBoxFromDimensions(mouseIntersect, dimensions); 

    let canCreate = true;

    for (let index = 0; index < bricksBoundBox.current.length; index++) {
      const brickBoundingBox = bricksBoundBox.current[index].brickBoundingBox;
      const collision =
        boundingBoxOfBrickToBeAdded.intersectsBox(brickBoundingBox);

      if (collision) {
        const dx = Math.abs(
          brickBoundingBox.max.x - boundingBoxOfBrickToBeAdded.max.x
        );
        const dz = Math.abs(
          brickBoundingBox.max.z - boundingBoxOfBrickToBeAdded.max.z
        );
        const yIntsersect =
          brickBoundingBox.max.y - 9 > boundingBoxOfBrickToBeAdded.min.y;
        if (
          yIntsersect &&
          dx !== dimensions.width &&
          dz !== dimensions.depth
        ) {
          canCreate = false;
          break;
        }
      }
    }

    if (canCreate) {
      const brickData = {
        position: mouseIntersect,
        uID: uID(),
        dimensions: { x: width, z: depth },
        color: color,
      };

      setBricks((prevBricks) => [...prevBricks, brickData]);
    }
  };

  const setBrickCursorPosition = (e) => {
    e.stopPropagation();
    if (isEditMode) return;

    const mousePosition = new Vector3()
      .copy(e.point)
      .add(e.face.normal)
      .setY(Math.abs(e.point.y));
    
    const normalizedMousePosition = normalizePositionToSceneGrid(mousePosition);

    setMouseIntersect(normalizedMousePosition);

    room.broadcastEvent({
      type: self.id,
      data: {
        x: normalizedMousePosition.x,
        y: normalizedMousePosition.y,
        z: normalizedMousePosition.z,
        w: width,
        d: depth,
      },
    });
  };

  const onClick = (e) => {
    if (!isEditMode) {
      if (!isDrag.current) addBrick();
      else isDrag.current = false;
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
      <Others />
    </>
  );
};
