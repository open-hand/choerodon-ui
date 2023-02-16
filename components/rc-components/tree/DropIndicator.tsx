import React from 'react';

export default function DropIndicator({
  prefixCls,
  dropPosition,
  dropLevelOffset,
  indent,
}: {
  dropPosition: -1 | 0 | 1;
  dropLevelOffset: number;
  indent: number;
  prefixCls: string;
}) {
  const style: React.CSSProperties = {
    pointerEvents: 'none',
    position: 'absolute',
    right: 0,
    height: 2,
  };
  switch (dropPosition) {
    case -1:
      style.top = 0;
      style.left = -dropLevelOffset * indent;
      break;
    case 1:
      style.bottom = 0;
      style.left = -dropLevelOffset * indent;
      break;
    case 0:
      style.bottom = 0;
      style.left = indent;
      break;
    default:
  }
  return <div className={`${prefixCls}-drop-indicator`} style={style} />;
}
