import Button from "@mui/material/Button";

import * as React from "react";

/**
 * 共通ボタンコンポーネント
 * @param {*} prm
 * @returns
 */
function CommonButton(prm) {
  return (
    <Button
      variant="contained"
      onClick={prm.onClick}
      sx={{
        fontSize: 20,
        "&:hover": {
          bgcolor: "#AF5",
          color: "black",
        },
      }}
    >
      {prm.text}
    </Button>
  );
}

export default React.memo(CommonButton);
