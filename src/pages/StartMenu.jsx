import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";

import * as React from "react";
import { useNavigate } from "react-router-dom";

import "../App.css";

import CommonButton from "./Common/CommonButton";

/**
 * メニュー画面
 * @returns
 */
function StartMenu() {
  const navigate = useNavigate();

  /**
   * ゲーム初期設定
   */
  React.useEffect(() => {
    if (!localStorage.getItem("rogueScores")) {
      localStorage.setItem("rogueScores", JSON.stringify([{ floor: 0, score: 0 }]));
    }
  }, []);

  return (
    <Grid container className="main-design">
      <Grid item xs={12}>
        <Typography variant="h3">RogueLike</Typography>
      </Grid>
      <Grid item xs={12}>
        <CommonButton
          text="Start"
          onClick={() => {
            navigate("/game");
          }}
        ></CommonButton>
      </Grid>
      <Grid item xs={12}>
        <CommonButton
          text="Score"
          onClick={() => {
            navigate("/score");
          }}
        ></CommonButton>
      </Grid>
    </Grid>
  );
}

export default React.memo(StartMenu);
