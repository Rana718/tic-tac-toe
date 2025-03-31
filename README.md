# Tic Tac Toe Game

A modern, fully-featured Tic Tac Toe game with multiple play modes built using React, Tailwind CSS, and Node.js with Socket.IO for real-time multiplayer gaming.


## Features

- **💻 Multiple Game Modes:**
  - **Offline 1v1:** Play against a friend on the same device
  - **Bot Mode:** Challenge our AI opponent with minimax algorithm
  - **Online Multiplayer:** Play with other people in real-time

- **🎨 Modern UI/UX:**
  - Responsive design works on all devices
  - Smooth animations and transitions
  - Beautiful gradient-based visual design

- **🔄 Real-time Features:**
  - Live player matching
  - In-game chat with other players
  - Share game links with friends
  - Automatic game state synchronization

## Tech Stack

### Frontend
- **React** - UI library
- **Vite** - Build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Socket.IO Client** - Real-time communication
- **React Router** - Client-side routing

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **Socket.IO** - Real-time communication
- **Redis** - Data store for game state and chat
- **Rate Limiting** - Protection against abuse

## Getting Started

### Prerequisites
- Node.js 16.x or higher
- npm or yarn
- Redis (for production deployment)

### Frontend Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/tic-tac-toe.git
   cd tic-tac-toe/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with:
   ```
   VITE_API_END=http://localhost:3000
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```
   
The app will be available at `http://localhost:5173`

### Backend Installation

1. Navigate to the backend directory:
   ```bash
   cd ../backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with:
   ```
   PORT=3000
   FRONTEND_URL=http://localhost:5173
   REDIS_HOST=your-redis-host
   REDIS_PORT=6379
   REDIS_USERNAME=your-username
   REDIS_PASSWORD=your-password
   ```

4. Start the server:
   ```bash
   npm run dev
   ```

Server will run on `http://localhost:3000`

## Deployment

### Docker (Backend)

Build and run the Docker container:

```bash
cd backend
docker build -t tic-tac-toe-backend .
docker run -p 3000:3000 --env-file .env tic-tac-toe-backend
```

### Frontend Deployment

Build the frontend for production:

```bash
cd frontend
npm run build
```

The optimized build will be in the `dist` directory, ready to be served by any static hosting service.

## Game Mechanics

- Classic 3x3 grid
- Players take turns placing X or O
- First to get 3 of their marks in a row (horizontally, vertically, or diagonally) wins
- Bot mode uses the minimax algorithm to make optimal moves
- Online mode matches you with random players or lets you invite friends

## Project Structure

```
tic-tac-toe/
├── frontend/              # React frontend
│   ├── src/
│   │   ├── Components/    # Reusable UI components
│   │   ├── mod/           # Game mode components
│   │   └── utils/         # Utility functions
│   ├── public/            # Static assets
│   └── index.html         # Entry HTML file
│
└── backend/               # Node.js backend
    ├── online/            # Socket.IO game logic
    ├── middleware/        # Express middleware
    ├── routes/            # API routes
    ├── services/          # Redis and other services
    └── index.js           # Main server file
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with ❤️ by [Your Name]
- Inspired by classic Tic Tac Toe games
- Thanks to all the open-source libraries used in this project