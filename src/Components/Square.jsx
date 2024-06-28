import React from "react";

const Square = ({value, onClick, highlight}) =>{
    return(
        <button className={`w-20 h-20 bg-gray-200 border border-gray-300 flex items-center justify-center text-3xl font-bold transition-transform duration-200 ease-in-out transform hover:scale-110 ${value ? "square-occupied": ""} ${highlight ? "bg-yellow-400" : ""}`} onClick={onClick}>
            {value}
        </button>
    );
};

export default Square;