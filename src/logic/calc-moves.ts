import { toast } from "react-hot-toast";
import { toastStyle } from "../App";
import { calcEndingDiceBars } from "./endgame";
import Player from "./player";

export function calcPossibleMoves(
  fromBarIdx: number,
  board: string[],
  turn: Player,
  opponent: Player,
  dices: number[]
) {
  var [firstDice, secondDice] = dices;

  if (firstDice === null) firstDice = 0;
  if (secondDice === null) secondDice = 0;

  const canGoTo: number[] = [];

  for (let i = 0; i < board.length; i++) {
    var toBar = board[i];
    var toBarIdx = i;

    if (toBar.includes(opponent.player) && toBar.length > 1) {
      continue;
    }

    if (turn.player === "White") {
      if (
        (fromBarIdx <= 11 && toBarIdx <= 11 && toBarIdx >= fromBarIdx) ||
        (fromBarIdx > 11 && toBarIdx > 11 && toBarIdx <= fromBarIdx) ||
        (fromBarIdx > 11 && toBarIdx < 11)
      ) {
        continue;
      }
    } else {
      if (
        (fromBarIdx <= 11 && toBarIdx <= 11 && toBarIdx <= fromBarIdx) ||
        (fromBarIdx > 11 && toBarIdx > 11 && toBarIdx >= fromBarIdx) ||
        (fromBarIdx <= 11 && toBarIdx > 11)
      ) {
        continue;
      }
    }

    var distance = 0;

    if (fromBarIdx <= 11) {
      distance =
        toBarIdx <= 11
          ? Math.abs(fromBarIdx - toBarIdx)
          : fromBarIdx + (toBarIdx - 11);
    } else {
      distance =
        toBarIdx > 11
          ? Math.abs(fromBarIdx - toBarIdx)
          : fromBarIdx + (toBarIdx - 11);
    }

    if (distance === 0 || (distance !== firstDice && distance !== secondDice)) {
      continue;
    }

    canGoTo.push(toBarIdx);
  }
  return canGoTo;
}

export function calcGettingOutOfOutMoves(
  board: string[],
  turn: Player,
  opponent: Player,
  dices: number[]
) {
  const canGoTo: number[] = [];
  const [firstDice, secondDice] = dices;

  if (turn.player === "White") {
    if (
      firstDice > 0 &&
      (!board[12 - firstDice].includes(opponent.player) ||
        (board[12 - firstDice].includes(opponent.player) &&
          board[12 - firstDice].length === 1))
    ) {
      canGoTo.push(12 - firstDice);
    }
    if (
      secondDice > 0 &&
      (!board[12 - secondDice].includes(opponent.player) ||
        (board[12 - secondDice].includes(opponent.player) &&
          board[12 - secondDice].length === 1))
    ) {
      canGoTo.push(12 - secondDice);
    }
  } else {
    if (
      firstDice > 0 &&
      (!board[24 - firstDice].includes(opponent.player) ||
        (board[24 - firstDice].includes(opponent.player) &&
          board[24 - firstDice].length === 1))
    ) {
      canGoTo.push(24 - firstDice);
    }
    if (
      secondDice > 0 &&
      (!board[24 - secondDice].includes(opponent.player) ||
        (board[24 - secondDice].includes(opponent.player) &&
          board[24 - secondDice].length === 1))
    ) {
      canGoTo.push(24 - secondDice);
    }
  }

  return canGoTo;
}

export function hasPossibleMove(
  turn: Player,
  opponent: Player,
  board: string[],
  dices: number[],
  whitePlayer: Player,
  blackPlayer: Player
) {
  const outPieces =
    turn === whitePlayer ? [...whitePlayer.outBar] : [...blackPlayer.outBar];
  if (outPieces.length !== 0) {
    const canGoTo = calcGettingOutOfOutMoves(board, turn, opponent, dices);
    return canGoTo.length !== 0;
  }

  const containing: number[] = [];
  board.map((bar, barIdx) => {
    if (bar.includes(turn.player)) containing.push(barIdx);
  });

  const allMoves: number[] = [];
  containing.map((barIdx) => {
    const canGoTo = calcPossibleMoves(barIdx, board, turn, opponent, dices);

    canGoTo.map((barIdx) => allMoves.push(barIdx));
  });

  const endingDiceBars = calcEndingDiceBars(board, turn, dices);
  endingDiceBars.map((barIdx) => allMoves.push(barIdx));

  return allMoves.length !== 0;
}

export function checkCantMove(
  board: string[],
  dices: number[],
  turn: Player,
  opponent: Player,
  whitePlayer: Player,
  blackPlayer: Player,
  changeTurn: Function,
  setToDefault: Function
) {
  if (
    !hasPossibleMove(turn, opponent, board, dices, whitePlayer, blackPlayer)
  ) {
    toast.error(
      "You have no possible moves.\nTurn changes to opponent.",
      toastStyle(turn)
    );

    changeTurn();
    setToDefault();

    return true;
  } else return false;
}