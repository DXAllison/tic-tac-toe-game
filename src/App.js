import { useState } from 'react';
import './index.css';

export default function TicTacToe() {
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  const [wins, setWins] = useState({ X: 0, O: 0 }); //X = P1, O = P2
  const [winnerLog, setWinnerLog] = useState([]);
  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove];

  const moves = history.map((squares, move) => {
    let description;

    if (move > 0 && move === currentMove) {
      description = `Current Move (#${move})`;
    }
    else if (move > 0) {
      description = 'Go to move #' + move;
    } else {
      description = 'Go to Start';
    }

    return (
      <li key={move}>
        <button onClick={() => jumpTo(move)}>{description}</button>
      </li>
    );
  });

  function handlePlay(nextSquares) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  };

  function jumpTo(nextMove) {
    // Only increment win count when:
    // - User resets back to the beginning (nextMove ===0)
    // - Current move is the final move in the history
    // - Board + current move contains a winner
    if (nextMove === 0 && currentMove === history.length - 1) {
      recordWinner(history[currentMove]);
    }
    setCurrentMove(nextMove);
  }

  function calculateWinner(squares) {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6],
    ];

    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];

      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return lines[i]; // return winning lin indices so they can be highlighted
      }
    }
    return null;
  };


  function recordWinner(squares) {
    const winningLine = calculateWinner(squares);

    if (!winningLine) return;

    const winnerSymbol = squares[winningLine[0]];

    setWins(prev => ({
      ...prev,
      [winnerSymbol]: (prev[winnerSymbol] || 0) + 1
    }));

    // Adding entry to winner timeline (Sorted by Newest to Oldest)
    const now = new Date();
    let hours = now.getHours();
    let minutes = String(now.getMinutes()).padStart(2, '0');
    const amPM = hours >= 12 ? "pm" : "am";
    hours = hours % 12 || 12;
    const time = `${hours}:${minutes}${amPM}`;
    const winMessage = winnerSymbol === 'X' ? 'P1 (X) Wins' : 'P2 (O) Wins';
    const entry = { time, message: winMessage };

    setWinnerLog(prev => [entry, ...prev]);
  }

  return (
    <div className="game">
      <Heading />
      <PlayerScores wins={wins} />
      <div className='game-interface'>
        <WinnerList winnerLog={winnerLog} />
        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} calculateWinner={calculateWinner} />
        <div className='move-info'>
          <ol>
            {moves}
          </ol>
        </div>
      </div>
    </div>
  );
}


function Heading() {
  return (
    <div className='header'>
      <h1>Tic-Tac-Toe</h1><span>(2 players only)</span>
    </div>
  )
}

function Board({ xIsNext, squares, onPlay, calculateWinner }) {
  const winningLine = calculateWinner(squares);
  const winner = winningLine ? squares[winningLine[0]] : null;

  function handleClick(i) {
    if (squares[i] || winner) return;

    const nextSquares = squares.slice();
    nextSquares[i] = xIsNext ? 'X' : 'O';
    onPlay(nextSquares);
  }

  const status = winner
    ? `Player ${winner} wins!`
    : `Player turn: ${xIsNext ? 'X' : 'O'}`;

  return (
    <div className="board-container">
      <div className="status">{status}</div>
      <div className="all-squares">
        {[0, 3, 6].map((rowStart) => (
          <div className="board-row" key={rowStart}>
            {[0, 1, 2].map((offset) => {
              const i = rowStart + offset;
              const isWinning = !!(winningLine && winningLine.includes(i));
              return (
                <Square
                  key={i}
                  value={squares[i]}
                  isWinning={isWinning}
                  onSquareClick={() => handleClick(i)}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function Square({ value, onSquareClick, isWinning = false }) {
  const className = `square ${isWinning ? 'square--winning' : ''}`;
  return (
    <button className={className}
      onClick={onSquareClick}
    >{value}</button>
  );
};

function PlayerScores({ wins }) {

  return (
    <div className='all-scores'>

      <div className='player player--active'>
        <h2 className='score'>{wins.X}</h2>
        <h2 className='tag'>(P1)</h2>
      </div>

      <span> | </span>

      <div className='player'>
        <h2 className='tag'>(P2)</h2>
        <h2 className='score'>{wins.O}</h2>
      </div>

    </div>
  )
}


function WinnerList({ winnerLog, setWinnerLog }) {
  return (
    <div className='winner-stats'>
      <ul className='winner-list'>
        {winnerLog.length === 0 ? (
          <li className='winner-list__empty'>No winners yet</li>
        ) : (
          winnerLog.map((entry, idx) => (
            <li key={idx}>
              <span className="time-log">{entry.time}</span> {entry.message}
            </li>
          ))
        )}
      </ul>
    </div>
  )
}