import { useEffect, useMemo, useState } from "react";

// X/O (Tic‑Tac‑Toe) — single file React component
// Beautiful responsive UI with Tailwind classes
// Modes: Player vs Player (PvP) and Player vs Computer (PvC) — simple smart bot

const WIN_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function calcWinner(board: string[]) {
  for (const [a, b, c] of WIN_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line: [a, b, c] };
    }
  }
  return null;
}

function availableMoves(board: string[]) {
  const arr: number[] = [];
  for (let i = 0; i < 9; i++) if (!board[i]) arr.push(i);
  return arr;
}

function smartAIMove(board: string[], ai = "O", human = "X") {
  const empty = availableMoves(board);
  if (empty.length === 0) return null;

  // 1) Check for winning move
  for (const idx of empty) {
    const copy = board.slice();
    copy[idx] = ai;
    if (calcWinner(copy)?.winner === ai) return idx;
  }
  // 2) Block opponent's winning move
  for (const idx of empty) {
    const copy = board.slice();
    copy[idx] = human;
    if (calcWinner(copy)?.winner === human) return idx;
  }
  // 3) Take center
  if (empty.includes(4)) return 4;
  // 4) Take corners
  const corners = [0, 2, 6, 8].filter((i) => empty.includes(i));
  if (corners.length) return corners[0];
  // 5) Take sides
  const sides = [1, 3, 5, 7].filter((i) => empty.includes(i));
  return sides.length ? sides[0] : empty[0];
}

export default function TicTacToe() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState<boolean>(true);
  const [winningLine, setWinningLine] = useState<number[]>([]);
  const [winner, setWinner] = useState<any>(null);
  const [isDraw, setIsDraw] = useState<boolean>(false);
  const [mode, setMode] = useState<"pvp" | "cpu">("pvp");
  const [scores, setScores] = useState<any>({
    X: 0,
    O: 0,
    Draws: 0,
  });
  const [startWithX, setStartWithX] = useState(true); // alternate starting player each round

  const status = useMemo(() => {
    if (winner) return `Winner: ${winner}`;
    if (isDraw) return "Draw!";
    return `Turn: ${xIsNext ? "X" : "O"}`;
  }, [winner, isDraw, xIsNext]);

  function applyMove(index: number, player: "X" | "O") {
    if (board[index] || winner || isDraw) return;
    const next = board.slice();
    next[index] = player;
    const outcome = calcWinner(next);

    if (outcome) {
      setBoard(next);
      setWinner(outcome.winner);
      setWinningLine(outcome.line);
      setScores((s: any) => ({ ...s, [outcome.winner]: s[outcome.winner] + 1 }));
      return;
    }
    if (next.every(Boolean)) {
      setBoard(next);
      setIsDraw(true);
      setWinningLine([]);
      setScores((s: any) => ({ ...s, Draws: s.Draws + 1 }));
      return;
    }

    setBoard(next);
    setXIsNext((v) => !v);
  }

  function handleCellClick(index: number) {
    // In PvC mode, user cannot click when it's the bot's turn
    if (mode === "cpu" && !xIsNext) return;
    applyMove(index, xIsNext ? "X" : "O");
  }

  function nextRound() {
    // Next round: alternate starting player
    const startX = startWithX; // starting player for current round
    setStartWithX((p) => !p);
    setBoard(Array(9).fill(null));
    setWinner(null);
    setWinningLine([]);
    setIsDraw(false);
    setXIsNext(startX);
  }

  function fullReset() {
    setBoard(Array(9).fill(null));
    setWinner(null);
    setWinningLine([]);
    setIsDraw(false);
    setXIsNext(true);
    setStartWithX(true);
    setScores({ X: 0, O: 0, Draws: 0 });
  }

  // PvC: bot move
  useEffect(() => {
    if (mode !== "cpu") return;
    if (winner || isDraw) return;
    if (xIsNext) return; // O's turn (bot)

    const idx = smartAIMove(board, "O", "X");
    if (idx === null || idx === undefined) return;
    const t = setTimeout(() => applyMove(idx, "O"), 350);
    return () => clearTimeout(t);
  }, [board, xIsNext, mode, winner, isDraw]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-50 to-slate-100 text-slate-800 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="mb-4 text-center">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">X/O Game (React)</h1>
          <p className="text-sm text-slate-500 mt-1">Beautiful UI, highlights winner, PvP/PvC modes, round scores.</p>
        </div>

        {/* Mode selection and score */}
        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <label className="block text-xs uppercase tracking-wide text-slate-500 mb-1">Mode</label>
            <div className="flex gap-2">
              <button
                onClick={() => setMode("pvp")}
                className={`flex-1 rounded-xl border px-3 py-2 text-sm transition shadow-sm ${
                  mode === "pvp" ? "bg-slate-900 text-white border-slate-900" : "bg-white border-slate-200 hover:border-slate-300"
                }`}>
                Two Players
              </button>
              <button
                onClick={() => setMode("cpu")}
                className={`flex-1 rounded-xl border px-3 py-2 text-sm transition shadow-sm ${
                  mode === "cpu" ? "bg-slate-900 text-white border-slate-900" : "bg-white border-slate-200 hover:border-slate-300"
                }`}>
                Vs Computer
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <label className="block text-xs uppercase tracking-wide text-slate-500 mb-1">Score</label>
            <div className="flex items-center justify-between text-sm">
              <div className="flex gap-4">
                <span className="font-semibold">X: {scores.X}</span>
                <span className="font-semibold">O: {scores.O}</span>
                <span className="font-semibold">= : {scores.Draws}</span>
              </div>
              <button onClick={fullReset} className="rounded-lg border border-slate-200 px-2 py-1 hover:bg-slate-50">
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="mb-3 text-center">
          <span
            className={`inline-block rounded-xl px-3 py-1 text-sm font-medium shadow-sm border ${
              winner
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : isDraw
                ? "bg-amber-50 text-amber-700 border-amber-200"
                : "bg-white text-slate-700 border-slate-200"
            }`}>
            {status}
          </span>
        </div>

        {/* Board */}
        <div className="grid grid-cols-3 gap-2 select-none">
          {board.map((val, i) => {
            const isWinCell = winningLine.includes(i);
            return (
              <button
                key={i}
                onClick={() => handleCellClick(i)}
                aria-label={`Cell ${i + 1}`}
                className={`h-24 sm:h-28 md:h-32 rounded-2xl border text-4xl md:text-5xl font-bold flex items-center justify-center shadow-sm transition active:scale-[0.98] ${
                  isWinCell ? "bg-emerald-50 border-emerald-300 ring-2 ring-emerald-300" : "bg-white border-slate-200 hover:border-slate-300"
                } ${val === "X" ? "text-slate-900" : val === "O" ? "text-slate-500" : "text-slate-300"}`}
                disabled={!!winner || isDraw || !!val || (mode === "cpu" && !xIsNext)}>
                {val || "·"}
              </button>
            );
          })}
        </div>

        {/* Bottom buttons */}
        <div className="mt-4 flex gap-2">
          <button onClick={nextRound} className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm shadow-sm hover:bg-slate-50">
            New Round
          </button>
          <button
            onClick={() => {
              setBoard(Array(9).fill(null));
              setWinner(null);
              setWinningLine([]);
              setIsDraw(false);
              setXIsNext(true);
            }}
            className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm shadow-sm hover:bg-slate-50">
            Restart Current Round
          </button>
        </div>

        <p className="mt-3 text-center text-xs text-slate-400">Starting player alternates each round: first X, next round O.</p>
      </div>
    </div>
  );
}
