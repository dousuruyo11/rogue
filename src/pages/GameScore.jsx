import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

import * as React from "react";
import { useNavigate } from "react-router-dom";

import "../App.css";

import CommonButton from "./Common/CommonButton";
import Spacer from "./Common/Spacer";

/**
 * ハイスコア登録
 * @param {*} countFloor 到達フロア数
 * @param {*} score スコア
 * @returns 0以外:スコア順位 0:順位圏外
 */
export const registScore = (countFloor, score) => {
  let json = localStorage.getItem("rogueScores");
  let scores = JSON.parse(json);
  scores.push({ floor: countFloor, score: score });
  scores.sort(function (a, b) {
    if (a.score !== b.score) {
      return b.score - a.score;
    } else {
      return b.floor - a.floor;
    }
  });
  if (scores.length > 10) {
    scores.pop();
  }

  localStorage.setItem("rogueScores", JSON.stringify(scores));

  //スコア順位取得
  let rank = scores.findIndex((e) => e.floor === countFloor && e.score === score) + 1;
  return rank;
};

/**
 * ハイスコアクリア
 */
const clearScore = () => {
  if (window.confirm("ハイスコアを初期化しますか？")) {
    localStorage.removeItem("rogueScores");
    localStorage.setItem("rogueScores", JSON.stringify([{ floor: 0, score: 0 }]));
    window.location.reload();
  }
};

/**
 * スコア画面
 * @returns
 */
function GameScore() {
  let json = localStorage.getItem("rogueScores");
  let scores = JSON.parse(json);
  const navigate = useNavigate();

  return (
    <Box sx={{ flexGrow: 1 }} className="main-design">
      <Grid container>
        <Grid item xs={2}></Grid>
        <Grid item xs={8}>
          <Table sx={{ bgcolor: "white" }}>
            <TableHead>
              <TableRow>
                <TableCell align="center">
                  <div style={{ fontWeight: "bold" }}>到達階層</div>
                </TableCell>
                <TableCell align="center">
                  <div style={{ fontWeight: "bold" }}>スコア</div>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {scores.map((row, index) => (
                <TableRow key={index}>
                  <TableCell align="center">{row.floor}</TableCell>
                  <TableCell align="center">{row.score}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Grid>
        <Grid item xs={12} sx={{ margin: "20px" }}>
          <CommonButton
            text="戻る"
            onClick={() => {
              navigate("/");
            }}
          ></CommonButton>
          <Spacer size={20} horizon={true}></Spacer>
          <CommonButton
            text="スコアクリア"
            onClick={() => {
              clearScore();
            }}
          ></CommonButton>
        </Grid>
      </Grid>
    </Box>
  );
}

export default React.memo(GameScore);
