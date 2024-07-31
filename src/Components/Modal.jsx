import React from "react";

const Modal = ({ message, onClose, button_message, timer}) => {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
      <div className="bg-gradient-to-r from-blue-200 to-purple-300  p-6 rounded-lg shadow-lg text-center text-white">
        <h2 className="text-2xl font-bold mb-4">{message}</h2>
        {timer !== null && 
          <div className="text-xl font-bold mb-4 text-red-700">
            Rematch in: {timer}s
          </div>
        }
        <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300" onClick={onClose}>
          {button_message}
        </button>
      </div>
    </div>
  );
};

export default Modal;
