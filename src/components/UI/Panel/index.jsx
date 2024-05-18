/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React from "react";
import "./styles.css";
import { SliderWithLabel } from "./Slider";
import { ColorInput } from "./ColorInput";

export const Panel = () => {
  return (
    <div className="Panel">
      <SliderWithLabel label="width" max={5} />
      <SliderWithLabel label="depth" max={5} />
      <ColorInput />
    </div>
  );
};
