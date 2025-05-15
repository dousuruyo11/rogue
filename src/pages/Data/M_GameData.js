import { enemyList, getEnemyData } from "./M_EnemyData";

/**ボマー地雷埋め確率*/
export const BOMMER_BOMB_RATE = 5;
/**1フロアエネミー数*/
export const ENEMY_NUM = 7;
/**エネミーリポップターン数*/
export const ENEMY_REPOP_TURN = 30;
/**ゲームクリアフロア数*/
export const GAME_CLEAR_FLOOR = 5;
/**ログ表示行数*/
export const LOG_MAX_LENGTH = 10;
/**マップ全体長さ　奇数のみ*/
export const MAP_LENGTH = 21;
/**1フロア宝箱数*/
export const TREASURE_NUM = 6;
/**視界に見えるマップの長さ　奇数のみ*/
export const VISIBLE_LENGTH = 9;
/**ゾンビ復活ターン数*/
export const ZOMBEE_REBORN_TURN = 5;

/**
 * リスト中のオブジェクトをランダム取得
 * @param {*} table フロア別テーブル
 * @param {*} list 対象リスト
 * @returns ランダムオブジェクト
 */
export const getFloorRandom = (table, list) => {
  let rand = Math.floor(Math.random() * 100);
  let rate = 0;
  let result = {};

  for (const prop in table) {
    rate += table[prop];
    if (rand <= rate) {
      for (const val in list) {
        if (list[val].name === prop) {
          result = list[val];
        }
      }
      break;
    }
  }

  return result;
};

/**
 * マップデータ初期化
 * @returns マップデータ
 */
export const initMapData = () => {
  return {
    map: 0,
    icon: "",
    data: {
      name: "",
      lp: 0,
      at: 0,
      df: 0,
    },
    sp: "",
  };
};

/**
 * キャラクターデータのベース
 * @returns
 */
export const getCharacterBaseData = () => {
  return {
    name: "",
    lp: 0,
    at: 0,
    df: 0,
  };
};

/**
 * プレイヤーデータ
 * @returns
 */
export const getPlayerData = () => {
  let player = getCharacterBaseData();
  player.lp = 10;
  player.at = 2;
  player.df = 0;
  return player;
};

/**
 * プレイヤー武器情報初期化
 * @returns
 */
export const initPlayerWeapon = () => {
  return {
    name: "ぬののけん",
    power: 1,
    special: "",
  };
};

/**
 * プレイヤー防具情報初期化
 * @returns
 */
export const initPlayerArmor = () => {
  return {
    name: "ぬののふく",
    power: 1,
    special: "",
  };
};

/**
 * 戦闘処理
 * @param {*} score スコア
 * @param {*} setScore
 * @param {*} playerData プレイヤーデータ
 * @param {*} setPlayerData
 * @param {*} targetMapData
 * @param {*} countTurn 経過ターン
 * @param {*} writelog ログ書き込み
 * @param {*} isPlayerTurn true:プレイヤーターン false:エネミーターン
 * @returns エネミーデータ
 */
export const battleEnemy = (
  score,
  setScore,
  playerData,
  setPlayerData,
  targetMapData,
  countTurn,
  writelog,
  isPlayerTurn
) => {
  //乱数補正係数
  let hosei = Math.random() * (1.3 - 0.7) + 0.7;
  let enemyData = targetMapData.data;

  //死亡中のゾンビの場合、スルー
  if (enemyData.name === enemyList.zombee.name && enemyData.isDie) {
    return enemyData;
  }

  if (isPlayerTurn) {
    //プレイヤーターン
    let damage = Math.floor(playerData.at * 0.75 * hosei - enemyData.df * 0.25 * hosei);
    if (damage < 0) damage = 0;

    enemyData.lp = enemyData.lp - damage;
    writelog(damage + "ダメージをあたえた");
  } else {
    //エネミーターン
    let damage = Math.floor(enemyData.at * hosei - playerData.df * hosei);
    if (damage < 0) damage = 0;

    setPlayerData({ ...playerData, lp: playerData.lp - damage });
    writelog(damage + "ダメージをくらった");
  }

  if (enemyData.lp <= 0) {
    if (enemyData.name === enemyList.zombee.name && enemyData.rebornTurn === 0) {
      //ゾンビが一度復活する場合
      enemyData.isDie = true;
      enemyData.rebornTurn = countTurn + ZOMBEE_REBORN_TURN;
    } else {
      writelog(enemyData.name + "をたおした");
      setScore(score + enemyData.score);

      targetMapData.icon = "";
      enemyData = getCharacterBaseData();
    }
  }

  targetMapData.data = enemyData;

  return enemyData;
};

/**
 * 二次元配列を初期値埋めて生成
 * @param {*} length 二次元配列の縦横長さ
 * @param {*} val パディング初期値
 * @returns 二次元配列
 */
export const generate2DArray = (length, val = 0) => {
  return [...Array(length)].map((_) => Array(length).fill(val));
};
export const generate2DArrayJSON = (length, val) => {
  var x, y;
  var tbl = new Array(length);
  for (y = 0; y < length; y++) {
    tbl[y] = new Array(length);
    for (x = 0; x < length; x++) {
      tbl[y][x] = { ...val };
    }
  }
  return tbl;
};

/**
 * 二次元配列print
 * @param {*} arr 対象二次元配列
 */
const print2DArray = (arr) => {
  var str = "";

  for (var x = 0; x < arr.length; x++) {
    for (var y = 0; y < arr[x].length; y++) {
      str += arr[x][y].map + " ";
    }
    str += "\r\n";
  }

  console.log(str.replace(/0/g, "□").replace(/1/g, "■"));
};

/**
 * マップ生成
 * @param {*} setMapData
 * @param {*} setPlayerPosition
 * @param {*} setFloorPosition
 * @param {*} countFloor フロア数
 */
export const generateMapData = (setMapData, setPlayerPosition, setFloorPosition, countFloor) => {
  let tmpMapData = generate2DArrayJSON(MAP_LENGTH, initMapData());

  //外周すべて壁にする
  for (let i = 0; i < MAP_LENGTH; i++) {
    tmpMapData[0][i].map = 1;
    tmpMapData[i][0].map = 1;
    tmpMapData[MAP_LENGTH - 1][i].map = 1;
    tmpMapData[i][MAP_LENGTH - 1].map = 1;
  }

  //偶数×偶数マス（0と最大値以外）を壁にする
  for (let i = 0; i < MAP_LENGTH; i++) {
    for (let j = 0; j < MAP_LENGTH; j++) {
      if (i !== 0 && i !== MAP_LENGTH - 1 && i % 2 === 0 && j !== 0 && j !== MAP_LENGTH - 1 && j % 2 === 0) {
        tmpMapData[i][j].map = 1;

        //真ん中の壁からランダムで１方向に壁を作る
        if (i === 2) {
          let direct = Math.floor(Math.random() * 4) + 1;

          switch (direct) {
            //上
            case 1:
              tmpMapData[i][j - 1].map = 1;
              break;
            //左
            case 2:
              tmpMapData[i - 1][j].map = 1;
              break;
            //右
            case 3:
              tmpMapData[i + 1][j].map = 1;
              break;
            //下
            case 4:
              tmpMapData[i][j + 1].map = 1;
              break;
            default:
              break;
          }
        } else {
          //１行目以外の場合、上方向に壁を作らない
          //すでに壁がある方向に作ることは許可
          let direct = Math.floor(Math.random() * 3) + 2;
          switch (direct) {
            //左
            case 2:
              tmpMapData[i - 1][j].map = 1;
              break;
            //右
            case 3:
              tmpMapData[i + 1][j].map = 1;
              break;
            //下
            case 4:
              tmpMapData[i][j + 1].map = 1;
              break;
            default:
              break;
          }
        }
      }
    }
  }

  //print2DArray(tmpMapData);
  setCharacterData(tmpMapData, setPlayerPosition, setFloorPosition, countFloor);
  setMapData(tmpMapData);
};

/**
 * キャラクターデータをマップ内にセット
 * @param {*} tmpMapData
 * @param {*} setPlayerPosition
 * @param {*} setFloorPosition
 * @param {*} countFloor
 * @returns
 */
const setCharacterData = (tmpMapData, setPlayerPosition, setFloorPosition, countFloor) => {
  let x = 0;
  let y = 0;

  //プレイヤーキャラ配置
  while (true) {
    x = Math.floor(Math.random() * MAP_LENGTH);
    y = Math.floor(Math.random() * MAP_LENGTH);

    if (tmpMapData[x][y].map === 0 && !tmpMapData[x][y].icon) {
      //デッドポイントにプレイヤー置かれる詰みを回避
      if (
        tmpMapData[x - 1][y].map === 1 &&
        tmpMapData[x + 1][y].map === 1 &&
        tmpMapData[x][y - 1].map === 1 &&
        tmpMapData[x][y + 1].map === 1
      ) {
        continue;
      }

      tmpMapData[x][y].icon = "P";
      setPlayerPosition({ x: x, y: y });
      break;
    }
  }

  //エネミーキャラ配置
  for (let i = 0; i < ENEMY_NUM; i++) {
    while (true) {
      x = Math.floor(Math.random() * MAP_LENGTH);
      y = Math.floor(Math.random() * MAP_LENGTH);

      if (tmpMapData[x][y].map === 0 && !tmpMapData[x][y].icon) {
        tmpMapData[x][y].icon = "E";
        //階層によって敵の強さ変化
        tmpMapData[x][y].data = getEnemyData(countFloor);
        tmpMapData[x][y].data.id = i;
        break;
      }
    }
  }

  //アイテム配置
  for (let i = 0; i < TREASURE_NUM; i++) {
    while (true) {
      x = Math.floor(Math.random() * MAP_LENGTH);
      y = Math.floor(Math.random() * MAP_LENGTH);

      if (tmpMapData[x][y].map === 0 && !tmpMapData[x][y].icon) {
        tmpMapData[x][y].icon = "T";
        break;
      }
    }
  }

  //階段配置
  while (true) {
    x = Math.floor(Math.random() * MAP_LENGTH);
    y = Math.floor(Math.random() * MAP_LENGTH);

    if (tmpMapData[x][y].map === 0 && !tmpMapData[x][y].icon) {
      //デッドポイントに階段置かれる詰みを回避
      if (
        tmpMapData[x - 1][y].map === 1 &&
        tmpMapData[x + 1][y].map === 1 &&
        tmpMapData[x][y - 1].map === 1 &&
        tmpMapData[x][y + 1].map === 1
      ) {
        continue;
      }

      tmpMapData[x][y].icon = "F";
      setFloorPosition({ x: x, y: y });
      break;
    }
  }

  return tmpMapData;
};
