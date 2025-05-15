import { BOMMER_BOMB_RATE, VISIBLE_LENGTH, battleEnemy, getCharacterBaseData, getFloorRandom } from "./M_GameData";

/**
 * エネミー一覧
 */
export const enemyList = {
  suraimu: {
    name: "スライム",
    lp: 5,
    at: 3,
    df: 1,
    score: 10,
  },
  goburin: {
    name: "ゴブリン",
    lp: 8,
    at: 4,
    df: 2,
    score: 20,
  },
  //アイコン非表示
  assasin: {
    name: "アサシン",
    lp: 8,
    at: 4,
    df: 0,
    score: 20,
  },
  //遠距離攻撃
  koborudo: {
    name: "コボルド",
    lp: 5,
    at: 4,
    df: 1,
    score: 20,
  },
  //ランダムで地雷埋める
  bommer: {
    name: "ボマー",
    lp: 10,
    at: 4,
    df: 3,
    score: 30,
  },
  //一度復活する
  zombee: {
    name: "ゾンビ",
    lp: 10,
    at: 5,
    df: 3,
    score: 50,
  },
  //宝箱に擬態
  mimick: {
    name: "ミミック",
    lp: 10,
    at: 5,
    df: 4,
    score: 30,
  },
};

/**
 * エネミーテーブル
 */
const enemyFloorTable = [
  {
    [enemyList.suraimu.name]: 60,
    [enemyList.goburin.name]: 40,
  },
  {
    [enemyList.suraimu.name]: 60,
    [enemyList.assasin.name]: 40,
  },
  {
    [enemyList.koborudo.name]: 60,
    [enemyList.bommer.name]: 40,
  },
  {
    [enemyList.zombee.name]: 70,
    [enemyList.mimick.name]: 30,
  },
];

/**
 * エネミーデータ取得
 * @param {*} floorNum 現在フロア
 * @returns
 */
export const getEnemyData = (floorNum) => {
  let enemy = {};

  if (floorNum === 1) {
    enemy = getFloorRandom(enemyFloorTable[0], enemyList);
  } else if (floorNum === 2) {
    enemy = getFloorRandom(enemyFloorTable[1], enemyList);
  } else if (floorNum === 3) {
    enemy = getFloorRandom(enemyFloorTable[2], enemyList);
  } else if (floorNum >= 4) {
    enemy = getFloorRandom(enemyFloorTable[3], enemyList);
  }

  let enemyData = generateEnemy(enemy);
  if (enemyData.name === enemyList.zombee.name) {
    //ゾンビに死亡フラグ追加
    enemyData.isDie = false;
    enemyData.rebornTurn = 0;
  } else if (enemyData.name === enemyList.mimick.name) {
    //ミミックに擬態フラグ追加
    enemyData.isTouched = false;
  }

  return enemyData;
};

/**
 * エネミーオブジェクト生成
 * @param {*} obj エネミーデータ
 * @returns
 */
const generateEnemy = (obj) => {
  return {
    id: 0,
    name: obj.name,
    lp: obj.lp,
    at: obj.at,
    df: obj.df,
    score: obj.score,
  };
};

/**
 * エネミー行動
 * @param {*} playerData
 * @param {*} setPlayerData
 * @param {*} writelog
 * @param {*} mapData
 * @param {*} enemyX
 * @param {*} enemyY
 * @param {*} playerPosition
 * @param {*} floorPosition
 * @param {*} countTurn
 * @returns true:バトル　false:移動のみ
 */
export const actionEnemy = (
  playerData,
  setPlayerData,
  writelog,
  mapData,
  enemyX,
  enemyY,
  playerPosition,
  floorPosition,
  countTurn
) => {
  let enemyMapData = mapData[enemyX][enemyY];

  //ボマーの場合、確率で地雷埋める
  if (enemyMapData.data.name === enemyList.bommer.name) {
    if (Math.floor(Math.random() * 100) < BOMMER_BOMB_RATE) {
      enemyMapData.sp = "Bomb";
      writelog("ボマーによってじらいをうめられた");
      return false;
    }
  }

  //死亡中のゾンビの場合、復活判定
  if (enemyMapData.data.name === enemyList.zombee.name && enemyMapData.data.isDie) {
    if (enemyMapData.data.rebornTurn === countTurn) {
      enemyMapData.data.isDie = false;
      enemyMapData.data.lp = enemyList.zombee.lp;
    } else {
      return false;
    }
  }

  //擬態中のミミックの場合スルー
  if (enemyMapData.data.name === enemyList.mimick.name && !enemyMapData.data.isTouched) {
    return false;
  }

  //エネミー移動
  if (moveEnemy(mapData, enemyX, enemyY, playerPosition, floorPosition) === false) {
    //移動先にプレイヤーがいる場合、戦闘処理
    battleEnemy(undefined, undefined, playerData, setPlayerData, enemyMapData, undefined, writelog, false);
    return true;
  }

  return false;
};

/**
 * エネミー移動
 * @param {*} mapData
 * @param {*} enemyX エネミー位置X
 * @param {*} enemyY エネミー位置Y
 * @param {*} playerPosition
 * @param {*} floorPosition
 * @returns true:移動成功 false:移動失敗（移動先にプレイヤーが存在）
 */
const moveEnemy = (mapData, enemyX, enemyY, playerPosition, floorPosition) => {
  let targetPaths = [];
  //プレイヤー:対象エネミー間距離
  const distX = enemyX - playerPosition.x;
  const distY = enemyY - playerPosition.y;
  const distance = Math.abs(distX) + Math.abs(distY);

  //距離6マス以内なら最短経路に沿う、それ以上ならランダム移動
  if (distance <= 6) {
    //最短経路取得
    targetPaths = searchShortestPath(mapData, enemyX, enemyY);
  } else {
    let path = { x: enemyX, y: enemyY, dist: 0, before_x: enemyX, before_y: enemyY };

    //4方向でプレイヤーがいる方向を優先
    if (distX > 0 && mapData[enemyX - 1][enemyY].map === 0) {
      //上
      path.x = enemyX - 1;
    } else if (distY > 0 && mapData[enemyX][enemyY - 1].map === 0) {
      //左
      path.y = enemyY - 1;
    } else if (distY < 0 && mapData[enemyX][enemyY + 1].map === 0) {
      //右
      path.y = enemyY + 1;
    } else if (distX < 0 && mapData[enemyX + 1][enemyY].map === 0) {
      //下
      path.x = enemyX + 1;
    } else {
      //ランダムで一方向
      while (true) {
        let direct = Math.floor(Math.random() * 4);

        if (direct === 0 && mapData[enemyX - 1][enemyY].map === 0) {
          //上
          path.x = enemyX - 1;
          break;
        } else if (direct === 1 && mapData[enemyX][enemyY - 1].map === 0) {
          //左
          path.y = enemyY - 1;
          break;
        } else if (direct === 2 && mapData[enemyX][enemyY + 1].map === 0) {
          //右
          path.y = enemyY + 1;
          break;
        } else if (direct === 3 && mapData[enemyX + 1][enemyY].map === 0) {
          //下
          path.x = enemyX + 1;
          break;
        }
      }
    }

    targetPaths.push(path);
  }

  return move1Cell(targetPaths, mapData, enemyX, enemyY, distance, floorPosition);
};

/**
 * １マス移動
 * @param {*} targetPaths 移動経路
 * @param {*} mapData マップデータ
 * @param {*} enemyX エネミー位置X
 * @param {*} enemyY エネミー位置Y
 * @param {*} floorPosition 階段位置
 * @returns true:移動成功 false:移動失敗（移動先にプレイヤーが存在）
 */
const move1Cell = (targetPaths, mapData, enemyX, enemyY, distance, floorPosition) => {
  const targetCell = targetPaths[targetPaths.length - 1];
  let orgEnemyMap = mapData[enemyX][enemyY];
  let targetMap = mapData[targetCell.x][targetCell.y];
  //遠距離攻撃可能かどうか判定
  let isSnipe = targetPaths.every((path) => {
    return path.x === enemyX || path.y === enemyY;
  });

  if (targetMap.icon === "P") {
    return false;
  } else if (targetMap.icon === "E") {
    //移動先が他のエネミーと被る場合、何もしない
    return true;
  } else if (
    orgEnemyMap.data.name === enemyList.koborudo.name &&
    distance <= Math.floor(VISIBLE_LENGTH / 2) &&
    isSnipe
  ) {
    //遠距離持ちの場合、画面範囲内かつ直線範囲の場合、遠距離攻撃する
    return false;
  } else {
    targetMap.icon = "E";
    targetMap.data = orgEnemyMap.data;

    if (enemyX === floorPosition.x && enemyY === floorPosition.y) {
      orgEnemyMap.icon = "F";
    } else {
      orgEnemyMap.icon = "";
    }
    orgEnemyMap.data = getCharacterBaseData();
    return true;
  }
};

/**
 * プレイヤー:対象エネミー間の最短経路を計算
 * @param {*} mapData
 * @param {*} enemyX エネミー位置X
 * @param {*} enemyY エネミー位置Y
 * @returns
 */
const searchShortestPath = (mapData, enemyX, enemyY) => {
  //元々のエネミー位置が「before_x: null, before_y: null」
  let tmpQue = [{ x: enemyX, y: enemyY, dist: 0, before_x: null, before_y: null }];
  //経路探索済みの全マスを記憶
  let allVisitedPaths = [];
  allVisitedPaths.push(tmpQue[0]);

  search: while (tmpQue.length > 0) {
    let current = tmpQue.shift();
    let targetDirection = [
      { x: current.x - 1, y: current.y, dist: current.dist + 1, before_x: current.x, before_y: current.y },
      { x: current.x + 1, y: current.y, dist: current.dist + 1, before_x: current.x, before_y: current.y },
      { x: current.x, y: current.y - 1, dist: current.dist + 1, before_x: current.x, before_y: current.y },
      { x: current.x, y: current.y + 1, dist: current.dist + 1, before_x: current.x, before_y: current.y },
    ];

    for (let direction of targetDirection) {
      if (
        mapData[direction.x][direction.y].map === 0 &&
        (mapData[direction.x][direction.y].icon === "" || mapData[direction.x][direction.y].icon === "P")
      ) {
        if (
          allVisitedPaths.find((obj) => {
            return obj.x === direction.x && obj.y === direction.y;
          }) === undefined
        ) {
          tmpQue.push(direction);
          allVisitedPaths.push(direction);
        }

        if (mapData[direction.x][direction.y].icon === "P") {
          break search;
        }
      }
    }
  }

  let shortestPaths = [];
  //パラメータ初期値はゴール地点から
  shortestPaths = recursiveSearchPath(allVisitedPaths[allVisitedPaths.length - 1], shortestPaths, allVisitedPaths);

  return shortestPaths;
};

/**
 * 最短経路探索用再帰関数
 * プレイヤー地点⇨対象エネミー地点　逆順で探査
 * @param {*} point
 * @param {*} list_result
 * @param {*} listSearched
 * @returns
 */
const recursiveSearchPath = (point, list_result, listSearched) => {
  if (point.before_x !== null) {
    list_result.push(point);

    let new_point = listSearched.find((obj) => {
      return obj.x === point.before_x && obj.y === point.before_y;
    });

    list_result = recursiveSearchPath(new_point, list_result, listSearched);
  }

  return list_result;
};
