import React from "react";
import { Route, Routes } from "react-router-dom";

import "../App.css";
import background from "../img/BG_Cherry.png";
import GameScore from "./GameScore";
import RogueGame from "./RogueGame";
import StartMenu from "./StartMenu";

/**
 * ルーティング制御
 * @returns
 */
function App() {
  return (
    <div style={{ backgroundImage: `url(${background})` }}>
      <Routes>
        <Route path="/" element={<StartMenu />}></Route>
        <Route path="/game" element={<RogueGame />}></Route>
        <Route path="/score" element={<GameScore />}></Route>
      </Routes>
    </div>
  );
}

export default App;
