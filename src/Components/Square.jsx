import React from "react";
import "./Square.css";

const Square = ({ value, onClick, highlight, lineDirection }) => {
  return (
    <button
      className={`w-20 h-20 border-2 flex items-center justify-center text-3xl font-bold transition-transform duration-200 ease-in-out transform hover:scale-110 ${value ? "square-occupied" : ""} ${
        highlight ? `highlight ${lineDirection}` : ""
      } ${value === "X" ? "x-value" : value === "O" ? "o-value" : ""}`}
      onClick={onClick}
    >
      {value}
    </button>
  );
};

export default Square;
