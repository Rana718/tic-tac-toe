const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
];

export const calculateWinner = (squares) => {
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return { player: squares[a], line: [a, b, c] };
        }
    }
    return null;
};

const evaluate = (squares) => {
    for (const line of lines) {
        const [a, b, c] = line;
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return squares[a] === "O" ? 10 : -10;
        }
    }
    return 0;
};

const isMovesLeft = (squares) => {
    return squares.includes(null);
};

const minimax = (squares, depth, isMax) => {
    const score = evaluate(squares);
    if (score === 10) return score - depth;
    if (score === -10) return score + depth;
    if (!isMovesLeft(squares)) return 0;

    if (isMax) {
        let best = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (!squares[i]) {
                squares[i] = "O";
                best = Math.max(best, minimax(squares, depth + 1, false));
                squares[i] = null;
            }
        }
        return best;
    } else {
        let best = Infinity;
        for (let i = 0; i < 9; i++) {
            if (!squares[i]) {
                squares[i] = "X";
                best = Math.min(best, minimax(squares, depth + 1, true));
                squares[i] = null;
            }
        }
        return best;
    }
};

export const getBotMove = (squares) => {
    let bestVal = -Infinity;
    let bestMove = -1;
    for (let i = 0; i < 9; i++) {
        if (!squares[i]) {
            squares[i] = "O";
            const moveVal = minimax(squares, 0, false);
            squares[i] = null;
            if (moveVal > bestVal) {
                bestMove = i;
                bestVal = moveVal;
            }
        }
    }
    return bestMove;
};


export const getLineDirection = (line) => {
    if (line[0] % 3 === line[2] % 3) {
        return "vertical";
    } else if (Math.floor(line[0] / 3) === Math.floor(line[2] / 3)) {
        return "horizontal";
    } else if (line.includes(0) && line.includes(4) && line.includes(8)) {
        return "diagonal-left";
    } else if (line.includes(2) && line.includes(4) && line.includes(6)) {
        return "diagonal-right";
    }
    return "";
};

