import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Footer from "./Footer";

const Home = ({ onSelectMode }) => {
    const [isMobile, setIsMobile] = useState(false);
    const navigate = useNavigate();

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

    const handleModeSelect = (mode) => {
        onSelectMode(mode);
        navigate(`/${mode}`);
    };

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center max-w-screen-xl mx-auto p-6 my-8"
        >
            <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.7, type: "spring", bounce: 0.4 }}
                className="mb-12 text-center"
            >
                <h1 className="text-5xl md:text-6xl font-bold mb-4 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-cyan-400 to-indigo-400">
                    Welcome to Tic Tac Toe
                </h1>
                <p className="text-lg text-gray-300 max-w-xl">
                    Challenge your friends, test your skills against the bot, or play with other players online.
                </p>
            </motion.div>

            <motion.div 
                variants={container}
                initial="hidden"
                animate="show"
                className={`flex ${isMobile ? "flex-col" : "flex-row"} w-full max-w-4xl mb-8 space-y-6 md:space-y-0 md:space-x-6 justify-center`}
            >
                <GameModeCard 
                    title="1v1 Offline"
                    description="Play against a friend on the same device"
                    icon="👥"
                    gradient="from-purple-600 to-indigo-600"
                    hoverGradient="from-purple-700 to-indigo-700"
                    onClick={() => handleModeSelect("offline")}
                />
                <GameModeCard 
                    title="Play vs Bot"
                    description="Challenge our AI opponent"
                    icon="🤖"
                    gradient="from-blue-600 to-cyan-600"
                    hoverGradient="from-blue-700 to-cyan-700"
                    onClick={() => handleModeSelect("bot")}
                />
                <GameModeCard 
                    title="Online Play"
                    description="Play with players around the world"
                    icon="🌐"
                    gradient="from-cyan-600 to-teal-600"
                    hoverGradient="from-cyan-700 to-teal-700"
                    onClick={() => handleModeSelect("online")}
                />
            </motion.div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="mt-8 bg-gray-800/50 p-6 rounded-lg border border-gray-700 max-w-3xl"
            >
                <h2 className="text-2xl font-bold text-center text-white mb-4">How to Play</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <InstructionCard number="1" text="Select game mode" />
                    <InstructionCard number="2" text="Place X or O to fill 3 in a row" />
                    <InstructionCard number="3" text="First to get 3 in a row wins!" />
                </div>
            </motion.div>
        </motion.div>
    );
};

const GameModeCard = ({ title, description, icon, gradient, hoverGradient, onClick }) => (
    <motion.div 
        variants={{
            hidden: { opacity: 0, y: 20 },
            show: { opacity: 1, y: 0 }
        }}
        whileHover={{ scale: 1.05, y: -5 }}
        whileTap={{ scale: 0.98 }}
        className="flex flex-col items-center"
    >
        <div className="w-64 bg-gray-800 rounded-xl overflow-hidden shadow-2xl mb-4 border border-gray-700 transition-all duration-300 hover:shadow-[0_0_15px_rgba(124,58,237,0.5)] group">
            <div className="p-5 text-center">
                <div className="text-4xl mb-2">{icon}</div>
                <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                <p className="text-gray-400 text-sm mb-4">{description}</p>
                <button 
                    className={`w-full py-3 bg-gradient-to-r ${gradient} text-white rounded-lg shadow-lg hover:bg-gradient-to-r hover:${hoverGradient} transition-all duration-300 transform group-hover:scale-105 focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:ring-purple-500`} 
                    onClick={onClick}
                >
                    Start Game
                </button>
            </div>
        </div>
    </motion.div>
);

const InstructionCard = ({ number, text }) => (
    <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: number * 0.1 }}
        className="flex items-center p-3 bg-gray-700/50 rounded-lg"
    >
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center mr-3">
            <span className="text-white font-bold">{number}</span>
        </div>
        <span className="text-gray-200">{text}</span>
    </motion.div>
);

export default Home;
