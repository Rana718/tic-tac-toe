import React, { useState, useEffect } from "react";

const Home = ({ onSelectMode }) => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        handleResize();
        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    return (
        <div className="flex flex-col items-center justify-center max-w-screen-xl mx-auto">
            <h1 className="text-4xl font-bold text-white mb-8 text-center">
                Welcome to Tic Tac Toe
            </h1>
            <div className={`flex ${isMobile ? "flex-col" : "justify-around"} w-full max-w-3xl mb-8 space-y-4 md:space-y-0`}>
                <div className="flex flex-col px-2 items-center">
                    <img src="Board_img.png" alt="1v1 Offline" className="w-48 rounded-lg h-48 mb-4" />
                    <button className="px-6 py-3 bg-green-500 text-white rounded-lg shadow-lg hover:bg-green-600 transition-all duration-300" onClick={() => onSelectMode("offline")}>
                        Play 1v1 Offline
                    </button>
                </div>
                <div className="flex flex-col px-2 items-center">
                    <img src="Board_img.png" alt="1 vs Bot" className="w-48 rounded-lg h-48 mb-4" />
                    <button className="px-6 py-3 bg-blue-500 text-white rounded-lg shadow-lg hover:bg-blue-600 transition-all duration-300" onClick={() => onSelectMode("bot")}>
                        Play 1 vs Bot
                    </button>
                </div>
                <div className="flex flex-col items-center">
                    <img src="Board_img.png" alt="Online Play with Player" className="w-48 rounded-lg h-48 mb-4" />
                    <button className="px-6 py-3 bg-orange-400 text-white rounded-lg shadow-lg hover:bg-orange-500 transition-all duration-300" onClick={() => onSelectMode("online")}>
                        Online play with player
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Home;
