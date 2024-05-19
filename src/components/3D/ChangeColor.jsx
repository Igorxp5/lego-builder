/* eslint-disable react/no-unknown-property */
/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
/* eslint-disable react/display-name */
import React, { useDeferredValue, useEffect, useRef } from "react";
import { useStore } from "../../store";

export const ChangeColor = ({ color }) => {
  const selected = useStore((state) => state.selectedBricks).map(
    (sel) => sel.userData.uID
  );

  const setBricks = useStore((state) => state.setBricks);

  useEffect(() => {
    if (selected.length > 0) {
      setBricks((bricks) =>
        bricks.map((brick) => ({
          ...brick,
          color: selected.includes(brick.uID) ? color : brick.color
        }))
      );
    }
  }, [color]);

  return null;
};
