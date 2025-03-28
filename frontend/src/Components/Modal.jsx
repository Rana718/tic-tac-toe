import React from "react";

const Modal = ({ message, onClose, button_message, timer }) => {
  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-gray-800 to-slate-900 p-6 rounded-lg shadow-xl text-center border border-purple-500/20">
        <h2 className="text-xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400">{message}</h2>
        {timer !== null &&
          <div className="text-xl font-bold mb-4 text-red-400">
            Rematch in: {timer}s
          </div>
        }
        <button className="mt-4 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors duration-300" onClick={onClose}>
          {button_message}
        </button>
      </div>
    </div>
  );
};

export default Modal;