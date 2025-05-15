import _ from "lodash";

import { getCharacterBaseData, getFloorRandom } from "./M_GameData";

/**
 * アイテム一覧
 */
const itemList = {
  trap: {
    name: "trap",
    detail: "",
  },
  portion: {
    name: "やくそう",
    detail: "LPを10ふやす",
  },
  bronze_sword: {
    name: "どうのけん",
    detail: "AT:3",
  },
  bronze_armor: {
    name: "どうのよろい",
    detail: "DF:3",
  },
  delete_switch: {
    name: "さくじょスイッチ",
    detail: "まわりのてきをすべてけす",
  },
  silver_sword: {
    name: "ぎんのけん",
    detail: "AT:5",
  },
  silver_armor: {
    name: "ぎんのよろい",
    detail: "DF:5",
  },
};

/**
 * アイテムテーブル
 */
const itemFloorTable = [
  {
    [itemList.delete_switch.name]: 40,
    [itemList.bronze_sword.name]: 20,
    [itemList.bronze_armor.name]: 20,
    [itemList.trap.name]: 20,
  },
  {
    [itemList.portion.name]: 20,
    [itemList.silver_sword.name]: 20,
    [itemList.silver_armor.name]: 20,
    [itemList.delete_switch.name]: 20,
    [itemList.trap.name]: 20,
  },
];

/**
 * アイテム取得
 * @param {*} items アイテム一覧
 * @param {*} floorNum フロア数
 * @param {*} writeLog
 * @param {*} playerData
 * @param {*} setPlayerData
 * @param {*} setPlayerWeapon
 * @param {*} setPlayerArmor
 * @param {*} playerWeapon
 * @param {*} playerArmor
 * @returns
 */
export const getItem = (
  items,
  floorNum,
  writeLog,
  playerData,
  setPlayerData,
  setPlayerWeapon,
  setPlayerArmor,
  playerWeapon,
  playerArmor
) => {
  let item = "";

  if (floorNum < 3) {
    item = getFloorRandom(itemFloorTable[0], itemList);
  } else if (floorNum < 5) {
    item = getFloorRandom(itemFloorTable[1], itemList);
  }

  if (item.name === itemList.trap.name) {
    getTrap(items, writeLog, playerData, setPlayerData, setPlayerWeapon, setPlayerArmor, playerWeapon, playerArmor);
  } else {
    items.push(item);
  }

  if (items.length > 5) {
    //アイテムが多い場合、先頭のものを削除
    items.shift();
  }

  return items;
};

/**
 * トラップ時の処理
 * @param {*} items アイテム一覧
 * @param {*} writeLog
 * @param {*} playerData
 * @param {*} setPlayerData
 * @param {*} setPlayerWeapon
 * @param {*} setPlayerArmor
 * @param {*} playerWeapon
 * @param {*} playerArmor
 */
const getTrap = (
  items,
  writeLog,
  playerData,
  setPlayerData,
  setPlayerWeapon,
  setPlayerArmor,
  playerWeapon,
  playerArmor
) => {
  let trapNum = Math.floor(Math.random() * 4);
  switch (trapNum) {
    case 0:
      writeLog("わなだ！LPが5へった");
      setPlayerData({ ...playerData, lp: playerData.lp - 5 });
      break;
    case 1:
      writeLog("わなだ！アイテムをひとつなくした");
      items.shift();
      break;
    case 2:
      writeLog("わなだ！ぶきをうしなった");
      setPlayerData({ ...playerData, at: playerData.at - playerWeapon.power });
      setPlayerWeapon({ name: "", power: 0, special: "" });
      break;
    case 3:
      writeLog("わなだ！ぼうぐをうしなった");
      setPlayerData({ ...playerData, df: playerData.df - playerArmor.power });
      setPlayerArmor({ name: "", power: 0, special: "" });
      break;
    default:
      break;
  }
};

/**
 * アイテム使用
 * @param {*} name アイテム名
 * @param {*} playerData
 * @param {*} setPlayerData
 * @param {*} setPlayerWeapon
 * @param {*} setPlayerArmor
 * @param {*} playerWeapon
 * @param {*} playerArmor
 */
export const usageItem = (
  name,
  playerData,
  setPlayerData,
  setPlayerWeapon,
  setPlayerArmor,
  playerWeapon,
  playerArmor,
  mapData,
  setMapData,
  playerPosition
) => {
  switch (name) {
    //やくそう
    case itemList.portion.name:
      setPlayerData({ ...playerData, lp: playerData.lp + 10 });
      break;
    //どうのけん
    case itemList.bronze_sword.name:
      setPlayerWeapon({
        name: itemList.bronze_sword.name,
        power: 3,
        special: "",
      });
      setPlayerData({ ...playerData, at: playerData.at - playerWeapon.power + 3 });
      break;
    //どうのよろい
    case itemList.bronze_armor.name:
      setPlayerArmor({
        name: itemList.bronze_armor.name,
        power: 3,
        special: "",
      });
      setPlayerData({ ...playerData, df: playerData.df - playerArmor.power + 3 });
      break;
    //ぎんのけん
    case itemList.silver_sword.name:
      setPlayerWeapon({
        name: itemList.silver_sword.name,
        power: 5,
        special: "",
      });
      setPlayerData({ ...playerData, at: playerData.at - playerWeapon.power + 5 });
      break;
    //ぎんのよろい
    case itemList.silver_armor.name:
      setPlayerArmor({
        name: itemList.silver_armor.name,
        power: 5,
        special: "",
      });
      setPlayerData({ ...playerData, df: playerData.df - playerArmor.power + 5 });
      break;
    //さくじょスイッチ
    case itemList.delete_switch.name:
      let tmpMapData = mapData;
      const arr = [
        { x: playerPosition.x - 1, y: playerPosition.y },
        { x: playerPosition.x + 1, y: playerPosition.y },
        { x: playerPosition.x, y: playerPosition.y - 1 },
        { x: playerPosition.x, y: playerPosition.y + 1 },
      ];

      for (let a of arr) {
        if (tmpMapData[a.x][a.y].icon === "E") {
          tmpMapData[a.x][a.y].icon = "";
          tmpMapData[a.x][a.y].data = getCharacterBaseData();
        }
      }

      //再レンダリングのため、ディープコピー
      let copyMapData = _.cloneDeep(tmpMapData);
      setMapData(copyMapData);
      break;
    default:
      break;
  }
};
