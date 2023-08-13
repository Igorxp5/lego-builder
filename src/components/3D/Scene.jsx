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
import { Vector3, Box3 } from "three";
import {
  uID,
  getMeasurementsFromDimensions,
  base,
  useAnchorShorcuts,
  minWorkSpaceSize,
  EDIT_MODE,
} from "../../utils";
import { ChangeColor } from "./ChangeColor";
import { useStore } from "../../store";
// import { BorderPlane } from "./BorderPlane";
import { Others } from "./Others";

export const Scene = () => {
  const bricks = useStore((state) => state.bricks);
  const setBricks = useStore((state) => state.setBricks);

  const bricksBoundBox = useRef([]);

  const brickCursorRef = useRef();

  const mode = useStore((state) => state.mode);

  const isEditMode = mode === EDIT_MODE;

  const width = useStore((state) => state.width);
  const depth = useStore((state) => state.depth);
  const anchorX = useStore((state) => state.anchorX);
  const anchorZ = useStore((state) => state.anchorZ);
  const rotate = useStore((state) => state.rotate);
  const color = useStore((state) => state.color);

  const room = useStore((state) => state.liveblocks.room);
  const self = useStore((state) => state.self);

  // useAnchorShorcuts(anchorX, anchorZ, set);

  // const setSelection = useStore(state => state.setSelectedBricks)

  // function undoAddedBrick() {
  //   setSelection({}); // this should unselect the bricks but Doesn't work for now because of undo is button within leva
  //   setBricks((prevBricks) => {
  //     prevBricks.pop();
  //     return [...prevBricks];
  //   });
  // }

  const addBrick = (e) => {
    e.stopPropagation();

    if (isEditMode) return;

    if (!e.face?.normal || !e.point) return;

    if (!brickCursorRef.current) return;

    if (!isDrag.current) {
      const dimensions = getMeasurementsFromDimensions({
        x: width,
        z: depth,
      });
      const boundingBoxOfBrickToBeAdded = new Box3().setFromObject(
        brickCursorRef.current
      );

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
          intersect: { point: e.point, face: e.face },
          uID: uID(),
          dimensions: { x: width, z: depth },
          rotation: rotate ? Math.PI / 2 : 0,
          color: color,
          translation: { x: anchorX, z: anchorZ },
        };

        setBricks((prevBricks) => [...prevBricks, brickData]);
      }
    } else {
      isDrag.current = false;
    }
  };

  const setBrickCursorPosition = (e) => {
    e.stopPropagation();
    if (isEditMode) return;
    if (!brickCursorRef.current) return;
    const { height } = getMeasurementsFromDimensions({
      x: width,
      z: depth,
    });

    const evenWidth = !rotate ? width % 2 === 0 : depth % 2 === 0;
    const evenDepth = !rotate ? depth % 2 === 0 : width % 2 === 0;

    brickCursorRef.current.position
      .copy(new Vector3(e.point.x, Math.abs(e.point.y), e.point.z))
      .add(
        new Vector3(e.face.normal.x, Math.abs(e.face.normal.y), e.face.normal.z)
      )
      .divide(new Vector3(base, height, base))
      .floor()
      .multiply(new Vector3(base, height, base))
      .add(
        new Vector3(
          evenWidth ? base : base / 2,
          height / 2,
          evenDepth ? base : base / 2
        )
      );

    room.broadcastEvent({
      type: self.id,
      data: {
        x: brickCursorRef.current.position.x,
        y: brickCursorRef.current.position.y,
        z: brickCursorRef.current.position.z,
        w: width,
        d: depth,
      },
    });
  };

  const onClick = (e) => {
    if (!isEditMode) addBrick(e);
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
        workspaceSize={minWorkSpaceSize}
      />
      <BrickCursor
        ref={brickCursorRef}
        rotation={rotate ? Math.PI / 2 : 0}
        dimensions={{ x: width, z: depth }}
        translation={{ x: anchorX, z: anchorZ }}
      />
      <Others />
    </>
  );
};
