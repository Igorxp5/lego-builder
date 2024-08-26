/* eslint-disable no-unused-vars */
import React, { useRef, useState } from "react";
import { HexColorPicker } from "react-colorful";
import "./styles.css";
import { useStore } from "../../../../store";
// import useDebounce from "use-debouncy";

export const ColorInput = () => {
  const setColor = useStore((state) => state.setColor);

  const [inputColorText, setInputColorText] = useState("#000000"); // Manage input state
  const [inputColorPicker, setInputColorPicker] = useState(inputColorText); // Manage input state

  const tId = useRef();

  const debouncesetColor = (color) => {
    if (tId.current) clearTimeout(tId.current);

    tId.current = setTimeout(() => {
      setColor(color);
      setInputColorText(color);
    }, 200);
  };

  const onChangeInputText = (value) => {
    // Regular expression for a valid hex color (including shorthand and full format)
    const hexColorPattern = /^#([0-9A-Fa-f]{3}){1,2}$/;
    const invalidChars = /[^#0-9A-Fa-f]/g;

    value = value.replaceAll(invalidChars, "");
    if (value == "") {
      value = "#";
    }
    setInputColorText(value);
    if (hexColorPattern.test(value)) {
      setInputColorPicker(value);
      setColor(value);
    }
  }

  return (
    <div className="SliderInputContainer">
      <label className="SliderLabel">Color</label>
      <div className="SliderColorPickerContainer">
        <HexColorPicker color={inputColorPicker} onChange={debouncesetColor} />
        <input 
          className="SliderColorPickerInput" 
          type="text" 
          value={inputColorText} 
          onChange={e => onChangeInputText(e.target.value)}
          placeholder="#000000" 
        />
      </div>
    </div>
  );
};
