import Button from "@mui/material/Button";
import Fade from "@mui/material/Fade";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Tooltip from "@mui/material/Tooltip";

import * as React from "react";

import { usageItem } from "./Data/M_ItemData";

/**
 * アイテム一覧
 * @param {*} prm
 * @returns
 */
function AwayConfirm(prm) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  //使う
  const useItem = () => {
    usageItem(
      prm.item.name,
      prm.playerData,
      prm.setPlayerData,
      prm.setPlayerWeapon,
      prm.setPlayerArmor,
      prm.playerWeapon,
      prm.playerArmor,
      prm.mapData,
      prm.setMapData,
      prm.playerPosition
    );

    prm.items.splice(prm.index, 1);
    let tmp_items = [...prm.items];
    prm.setItems(tmp_items);
  };

  //捨てる
  const dropItem = () => {
    prm.items.splice(prm.index, 1);
    let tmp_items = [...prm.items];
    prm.setItems(tmp_items);
  };

  return (
    <div>
      <Tooltip title={prm.item.detail}>
        <Button
          id="fade-button"
          aria-controls={open ? "fade-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
          onClick={handleClick}
        >
          {prm.item.name}
        </Button>
      </Tooltip>
      <Menu
        id="fade-menu"
        MenuListProps={{
          "aria-labelledby": "fade-button",
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        TransitionComponent={Fade}
      >
        <MenuItem onClick={useItem}>使う</MenuItem>
        <MenuItem onClick={dropItem}>捨てる</MenuItem>
      </Menu>
    </div>
  );
}

export default React.memo(AwayConfirm);
