import PlayerIcon from "@mui/icons-material/Accessibility";
import SuraimuIcon from "@mui/icons-material/Adb";
import ZombeeIcon from "@mui/icons-material/Boy";
import GoburinIcon from "@mui/icons-material/ChildCare";
import FloorIcon from "@mui/icons-material/FileDownload";
import BommerIcon from "@mui/icons-material/LocalFireDepartment";
import ZombeeDieIcon from "@mui/icons-material/LocalHospital";
import TreasureIcon from "@mui/icons-material/Mail";
import KoborudIcon from "@mui/icons-material/Pets";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";

import * as React from "react";

import "../App.css";

import { enemyList } from "./Data/M_EnemyData";

/**
 * マップマス
 * @param {*} prm
 * @returns
 */
function GameCell(prm) {
  /**
   * 各マスのマップデータ計算
   * @returns マップ・アイコン・データ
   */
  const getMapicon = () => {
    let map;
    let icon;
    let data;
    let x = prm.posx + prm.x - prm.visibleHalfLength;
    let y = prm.posy + prm.y - prm.visibleHalfLength;

    if (x < 0 || x >= prm.mapData.length || y < 0 || y >= prm.mapData.length) {
      //マスがマップ外の場合
      map = 1;
      icon = "";
      data = {};
    } else {
      map = prm.mapData[x][y].map;
      icon = prm.mapData[x][y].icon;
      data = prm.mapData[x][y].data;
    }

    return [map, icon, data];
  };

  /**
   * エネミーアイコン取得
   * @param {*} data
   * @returns
   */
  const getEnemyIcon = (data) => {
    return (
      <IconButton
        onClick={() => {
          prm.setDisplayEnemy(data);
        }}
        sx={{ padding: 0, verticalAlign: "top" }}
      >
        {data.name === enemyList.suraimu.name && <SuraimuIcon color="error" className="moveicon"></SuraimuIcon>}
        {data.name === enemyList.goburin.name && <GoburinIcon color="error" className="moveicon"></GoburinIcon>}
        {data.name === enemyList.assasin.name && <SuraimuIcon sx={{ visibility: "hidden" }}></SuraimuIcon>}
        {data.name === enemyList.koborudo.name && <KoborudIcon color="error" className="moveicon"></KoborudIcon>}
        {data.name === enemyList.bommer.name && <BommerIcon color="error" className="moveicon"></BommerIcon>}
        {data.name === enemyList.zombee.name && !data.isDie && (
          <ZombeeIcon color="error" className="moveicon"></ZombeeIcon>
        )}
        {data.name === enemyList.zombee.name && data.isDie && <ZombeeDieIcon color="error"></ZombeeDieIcon>}
        {data.name === enemyList.mimick.name && !data.isTouched && <TreasureIcon color="warning"></TreasureIcon>}
        {data.name === enemyList.mimick.name && data.isTouched && (
          <TreasureIcon color="error" className="moveicon"></TreasureIcon>
        )}
      </IconButton>
    );
  };

  /**
   * アイコン描画
   * @returns アイコン
   */
  const canvasIcon = () => {
    let [, icon, data] = getMapicon();

    switch (icon) {
      case "P":
        return <PlayerIcon color="primary" className="moveicon"></PlayerIcon>;
      case "T":
        return <TreasureIcon color="warning"></TreasureIcon>;
      case "E":
        return getEnemyIcon(data);
      case "F":
        return <FloorIcon color="success"></FloorIcon>;
      default:
        return "";
    }
  };

  /**
   * マスの背景色指定
   * @returns RGBコード
   */
  const getCellStyle = () => {
    let [map, ,] = getMapicon();

    if (map === 1) {
      return {
        bgcolor: "black",
      };
    } else {
      return {
        bgcolor: "#FFFACD",
      };
    }
  };

  return (
    <Paper square variant="outlined" className="cell" sx={getCellStyle}>
      {canvasIcon()}
    </Paper>
  );
}

export default React.memo(GameCell);
