import { toast } from "react-hot-toast";
import { toastStyle } from "../App";
import Player from "./player";

export function dice() {
  const first = Math.floor(Math.random() * 6) + 1;
  const second = Math.floor(Math.random() * 6) + 1;

  return [first, second];
}

export function rollingDice(turn: Player) {
  var dices = dice();

  if (dices[0] === dices[1]) {
    dices.push(dices[0]);
    dices.push(dices[0]);

    toast.success(
      `🎲 ${turn.player}: Rolled a Double: ${dices} 🎲`,
      toastStyle(turn)
    );
  } else {
    toast.success(`🎲 ${turn.player}: ${dices} 🎲`, toastStyle(turn));
  }

  const rolledDice = true;
  const maxMoves = dices.reduce((a, b) => a + b, 0);

  return [turn, rolledDice, dices, maxMoves];
}
