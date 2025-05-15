import BattleEffect from "@mui/icons-material/Bolt";
import DownIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import LeftIcon from "@mui/icons-material/KeyboardArrowLeftRounded";
import RightIcon from "@mui/icons-material/KeyboardArrowRightRounded";
import UpIcon from "@mui/icons-material/KeyboardArrowUpRounded";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";

import _ from "lodash";
import * as React from "react";
import { useNavigate } from "react-router-dom";
import { useKey } from "react-use";

import "../App.css";
import AwayConfirm from "./AwayConfirm";
import GameCell from "./GameCell";
import { registScore } from "./GameScore";

import CommonButton from "./Common/CommonButton";
import DialogAlert from "./Common/DialogAlert";
import * as EnemyData from "./Data/M_EnemyData";
import * as GameData from "./Data/M_GameData";
import { ENEMY_NUM, ENEMY_REPOP_TURN, LOG_MAX_LENGTH, MAP_LENGTH, VISIBLE_LENGTH } from "./Data/M_GameData";
import * as ItemData from "./Data/M_ItemData";

/**
 * ゲームメイン画面
 * @returns
 */
function RogueGame() {
  const navigate = useNavigate();

  const [countFloor, setCountFloor] = React.useState(1);
  //マップデータ 0:通路 1:壁
  const [mapData, setMapData] = React.useState(GameData.generate2DArrayJSON(MAP_LENGTH, GameData.initMapData()));
  const [playerPosition, setPlayerPosition] = React.useState({ x: 0, y: 0 });
  const [floorPosition, setFloorPosition] = React.useState({ x: 0, y: 0 });
  const [playerData, setPlayerData] = React.useState(GameData.getPlayerData());
  const [displayEnemy, setDisplayEnemy] = React.useState({});
  const [items, setItems] = React.useState([]);
  const [playerWeapon, setPlayerWeapon] = React.useState(GameData.initPlayerWeapon());
  const [playerArmor, setPlayerArmor] = React.useState(GameData.initPlayerArmor());
  const [floorLogs, setFloorLogs] = React.useState([]);
  const [countTurn, setCountTurn] = React.useState(0);
  const [isChangeFloor, setIsChangeFloor] = React.useState(false);
  const [isBattleEffect, setIsBattleEffect] = React.useState(false);
  const [openAlert, setOpenAlert] = React.useState(false);
  const [msgAlert, setMsgAlert] = React.useState("");
  const [score, setScore] = React.useState(0);

  //useRef
  const refs = React.useRef([]);
  const rn = {
    mapData: 0,
    playerPosition: 1,
    floorPosition: 2,
    countFloor: 3,
    playerData: 4,
    countTurn: 5,
    displayEnemy: 6,
    openAlert: 7,
    score: 8,
    playerWeapon: 9,
    playerArmor: 10,
  };
  const elements = [
    mapData,
    playerPosition,
    floorPosition,
    countFloor,
    playerData,
    countTurn,
    displayEnemy,
    openAlert,
    score,
    playerWeapon,
    playerArmor,
  ];
  for (var i = 0; i < elements.length; i++) {
    refs.current[i] = elements[i];
  }

  /**
   * ゲーム開始処理
   */
  const initGame = () => {
    GameData.generateMapData(setMapData, setPlayerPosition, setFloorPosition, countFloor);
    setPlayerData(GameData.getPlayerData());
    setPlayerData({ ...playerData, at: playerData.at + playerWeapon.power, df: playerData.df + playerArmor.power });
  };

  /**
   * ログ書き込み
   * @param {*} str ログ文字列
   */
  const writeLog = (str) => {
    let tmp_floorLogs = floorLogs;
    tmp_floorLogs.push(str);

    if (tmp_floorLogs.length > LOG_MAX_LENGTH) {
      tmp_floorLogs.shift();
    }

    setFloorLogs(tmp_floorLogs);
  };

  /**
   * バトル時演出管理
   */
  const effectBattle = () => {
    setIsBattleEffect(true);
    setTimeout(() => {
      setIsBattleEffect(false);
    }, 100);
  };

  /**
   * プレイヤー1マス移動
   * @param {*} direct 移動方向
   * @returns
   */
  const movePlayer = (direct) => {
    if (refs.current[rn.openAlert]) {
      return;
    }

    let targetX = refs.current[rn.playerPosition].x;
    let targetY = refs.current[rn.playerPosition].y;
    let tmpMapData = refs.current[rn.mapData];

    switch (direct) {
      case 1:
        //上
        targetX = targetX - 1;
        break;
      case 2:
        //左
        targetY = targetY - 1;
        break;
      case 3:
        //右
        targetY = targetY + 1;
        break;
      case 4:
        //下
        targetX = targetX + 1;
        break;

      default:
        break;
    }

    //移動不可
    if (tmpMapData[targetX][targetY].map === 1) {
      return;
    }

    //階段に移動
    if (tmpMapData[targetX][targetY].icon === "F") {
      if (window.confirm("次の階へ移動しますか？")) {
        //フロア移動時のアニメーション付き
        setIsChangeFloor(true);
        setTimeout(() => {
          //ゲームクリア
          if (refs.current[rn.countFloor] === GameData.GAME_CLEAR_FLOOR) {
            let rank = registScore("CLEAR", refs.current[rn.score] + 100);
            let msg =
              rank === 0
                ? "GAME CLEAR!\nスコア：" + refs.current[rn.score] + 100
                : "GAME CLEAR!\nスコア：" + refs.current[rn.score] + 100 + "\n★" + rank + "位★";
            setMsgAlert(msg);
            setOpenAlert(true);
            return;
          }

          GameData.generateMapData(setMapData, setPlayerPosition, setFloorPosition, refs.current[rn.countFloor]);
          setCountFloor(refs.current[rn.countFloor] + 1);
          setScore(refs.current[rn.score] + 100);
          setCountTurn(0);
          setIsChangeFloor(false);
        }, 1000);
        return;
      } else {
        tmpMapData[refs.current[rn.playerPosition].x][refs.current[rn.playerPosition].y].icon = "";
        tmpMapData[targetX][targetY].icon = "P";
        setPlayerPosition({ x: targetX, y: targetY });
      }
    }
    //宝箱取得
    else if (tmpMapData[targetX][targetY].icon === "T") {
      tmpMapData[targetX][targetY].icon = "";

      let tmp_items = ItemData.getItem(
        items,
        refs.current[rn.countFloor],
        writeLog,
        refs.current[rn.playerData],
        setPlayerData,
        setPlayerWeapon,
        setPlayerArmor,
        refs.current[rn.playerWeapon],
        refs.current[rn.playerArmor]
      );
      setItems(tmp_items);
    }
    //エネミーと戦闘
    else if (tmpMapData[targetX][targetY].icon === "E") {
      if (
        tmpMapData[targetX][targetY].data.name === EnemyData.enemyList.mimick.name &&
        !tmpMapData[targetX][targetY].data.isTouched
      ) {
        tmpMapData[targetX][targetY].data.isTouched = true;
      } else {
        //戦闘処理
        let enemyData = GameData.battleEnemy(
          refs.current[rn.score],
          setScore,
          refs.current[rn.playerData],
          setPlayerData,
          tmpMapData[targetX][targetY],
          refs.current[rn.countTurn],
          writeLog,
          true
        );

        if (enemyData.id === refs.current[rn.displayEnemy].id || enemyData.id === undefined) {
          setDisplayEnemy(enemyData);
        }
      }

      effectBattle();
    }
    //プレイヤー1マス移動
    else {
      if (
        refs.current[rn.playerPosition].x === refs.current[rn.floorPosition].x &&
        refs.current[rn.playerPosition].y === refs.current[rn.floorPosition].y
      ) {
        tmpMapData[refs.current[rn.playerPosition].x][refs.current[rn.playerPosition].y].icon = "F";
      } else {
        tmpMapData[refs.current[rn.playerPosition].x][refs.current[rn.playerPosition].y].icon = "";
      }
      tmpMapData[targetX][targetY].icon = "P";

      setPlayerPosition({ x: targetX, y: targetY });

      //移動先マスが地雷の場合
      if (tmpMapData[targetX][targetY].sp === "Bomb") {
        writeLog("じらいだ！10ダメージをくらった");
        setPlayerData({ ...playerData, lp: playerData.lp - 10 });
        tmpMapData[targetX][targetY].sp = "";
      }
    }

    //全エネミー情報取得
    let enemyList = [];
    for (let x = 0; x < tmpMapData.length; x++) {
      for (let y = 0; y < tmpMapData[x].length; y++) {
        if (tmpMapData[x][y].icon === "E") {
          enemyList.push({ x: x, y: y });
        }
      }
    }

    for (let e of enemyList) {
      //各エネミー行動
      let isBattle = EnemyData.actionEnemy(
        refs.current[rn.playerData],
        setPlayerData,
        writeLog,
        tmpMapData,
        e.x,
        e.y,
        refs.current[rn.playerPosition],
        refs.current[rn.floorPosition],
        refs.current[rn.countTurn]
      );

      if (isBattle) {
        effectBattle();
      }
    }

    //再レンダリングのため、ディープコピー
    let copyMapData = _.cloneDeep(tmpMapData);

    setCountTurn(refs.current[rn.countTurn] + 1);
    setMapData(copyMapData);
  };

  /**
   * 初期化処理
   */
  React.useEffect(() => {
    initGame();
  }, []);

  /**
   * プレイヤーのLP変動時処理
   */
  React.useEffect(() => {
    //LP0になったらGAMEOVER
    if (playerData.lp <= 0) {
      let rank = registScore(countFloor, score);
      let msg = rank === 0 ? "GAMEOVER\nスコア：" + score : "GAMEOVER\nスコア：" + score + "\n★" + rank + "位★";
      setMsgAlert(msg);
      setOpenAlert(true);
    }
  }, [playerData.lp]);

  /**
   * 表示エネミーのLP変動時処理
   */
  React.useEffect(() => {
    //エネミーのLP0になったら非表示
    if (displayEnemy.lp <= 0) {
      setDisplayEnemy({});
    }
  }, [displayEnemy.lp]);

  /**
   * ターン変更時処理
   */
  React.useEffect(() => {
    //１フロア制限で警告・ゲームオーバー
    if (countTurn === 200) {
      writeLog("このフロアにいられなくなります");
    } else if (countTurn === 250) {
      let rank = registScore(countFloor, score);
      let msg = rank === 0 ? "GAMEOVER\nスコア：" + score : "GAMEOVER\nスコア：" + score + "\n★" + rank + "位★";
      setMsgAlert(msg);
      setOpenAlert(true);
    }

    //エネミーリポップ
    if (countTurn !== 0 && countTurn % ENEMY_REPOP_TURN === 0) {
      let tmpMapData = mapData;
      const visibleHalfLength = Math.floor(VISIBLE_LENGTH / 2);

      while (true) {
        let x = Math.floor(Math.random() * MAP_LENGTH);
        let y = Math.floor(Math.random() * MAP_LENGTH);

        if (tmpMapData[x][y].map === 0 && tmpMapData[x][y].icon === "") {
          if (
            !(
              x > playerPosition.x - visibleHalfLength &&
              x < playerPosition.x + visibleHalfLength &&
              y > playerPosition.y - visibleHalfLength &&
              y < playerPosition.y + visibleHalfLength
            )
          ) {
            tmpMapData[x][y].icon = "E";
            //階層によって敵の強さ変化
            tmpMapData[x][y].data = EnemyData.getEnemyData(countFloor);
            tmpMapData[x][y].data.id = countTurn / ENEMY_REPOP_TURN + ENEMY_NUM;
            break;
          }
        }
      }

      setMapData(tmpMapData);
    }
  }, [countTurn]);

  //キーダウンイベント（↑,←,→,↓）
  useKey("ArrowUp", (e) => {
    e.preventDefault();
    movePlayer(1);
  });
  useKey("ArrowLeft", (e) => {
    e.preventDefault();
    movePlayer(2);
  });
  useKey("ArrowRight", (e) => {
    e.preventDefault();
    movePlayer(3);
  });
  useKey("ArrowDown", (e) => {
    e.preventDefault();
    movePlayer(4);
  });

  return (
    <React.Fragment>
      <Box sx={{ flexGrow: 1 }} className="main-design">
        <Grid container>
          <Grid item xs={12} margin="10px">
            <Typography variant="h3">InfiniteLabyrinth</Typography>
          </Grid>

          <Grid item xs={4} margin="10px 0">
            <Typography variant="h4">{countFloor}F</Typography>
          </Grid>
          <Grid item xs={4} margin="10px 0">
            <Typography variant="h4">スコア：{score}</Typography>
          </Grid>
          <Grid item xs={4} margin="10px 0">
            <CommonButton
              text="リタイア"
              onClick={() => {
                if (window.confirm("メニューに戻りますか？")) {
                  navigate("/");
                }
              }}
            ></CommonButton>
          </Grid>

          <Grid item xs={2}>
            <BattleEffect
              color="error"
              style={{ transition: "0.1s", opacity: isBattleEffect ? 1 : 0, fontSize: "3em" }}
              className="base-right"
            ></BattleEffect>
          </Grid>
          <Grid
            item
            xs={5}
            style={{
              transition: "1s",
              opacity: isChangeFloor ? 0 : 1,
              width: isChangeFloor ? "60vw" : 0,
            }}
          >
            <Box className="base-right">
              {[...Array(VISIBLE_LENGTH)].map((_, x) => (
                <div style={{ display: "flex" }} key={x}>
                  {[...Array(VISIBLE_LENGTH)].map((_, y) => (
                    <GameCell
                      key={x + "" + y}
                      x={x}
                      y={y}
                      posx={playerPosition.x}
                      posy={playerPosition.y}
                      visibleHalfLength={Math.floor(VISIBLE_LENGTH / 2)}
                      mapData={mapData}
                      setDisplayEnemy={setDisplayEnemy}
                    ></GameCell>
                  ))}
                </div>
              ))}
            </Box>
          </Grid>
          <Grid item xs={2}>
            <Box className="base-right">
              <Grid container>
                <Grid item xs={4}></Grid>
                <Grid item xs={4}>
                  <IconButton
                    onClick={() => {
                      movePlayer(1);
                    }}
                  >
                    <UpIcon />
                  </IconButton>
                </Grid>
                <Grid item xs={4}></Grid>

                <Grid item xs={4}>
                  <IconButton
                    onClick={() => {
                      movePlayer(2);
                    }}
                  >
                    <LeftIcon />
                  </IconButton>
                </Grid>
                <Grid item xs={4}></Grid>
                <Grid item xs={4}>
                  <IconButton
                    onClick={() => {
                      movePlayer(3);
                    }}
                  >
                    <RightIcon />
                  </IconButton>
                </Grid>

                <Grid item xs={4}></Grid>
                <Grid item xs={4}>
                  <IconButton
                    onClick={() => {
                      movePlayer(4);
                    }}
                  >
                    <DownIcon />
                  </IconButton>
                </Grid>
                <Grid item xs={4}></Grid>
              </Grid>
            </Box>
          </Grid>
          <Grid item xs={3}></Grid>

          <Grid item xs={1}></Grid>
          <Grid item xs={3} md={2}>
            {displayEnemy.name && (
              <Box className="base-left">
                <div className="text-title">{displayEnemy.name}</div>
                <div className="text-body">LP : {displayEnemy.lp}</div>
                <div className="text-body">AT : {displayEnemy.at}</div>
                <div className="text-body">DF : {displayEnemy.df}</div>
              </Box>
            )}
          </Grid>
          <Grid item xs={4} md={2}>
            <Box className="base-left">
              <div className="text-title">プレイヤー</div>
              <div className="text-body">LP : {playerData.lp}</div>
              <div className="text-body">AT : {playerData.at}</div>
              <div className="text-body">DF : {playerData.df}</div>
              <br></br>
              <div className="text-body">E : {playerWeapon.name}</div>
              <div className="text-body">E : {playerArmor.name}</div>
            </Box>
          </Grid>
          <Grid item xs={3} md={2}>
            <Box className="base-left">
              <div className="text-title">アイテム</div>
              {items.map((item, i) => {
                return (
                  <AwayConfirm
                    key={i}
                    index={i}
                    items={items}
                    item={item}
                    setItems={setItems}
                    playerData={playerData}
                    setPlayerData={setPlayerData}
                    setPlayerWeapon={setPlayerWeapon}
                    setPlayerArmor={setPlayerArmor}
                    playerWeapon={playerWeapon}
                    playerArmor={playerArmor}
                    mapData={mapData}
                    setMapData={setMapData}
                    playerPosition={playerPosition}
                  ></AwayConfirm>
                );
              })}
            </Box>
          </Grid>

          <Grid item xs={8}>
            <Box
              sx={{
                border: 1,
                borderRadius: "16px",
                margin: 3,
                padding: 1,
                textAlign: "left",
                height: "calc( 1.2em * " + LOG_MAX_LENGTH + " )",
                lineHeight: "1.2",
                bgcolor: "white",
              }}
            >
              {floorLogs.map((log, i) => {
                return <div key={i}>{log}</div>;
              })}
            </Box>
          </Grid>
        </Grid>
      </Box>
      <DialogAlert
        open={openAlert}
        msg={msgAlert}
        event={() => {
          setOpenAlert(false);
          navigate("/");
        }}
      ></DialogAlert>
    </React.Fragment>
  );
}

export default React.memo(RogueGame);
