import useKeyboardShortcut from "use-keyboard-shortcut";
import { useStore } from "../store";

export const useAnchorShorcuts = () => {
  const setAnchorX = useStore((state) => state.setAnchorX);
  const setAnchorY = useStore((state) => state.setAnchorY);
  const setAnchorZ = useStore((state) => state.setAnchorZ);

  const anchorXPlus = () => {
    setAnchorX(useStore.getState().anchorX + 1);
  };

  const anchorXMinus = () => {
    setAnchorX(useStore.getState().anchorX - 1);
  };

  const anchorYPlus = () => {
    setAnchorY(useStore.getState().anchorY + 1);
  };

  const anchorYMinus = () => {
    setAnchorY(useStore.getState().anchorY - 1);
  };

  const anchorZPlus = () => {
    setAnchorZ(useStore.getState().anchorZ + 1);
  };

  const anchorZMinus = () => {
    setAnchorZ(useStore.getState().anchorZ - 1);
  };

  useKeyboardShortcut(["D"], anchorXPlus, {
    overrideSystem: true,
    ignoreInputFields: true,
    repeatOnHold: false,
  });

  useKeyboardShortcut(["A"], anchorXMinus, {
    overrideSystem: true,
    ignoreInputFields: true,
    repeatOnHold: false,
  });

  useKeyboardShortcut(["R"], anchorYPlus, {
    overrideSystem: true,
    ignoreInputFields: true,
    repeatOnHold: false,
  });

  useKeyboardShortcut(["F"], anchorYMinus, {
    overrideSystem: true,
    ignoreInputFields: true,
    repeatOnHold: false,
  });

  useKeyboardShortcut(["W"], anchorZPlus, {
    overrideSystem: true,
    ignoreInputFields: true,
    repeatOnHold: false,
  });

  useKeyboardShortcut(["S"], anchorZMinus, {
    overrideSystem: true,
    ignoreInputFields: true,
    repeatOnHold: false,
  });

  return null;
};

export const useDeleteShortcut = (selected, setBricks, onDelete) => {
  const deleteSelectedBricks = () => {
    const deletedBricks = [];
    setBricks((bricks) =>
      bricks.filter((brick) => {
        const selectedClone = [...selected];
        const uID = brick.uID;
        let should = true;
        for (let i = 0; i < selectedClone.length; i++) {
          const selectedUID = selectedClone[i];
          if (uID === selectedUID) {
            should = false;
            const deleted = selectedClone.splice(i, 1);
            deletedBricks.push(deleted);
          }
        }
        return should;
      })
    );
    onDelete(deletedBricks);
  };

  useKeyboardShortcut(["Delete"], deleteSelectedBricks, {
    overrideSystem: true,
    ignoreInputFields: false,
    repeatOnHold: false,
  });

  return null;
};

export const useEscapeShortcut = (onPressed) => {
  useKeyboardShortcut(["Escape"], onPressed, {
    overrideSystem: true,
    ignoreInputFields: false,
    repeatOnHold: false,
  });
}

export const useUndoRedoShortcut = (undo, redo) => {
  useKeyboardShortcut(["Control", "Z"], undo, {
    overrideSystem: true,
    ignoreInputFields: false,
    repeatOnHold: false,
  });

  useKeyboardShortcut(["Control", "R"], redo, {
    overrideSystem: true,
    ignoreInputFields: false,
    repeatOnHold: false,
  });

  return null;
};
