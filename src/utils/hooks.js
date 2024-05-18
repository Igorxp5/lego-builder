import useKeyboardShortcut from "use-keyboard-shortcut";

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
