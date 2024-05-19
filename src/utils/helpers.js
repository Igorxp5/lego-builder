import { BASE, GRID_UNIT, KNOB_SIZE } from "./constants";
import { BoxGeometry, CylinderGeometry, Vector3, Box3 } from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

export const SCENE_GRID_NORM = new Vector3(GRID_UNIT.x, GRID_UNIT.y, GRID_UNIT.z); 

export function CSSToHex(cssColor) {
  return parseInt(`0x${cssColor.substring(1)}`, 16);
}

export function getMeasurementsFromDimensions({ x, y, z }) {
  return {
    width: GRID_UNIT.x * x,
    height: GRID_UNIT.y || GRID_UNIT.y * y,
    depth: GRID_UNIT.z * z,
  };
}

export function normalizeVector3(vector, norm) {
  return new Vector3()
    .copy(vector)
    .divide(norm)
    .floor()
    .multiply(norm);
}

export function normalizePositionToSceneGrid(vector) {
  return normalizeVector3(vector, SCENE_GRID_NORM);
}

export function mergeMeshes(geometries) {
  return mergeGeometries(geometries);
}

export function getBoundBoxFromMeasures(position, {width, height, depth}) {
  return new Box3(
    position,
    new Vector3()
      .copy(position)
      .add(new Vector3(width, height, depth))
  );
}

export function createGeometry({
  width,
  height,
  depth,
  dimensions,
  knobDim = KNOB_SIZE,
}) {
  let geometries = [];
  const cubeGeo = new BoxGeometry(width - 0.1, height + 0.1, depth - 0.1);
  const originTranslate = {x: width / 2, y: height / 2, z: depth / 2}
  cubeGeo.translate(originTranslate.x, originTranslate.y, originTranslate.z);
  geometries.push(cubeGeo);

  for (let i = 0; i < dimensions.x; i++) {
    for (let j = 0; j < dimensions.z; j++) {
      const cylinder = new CylinderGeometry(knobDim, knobDim, knobDim, 20);
      const x = GRID_UNIT.x * i - ((dimensions.x - 1) * GRID_UNIT.x) / 2;
      const y = BASE / 1.5;
      const z = GRID_UNIT.z * j - ((dimensions.z - 1) * GRID_UNIT.z) / 2;
      cylinder.translate(originTranslate.x + x, originTranslate.y + y, originTranslate.z + z);
      geometries.push(cylinder);
    }
  }

  const brickGeometry = mergeGeometries(geometries);
  return brickGeometry;
}

export function doBoundBoxCollideWithBoundBoxSet(testBoundBox, targetBoxes) {
  for (let index = 0; index < targetBoxes.length; index++) {
    const boundingBox = targetBoxes[index];
    const collision = testBoundBox.intersectsBox(boundingBox);
    
    const size = testBoundBox.getSize(new Vector3());
    const width = size.x;
    const depth = size.z;

    if (collision) {
      const dx = Math.abs(
        boundingBox.max.x - testBoundBox.max.x
      );
      const dz = Math.abs(
        boundingBox.max.z - testBoundBox.max.z
      );
      const yIntsersect =
        boundingBox.max.y - 9 > testBoundBox.min.y;
      if (
        yIntsersect &&
        dx !== width &&
        dz !== depth
      ) {
        return true;
      }
    }
  }
  return false;
}

export function collisonXYZ(o1, o2) {
  if (
    Math.abs(o1.position.x - o2.position.x) >
    (o1.geometry.parameters.width + o2.geometry.parameters.width) / 2
  )
    return false;
  if (
    Math.abs(o1.position.y - o2.position.y) >
    (o1.geometry.parameters.height + o2.geometry.parameters.height) / 2
  )
    return false;
  if (
    Math.abs(o1.position.z - o2.position.z) >
    (o1.geometry.parameters.depth + o2.geometry.parameters.depth) / 2
  ) {
    return false;
  }
  return true;
}

export function degToRad(angle) {
  return angle * (Math.PI / 180);
}

export function radToDeg(angle) {
  return 360 - (angle / Math.PI) * 180;
}

export function uID(length = 8) {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";

  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
}

function hslToRgb(h, s, l) {
  let r, g, b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function rgbToHex(r, g, b) {
  return (
    "#" +
    ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()
  );
}

export function generateSoftColors() {
  const hue = Math.random();
  const saturation = Math.random() * 0.2 + 0.4; // 40% to 60%
  const lightness = Math.random() * 0.3 + 0.5; // 50% to 80%

  const [r, g, b] = hslToRgb(hue, saturation, lightness);
  const hexColor = rgbToHex(r, g, b);

  return hexColor;
}

export function isBlank(str) {
  return !str || /^\s*$/.test(str);
}
