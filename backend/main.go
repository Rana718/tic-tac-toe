package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/rs/cors"
)

type MoveRequest struct {
	Squares []string `json:"squares"`
}
type MoveResponse struct {
	Move int `json:"move"`
}

func evaluate(squares []string) int {
	winLines := [8][3]int{
		{0, 1, 2}, {3, 4, 5}, {6, 7, 8},
		{0, 3, 6}, {1, 4, 7}, {2, 5, 8},
		{0, 4, 8}, {2, 4, 6},
	}
	for _, line := range winLines {
		if squares[line[0]] == squares[line[1]] && squares[line[1]] == squares[line[2]] {
			if squares[line[0]] == "O" {
				return 10
			} else if squares[line[0]] == "X" {
				return -10
			}
		}
	}
	return 0
}

func isMovesLeft(squares []string) bool {
	for i := 0; i < 9; i++ {
		if squares[i] == "" {
			return true
		}
	}
	return false
}

func max(a, b int) int {
	if a > b {
		return a
	}
	return b
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

func minimax(squares []string, depth int, isMax bool) int {
	score := evaluate(squares)
	if score == 10 {
		return score - depth
	}
	if score == -10 {
		return score + depth
	}
	if !isMovesLeft(squares) {
		return 0
	}
	if isMax {
		best := -1000
		for i := 0; i < 9; i++ {
			if squares[i] == "" {
				squares[i] = "O"
				best = max(best, minimax(squares, depth+1, !isMax))
				squares[i] = ""
			}
		}
		return best
	} else {
		best := 1000
		for i := 0; i < 9; i++ {
			if squares[i] == "" {
				squares[i] = "X"
				best = min(best, minimax(squares, depth+1, !isMax))
				squares[i] = ""
			}
		}
		return best
	}
}

func getBotMove(squares []string) int {
	bestVal := -1000
	bestMove := -1

	for i := 0; i < 9; i++ {
		if squares[i] == "" {
			squares[i] = "O"
			moveVal := minimax(squares, 0, false)
			squares[i] = ""
			if moveVal > bestVal {
				bestMove = i
				bestVal = moveVal
			}
		}
	}
	return bestMove
}

func handleMove(w http.ResponseWriter, r *http.Request) {
	var req MoveRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	move := getBotMove(req.Squares)
	resp := MoveResponse{Move: move}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("/move", handleMove)
	handler := cors.Default().Handler(mux)
	fmt.Println("Server is running on port 8080")
	log.Fatal(http.ListenAndServe(":8080", handler))
}
