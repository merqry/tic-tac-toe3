import { useState, useEffect } from 'react';
import Confetti from 'react-confetti';
import './App.css';

function App() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [gameMode, setGameMode] = useState('no-timer'); // 'no-timer', 'timed', 'bullet'
  const [timeLeft, setTimeLeft] = useState(30);
  const [xTimeLeft, setXTimeLeft] = useState(30);
  const [oTimeLeft, setOTimeLeft] = useState(30);
  const [timerActive, setTimerActive] = useState(false);
  const [timeoutWinner, setTimeoutWinner] = useState(null);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    let timer;
    if (timerActive) {
      if (gameMode === 'timed' && timeLeft > 0) {
        timer = setInterval(() => {
          setTimeLeft((prevTime) => prevTime - 1);
        }, 1000);
      } else if (gameMode === 'bullet') {
        timer = setInterval(() => {
          if (isXNext) {
            setXTimeLeft((prevTime) => prevTime - 1);
          } else {
            setOTimeLeft((prevTime) => prevTime - 1);
          }
        }, 1000);
      }
    }

    if ((gameMode === 'timed' && timeLeft === 0 && timerActive) ||
        (gameMode === 'bullet' && ((isXNext && xTimeLeft === 0) || (!isXNext && oTimeLeft === 0)))) {
      // Time's up! Current player loses
      const winner = isXNext ? 'O' : 'X';
      setGameOver(true);
      setShowConfetti(true);
      setTimerActive(false);
      setTimeoutWinner(winner);
    }

    return () => clearInterval(timer);
  }, [timeLeft, timerActive, isXNext, gameMode, xTimeLeft, oTimeLeft]);

  const calculateWinner = (squares) => {
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

    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  const countPieces = (board, piece) => {
    return board.filter(square => square === piece).length;
  };

  const handleClick = (index) => {
    // Don't allow moves if the game is over
    if (gameOver) return;

    const currentPiece = isXNext ? 'X' : 'O';
    const pieceCount = countPieces(board, currentPiece);

    // If a piece is selected, handle the move or change selection
    if (selectedPiece !== null) {
      if (board[index] === null) {
        // Move the selected piece to the empty square
        const newBoard = [...board];
        newBoard[selectedPiece] = null;
        newBoard[index] = currentPiece;
        setBoard(newBoard);
        setSelectedPiece(null);
        
        // Check for winner after the move
        const winner = calculateWinner(newBoard);
        if (winner) {
          setGameOver(true);
          setShowConfetti(true);
          setTimerActive(false);
        } else {
          setIsXNext(!isXNext);
          if (gameMode === 'timed') {
            setTimeLeft(30);
          }
        }
      } else if (board[index] === currentPiece) {
        // Change selection to another piece of the same type
        setSelectedPiece(index);
      }
      return;
    }

    // If no piece is selected, handle piece selection or placement
    if (board[index] === currentPiece) {
      // Select the piece to move
      setSelectedPiece(index);
    } else if (board[index] === null && pieceCount < 3) {
      // Place a new piece if under the limit
      const newBoard = [...board];
      newBoard[index] = currentPiece;
      setBoard(newBoard);
      
      // Check for winner after the move
      const winner = calculateWinner(newBoard);
      if (winner) {
        setGameOver(true);
        setShowConfetti(true);
        setTimerActive(false);
              } else {
          setIsXNext(!isXNext);
          if (gameMode === 'timed') {
            setTimeLeft(30);
          }
        }
    }
  };

  const winner = calculateWinner(board);
  const status = timeoutWinner
    ? `Winner: ${timeoutWinner} (${isXNext ? 'X' : 'O'} timed out!)`
    : winner
      ? `Winner: ${winner}`
      : board.every((square) => square)
        ? 'Game Draw!'
        : `Player: ${isXNext ? 'X' : 'O'}`;

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setSelectedPiece(null);
    setGameOver(false);
    setShowConfetti(false);
    setTimeLeft(30);
    setXTimeLeft(30);
    setOTimeLeft(30);
    setTimerActive(false);
    setTimeoutWinner(null);
  };

  const startGame = () => {
    setTimerActive(true);
              if (gameMode === 'timed') {
            setTimeLeft(30);
          } else if (gameMode === 'bullet') {
            setXTimeLeft(30);
            setOTimeLeft(30);
          }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="App">
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={500}
          gravity={0.3}
        />
      )}
      <h1>Three Tac Toe</h1>
      {!gameOver && !timerActive && (
        <div className="game-options">
          <div className="mode-selection">
            <div className="segmented-control">
              <button
                className={`segment ${gameMode === 'no-timer' ? 'selected' : ''}`}
                onClick={() => setGameMode('no-timer')}
                disabled={gameOver || timerActive}
              >
                No Timer
              </button>
              <button
                className={`segment ${gameMode === 'timed' ? 'selected' : ''}`}
                onClick={() => setGameMode('timed')}
                disabled={gameOver || timerActive}
              >
                Timed
              </button>
              <button
                className={`segment ${gameMode === 'bullet' ? 'selected' : ''}`}
                onClick={() => setGameMode('bullet')}
                disabled={gameOver || timerActive}
              >
                Bullet
              </button>
            </div>
          </div>
          <button className="start-button" onClick={startGame} disabled={gameOver || timerActive}>
            Start Game
          </button>
        </div>
      )}
      {timerActive && gameMode !== 'no-timer' && (
        <div className="timer-container">
          {gameMode === 'timed' && (
            <div className="timer">
              Time left: {formatTime(timeLeft)}
            </div>
          )}
          {gameMode === 'bullet' && (
            <div className="bullet-timers">
              <div className={`player-timer ${isXNext ? 'active' : ''}`}>
                Player X: {formatTime(xTimeLeft)}
              </div>
              <div className={`player-timer ${!isXNext ? 'active' : ''}`}>
                Player O: {formatTime(oTimeLeft)}
              </div>
            </div>
          )}
        </div>
      )}
      {timerActive && (
        <div className="status">{status}</div>
      )}
      {timerActive && (
        <div className="instructions">
          {gameOver 
            ? "Game Over! Click Reset to play again"
            : selectedPiece !== null 
              ? `Click an empty square to move your ${isXNext ? 'X' : 'O'} or click another ${isXNext ? 'X' : 'O'} to change selection`
              : countPieces(board, isXNext ? 'X' : 'O') >= 3
                ? `Click on an existing ${isXNext ? 'X' : 'O'} to select it for moving`
                : `Click to place your ${isXNext ? 'X' : 'O'}`}
        </div>
      )}
      <div className="board">
        {board.map((square, index) => (
          <button
            key={index}
            className={`square ${selectedPiece === index ? 'selected' : ''} ${gameOver ? 'game-over' : ''}`}
            onClick={() => handleClick(index)}
            disabled={gameOver || !timerActive}
          >
            {square}
          </button>
        ))}
      </div>
      <button className="reset-button" onClick={resetGame}>
        Reset Game
      </button>
    </div>
  );
}

export default App;
