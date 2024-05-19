import { create } from "zustand";
import {
  CREATE_MODE,
  DEFAULT_WIDTH,
  DEFAULT_DEPTH,
  DEFAULT_ANCHOR,
  generateSoftColors,
  uID,
} from "../utils";
import { createClient } from "@liveblocks/client";
import { liveblocks } from "@liveblocks/zustand";

const client = createClient({
  publicApiKey: import.meta.env.VITE_LIVEBLOCKS_API_KEY,
});

const id = uID();
const color = generateSoftColors();

export const useStore = create(
  liveblocks(
    (set) => ({
      mode: CREATE_MODE,
      setMode: (newMode) => set({ mode: newMode }),

      width: DEFAULT_WIDTH,
      setWidth: (newWidth) => set({ width: newWidth }),

      depth: DEFAULT_DEPTH,
      setDepth: (newDepth) => set({ depth: newDepth }),

      anchorX: DEFAULT_ANCHOR,
      setAnchorX: (newAnchorPoint) => set({ anchorX: newAnchorPoint }),

      anchorZ: DEFAULT_ANCHOR,
      setAnchorZ: (newAnchorPoint) => set({ anchorZ: newAnchorPoint }),

      color: "#ff0000",
      setColor: (newColor) => set({ color: newColor }),

      selectedBricks: [],
      setSelectedBricks: ({ object, multiple, shift }) =>
        set((state) => {
          if (object === undefined) return { selectedBricks: [] };
          else if (Array.isArray(object)) return { selectedBricks: object };
          else if (!multiple)
            return state.selectedBricks[0] === object
              ? { selectedBricks: [] }
              : { selectedBricks: [object] };
          else if (shift && state.selectedBricks.includes(object))
            return {
              selectedBricks: state.selectedBricks.filter((o) => o !== object),
            };
          else if (shift) return { selectedBricks: [object, ...state.selectedBricks] };
          else return {};
        }),

      bricks: [],
      setBricks: (getBricks) =>
        set((state) => ({ bricks: getBricks(state.bricks) })),
      clearBricks: () => set({ bricks: [] }),

      self: { id: id, color: color },
      setSelfName: (name) =>
        set((state) => ({ self: { ...state.self, name: name } })),

      cursorColors: {},
      setCursorColors: (newCursorColor) =>
        set((state) => ({
          cursorColors: { ...state.cursorColors, ...newCursorColor },
        })),

      removeCursorColor: (id) =>
        set((state) => {
          delete state.cursorColors[id];
          return { cursorColors: { ...state.cursorColors } };
        }),
    }),
    {
      client,
      presenceMapping: { self: true },
      storageMapping: { bricks: true, cursorColors: true },
    }
  )
);
