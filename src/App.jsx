import { useRef, useState } from "react";
import Board from "./components/Board";
import Bar from "./components/Bar";
import { toast } from "react-hot-toast";
import Piece from "./components/Piece";
import "./App.css";
import {
  calcEndingDiceBars,
  calcGettingOutOfOutMoves,
  calcPossibleMoves,
  initialState,
  readyToEnd,
} from "./logic";
import PieceOutBar from "./components/PieceOutBar";
import CollectionBar from "./components/CollectionBar";

// https://salamdonya.com/fun/how-to-play-backgammon

function App() {
  const [gameOn, setGameOn] = useState(false);
  const gameOver = useRef(false);
  const [board, setBoard] = useState(initialState());
  const [whiteOutPieces, setWhiteOutPieces] = useState([]);
  const [blackOutPieces, setBlackOutPieces] = useState([]);
  const [whiteWinningPieces, setWhiteWinningPieces] = useState([]);
  const [blackWinningPieces, setBlackWinningPieces] = useState([]);
  const turn = useRef("");
  const rolledDice = useRef(false);
  const dices = useRef([]);
  const moves = useRef(0);
  const maxMoves = useRef(0);
  const [canGoToArray, setCanGoToArray] = useState([]);

  const toastStyle = {
    style: {
      borderRadius: "10px",
      background: turn.current === "White" ? "White" : "Black",
      color: turn.current === "White" ? "black" : "white",
      border: turn.current === "White" ? "2px solid black" : "2px solid white",
    },
  };

  window.onload = () => {
    toast(
      `Backgammon
    
    Is the oldest game in the world. Archaeologists found sets when 
    they excavated the ruins of 
    ancient Mesopotamia,
    five thousand years old. 

    That's older than Jesus Christ. 
    Their dice were made of bones.
    
    Two Players. Two Sides.

    One is Light, 
    One is Dark.

    -  John Locke. Lost.`,
      {
        duration: 9000,
        style: {
          borderRadius: "10px",
          background: "black",
          color: "#fff",
          border: "2px solid white",
        },
      }
    );
  };

  function startGame() {
    setGameOn(true);
    setBoard(initialState());
    setWhiteWinningPieces([]);
    setBlackWinningPieces([]);
    setWhiteOutPieces([]);
    setBlackOutPieces([]);
    turn.current = "";
    rolledDice.current = false;
    gameOver.current = false;

    while (true) {
      const [whiteFirst, whiteSecond] = dice();
      const [blackFirst, blackSecond] = dice();

      if (whiteFirst + whiteSecond > blackFirst + blackSecond) {
        turn.current = "White";
        toast.success("The Game starts with ⚪ WHITE ⚪");

        break;
      } else if (whiteFirst + whiteSecond < blackFirst + blackSecond) {
        turn.current = "Black";
        toast.success("The Game starts with ⚫ BLACK ⚫", toastStyle);

        break;
      }
    }
  }

  function rollDice() {
    if (rolledDice.current) {
      toast.error(
        "Play your move before rolling again.\n" +
          `🎲 ${turn.current}: ${dices.current} 🎲`,
        toastStyle
      );

      return;
    }

    dices.current = dice();

    if (dices.current[0] === dices.current[1]) {
      dices.current.push(dices.current[0]);
      dices.current.push(dices.current[0]);

      toast.success(
        `🎲 ${turn.current}: Rolled a Double: ${dices.current} 🎲`,
        {
          style: {
            borderRadius: "10px",
            background: turn.current === "White" ? "white" : "black",
            color: turn.current === "White" ? "black" : "white",
            border:
              turn.current === "White" ? "2px solid black" : "2px solid white",
          },
        }
      );

      maxMoves.current = dices.current[0] * 4;
    } else {
      toast.success(`🎲 ${turn.current}: ${dices.current} 🎲`, toastStyle);
      maxMoves.current = dices.current[0] + dices.current[1];
    }

    rolledDice.current = true;

    if (!hasPossibleMove()) {
      toast.error(
        "You have no possible moves.\nTurn changes to opponent.",
        toastStyle
      );
      rolledDice.current = false;
      dices.current = [];
      moves.current = 0;
      maxMoves.current = 0;
      turn.current = turn.current === "White" ? "Black" : "White";
      toast.success("Turn is now: " + turn.current, toastStyle);
    }
  }

  function dice() {
    const first = Math.floor(Math.random() * 6) + 1;
    const second = Math.floor(Math.random() * 6) + 1;

    return [first, second];
  }

  function checkState(from, to) {
    const currBoard = [...board];
    const outPieces =
      turn.current === "White" ? [...whiteOutPieces] : [...blackOutPieces];
    const outPiecesBar =
      turn.current === "White" ? "WhiteOutPiecesBar" : "BlackOutPiecesBar";
    const opponent = turn.current === "White" ? "Black" : "White";
    const opponentOutPieces =
      opponent === "White" ? [...whiteOutPieces] : [...blackOutPieces];
    const endingBarIdx =
      turn.current === "White" ? "WhiteEndBar" : "BlackEndBar";
    const endingBar =
      turn.current === "White"
        ? [...whiteWinningPieces]
        : [...blackWinningPieces];

    if (from === endingBarIdx) {
      endingBar.push(currBoard[to].pop());
      turn.current === "White"
        ? setWhiteWinningPieces(endingBar)
        : setBlackWinningPieces(endingBar);

      if (endingBar.length === 15) gameOver.current = true;
      return;
    }

    if (currBoard[to].includes(opponent)) {
      opponentOutPieces.push(currBoard[to].pop());
    }

    if (from === outPiecesBar) {
      currBoard[to].push(outPieces.pop());
      turn.current === "White"
        ? setWhiteOutPieces(outPieces)
        : setBlackOutPieces(outPieces);
      return;
    }

    currBoard[to].push(currBoard[from].pop());

    setBoard(currBoard);

    opponent === "White"
      ? setWhiteOutPieces(opponentOutPieces)
      : setBlackOutPieces(opponentOutPieces);
  }

  function hasPossibleMove() {
    const outPieces =
      turn.current === "White" ? [...whiteOutPieces] : [...blackOutPieces];
    if (outPieces.length !== 0) {
      const canGoTo = calcGettingOutOfOutMoves(
        board,
        turn.current,
        dices.current[0],
        dices.current[1]
      );

      return canGoTo.length !== 0;
    }

    const containing = [];
    board.map((bar, barIdx) => {
      if (bar.includes(turn.current)) containing.push(barIdx);
    });

    const allMoves = [];
    containing.map((barIdx) => {
      const canGoTo = calcPossibleMoves(
        barIdx,
        board,
        turn.current,
        dices.current[0],
        dices.current[1]
      );

      canGoTo.map((barIdx) => allMoves.push(barIdx));
    });

    const endingDiceBars = calcEndingDiceBars(
      board,
      turn.current,
      dices.current[0],
      dices.current[1]
    );

    endingDiceBars.map((barIdx) => allMoves.push(barIdx));

    return allMoves.length !== 0;
  }

  function cantMove() {
    if (rolledDice.current && !hasPossibleMove()) {
      toast.error(
        "You have no possible moves.\nTurn changes to opponent.",
        toastStyle
      );
      turn.current = turn.current === "White" ? "Black" : "White";
      rolledDice.current = false;
      dices.current = [];
      moves.current = 0;
      maxMoves.current = 0;
      toast.success("Turn is now: " + turn.current, toastStyle);

      return true;
    } else return false;
  }

  const fromBar = useRef(-1);
  const toBar = useRef(-1);

  function select(index) {
    if (!gameOn) {
      toast.error("Begin a game first!", toastStyle);
      return;
    }
    if (!rolledDice.current) {
      toast.error("Roll a dice first!", toastStyle);
      return;
    }

    if (cantMove()) return;

    const endingBarIdx =
      turn.current === "White" ? "WhiteEndBar" : "BlackEndBar";
    const endingBar =
      turn.current === "White"
        ? [...whiteWinningPieces]
        : [...blackWinningPieces];

    if (
      rolledDice &&
      fromBar.current === -1 &&
      readyToEnd(board, turn.current) &&
      index === endingBarIdx
    ) {
      const endingDiceBars = calcEndingDiceBars(
        board,
        turn.current,
        dices.current[0],
        dices.current[1]
      );

      if (endingDiceBars.length !== 0) {
        fromBar.current = index;
        setCanGoToArray(endingDiceBars);
      }
      return;
    } else if (
      rolledDice &&
      fromBar.current === endingBarIdx &&
      index !== fromBar.current &&
      toBar.current === -1 &&
      canGoToArray.includes(index)
    ) {
      toBar.current = index;
      checkState(fromBar.current, toBar.current);

      if (gameOver.current) {
        if (turn.current === "White") {
          toast(
            `Game Over!
            ⚪ WHITE ⚪ has Won the Game!`,
            toastStyle
          );
        } else {
          toast(
            `Game Over!
            ⚫ BLACK ⚫ has Won the Game!`,
            toastStyle
          );
        }

        setGameOn(false);

        fromBar.current = -1;
        toBar.current = -1;
        setCanGoToArray([]);
        if (cantMove()) return;
        return;
      }

      if (fromBar.current == endingBarIdx) {
        var distance =
          turn.current === "White" ? 24 - toBar.current : 12 - toBar.current;
      }

      moves.current = distance;

      if (moves.current === maxMoves.current) {
        rolledDice.current = false;
        dices.current = [];
        moves.current = 0;
        maxMoves.current = 0;
        turn.current = turn.current === "White" ? "Black" : "White";
        toast.success("Turn is now: " + turn.current, toastStyle);
      } else if (moves.current === dices.current[0]) {
        maxMoves.current -= dices.current.shift();
      } else if (moves.current === dices.current[1]) {
        maxMoves.current -= dices.current.pop();
      }

      // return to default for next turn
      fromBar.current = -1;
      toBar.current = -1;
      setCanGoToArray([]);
      if (cantMove()) return;
      return;
    }

    const opponent = turn.current === "White" ? "Black" : "White";
    const outPieces =
      turn.current === "White" ? [...whiteOutPieces] : [...blackOutPieces];
    const outPiecesBar =
      turn.current === "White" ? "WhiteOutPiecesBar" : "BlackOutPiecesBar";

    if (
      rolledDice.current &&
      outPieces.length !== 0 &&
      index === fromBar.current
    ) {
      fromBar.current = -1;
      setCanGoToArray([]);
      return;
    } else if (
      rolledDice.current &&
      outPieces.length !== 0 &&
      index === outPiecesBar
    ) {
      fromBar.current = index;

      const canGoTo = calcGettingOutOfOutMoves(
        board,
        turn.current,
        dices.current[0],
        dices.current[1]
      );

      setCanGoToArray(canGoTo);
      return;
    }

    if (
      rolledDice.current &&
      fromBar.current === -1 &&
      board[index].length != 0 &&
      board[index].includes(turn.current)
    ) {
      if (outPieces.length !== 0 && index !== outPiecesBar) {
        toast.error("You have to play you out pieces first.", toastStyle);
        return;
      }

      const canGoTo = calcPossibleMoves(
        index,
        board,
        turn.current,
        dices.current[0],
        dices.current[1]
      );

      if (canGoTo.length !== 0) {
        fromBar.current = index;
        setCanGoToArray(canGoTo);
      } else {
        return;
      }
    } else if (
      rolledDice.current &&
      index !== fromBar.current &&
      toBar.current === -1 &&
      (!board[index].includes(opponent) ||
        (board[index].includes(opponent) && board[index].length === 1)) &&
      canGoToArray.includes(index)
    ) {
      toBar.current = index;
      checkState(fromBar.current, toBar.current);

      var distance = 0;

      if (fromBar.current <= 11) {
        distance =
          toBar.current <= 11
            ? Math.abs(fromBar.current - toBar.current)
            : fromBar.current + (toBar.current - 11);
      } else {
        distance =
          toBar.current > 11
            ? Math.abs(fromBar.current - toBar.current)
            : fromBar.current + (toBar.current - 11);
      }

      if (fromBar.current == outPiecesBar) {
        distance =
          turn.current === "White" ? 12 - toBar.current : 24 - toBar.current;
      }

      moves.current = distance;

      if (moves.current === maxMoves.current) {
        rolledDice.current = false;
        dices.current = [];
        moves.current = 0;
        maxMoves.current = 0;
        turn.current = turn.current === "White" ? "Black" : "White";
        toast.success("Turn is now: " + turn.current, toastStyle);
      } else if (moves.current === dices.current[0]) {
        maxMoves.current -= dices.current.shift();
      } else if (moves.current === dices.current[1]) {
        maxMoves.current -= dices.current.pop();
      }

      // return to default for next turn
      fromBar.current = -1;
      toBar.current = -1;

      setCanGoToArray([]);
    } else if (rolledDice.current && index === fromBar.current) {
      fromBar.current = -1;
      setCanGoToArray([]);
    }

    if (cantMove()) return;
  }

  return (
    <>
      <div className="top">
        <CollectionBar
          onClick={() => select("WhiteEndBar")}
          isWhite={true}
          key={"WhiteEndBar"}
          fill={"#e0ded7"}
        >
          {whiteWinningPieces.map((piece, pieceIdx) => (
            <Piece key={`${pieceIdx}`} color={piece} />
          ))}
        </CollectionBar>
        <Board>
          {board.map((bar, barIdx) => (
            <Bar
              isTopRow={barIdx > 11}
              onClick={() => select(barIdx)}
              key={barIdx}
              // fill={barIdx % 2 === 0 ? "white" : "black"}
              // filling={canGoToArray.includes(barIdx) ? "red" : "rgb(100, 75, 65)"}
              fill={
                (canGoToArray.includes(barIdx) && "#671010") ||
                (barIdx % 2 === 0 && barIdx > 11 && "#232937") ||
                (barIdx % 2 !== 0 && barIdx <= 11 && "#232937") ||
                (barIdx % 2 === 0 && barIdx <= 11 && "#e0ded7") ||
                (barIdx % 2 !== 0 && barIdx > 11 && "#e0ded7")
              }
              isWhite={
                (barIdx % 2 === 0 && barIdx > 11 && false) ||
                (barIdx % 2 !== 0 && barIdx <= 11 && false) ||
                (barIdx % 2 === 0 && barIdx <= 11 && true) ||
                (barIdx % 2 !== 0 && barIdx > 11 && true)
              }
            >
              {bar.map((piece, pieceIdx) => (
                <Piece key={`${barIdx}-${pieceIdx}`} color={piece} />
              ))}
            </Bar>
          ))}
        </Board>
        <CollectionBar
          isTopRow={false}
          onClick={() => select("BlackEndBar")}
          isWhite={false}
          key={"BlackEndBar"}
          fill={"#232937"}
        >
          {blackWinningPieces.map((piece, pieceIdx) => (
            <Piece key={`${pieceIdx}`} color={piece} />
          ))}
        </CollectionBar>
      </div>

      <div className="bottom">
        <PieceOutBar
          isLeft={true}
          onClick={() => select("WhiteOutPiecesBar")}
          isWhite={true}
          key={"WhiteOutPiecesBar"}
          fill={"#e0ded7"}
        >
          {whiteOutPieces.map((piece, pieceIdx) => (
            <Piece key={`${pieceIdx}`} color={piece} />
          ))}
        </PieceOutBar>
        {gameOn ? (
          <button onClick={rollDice}>🎲 roll Dice 🎲</button>
        ) : (
          <button onClick={startGame}>⚪ Begin Game ⚫</button>
        )}

        <PieceOutBar
          isLeft={false}
          onClick={() => select("BlackOutPiecesBar")}
          isWhite={false}
          key={"BlackOutPiecesBar"}
          fill={"#232937"}
        >
          {blackOutPieces.map((piece, pieceIdx) => (
            <Piece key={`${pieceIdx}`} color={piece} />
          ))}
        </PieceOutBar>
      </div>
    </>
  );
}

export default App;
