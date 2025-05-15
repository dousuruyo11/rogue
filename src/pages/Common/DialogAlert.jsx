import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogTitle from "@mui/material/DialogTitle";

import * as React from "react";

/**
 * 共通アラートダイアログ
 * @param {*} prm
 * @returns
 */
function DialogAlert(prm) {
  const texts = prm.msg.split(/(\n)/).map((item, index) => {
    return <React.Fragment key={index}>{item.match(/\n/) ? <br /> : item}</React.Fragment>;
  });

  return (
    <Dialog open={prm.open} onClose={prm.event} fullWidth={true}>
      <DialogTitle>{texts}</DialogTitle>
      <DialogActions style={{ justifyContent: "center" }}>
        <Button variant="contained" onClick={prm.event}>
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default React.memo(DialogAlert);
