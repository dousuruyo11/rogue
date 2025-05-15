import * as React from "react";

/**
 * マージンコンポーネント
 * @returns
 */
function Spacer(prm) {
  return (
    <div
      style={
        prm.horizon
          ? { width: prm.size, height: "auto", display: "inline-block", flexShrink: 0 }
          : { width: "auto", height: prm.size, flexShrink: 0 }
      }
    ></div>
  );
}

export default React.memo(Spacer);
