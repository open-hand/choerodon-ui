import React, { FunctionComponent, memo } from 'react';
import Button from '../button/Button';
import { FuncType } from '../button/enum';
import { stopPropagation } from '../_util/EventManager';

export interface ToolbarProps {
  prefixCls?: string;
  downloadUrl?: string;
  zoomInDisabled?: boolean;
  zoomOutDisabled?: boolean;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onRotateLeft?: () => void;
  onRotateRight?: () => void;
}

const Toolbar: FunctionComponent<ToolbarProps> = function Toolbar(props) {
  const { prefixCls, downloadUrl, zoomInDisabled, zoomOutDisabled, onZoomIn, onZoomOut, onRotateLeft, onRotateRight } = props;
  return (
    <div className={`${prefixCls}-toolbar`}>
      <Button
        icon="zoom_in"
        funcType={FuncType.link}
        className={`${prefixCls}-btn ${prefixCls}-btn-tool`}
        onClick={onZoomIn}
        onMouseDown={stopPropagation}
        disabled={zoomInDisabled}
      />
      <Button
        icon="zoom_out"
        funcType={FuncType.link}
        className={`${prefixCls}-btn ${prefixCls}-btn-tool`}
        onClick={onZoomOut}
        onMouseDown={stopPropagation}
        disabled={zoomOutDisabled}
      />
      <Button
        icon="replay_90"
        funcType={FuncType.link}
        className={`${prefixCls}-btn ${prefixCls}-btn-tool`}
        onClick={onRotateLeft}
        onMouseDown={stopPropagation}
      />
      <Button
        icon="play_90"
        funcType={FuncType.link}
        className={`${prefixCls}-btn ${prefixCls}-btn-tool`}
        onClick={onRotateRight}
        onMouseDown={stopPropagation}
      />
      {
        downloadUrl && (
          <Button
            icon="get_app"
            funcType={FuncType.link}
            className={`${prefixCls}-btn ${prefixCls}-btn-tool`}
            href={downloadUrl}
            target="_blank"
          />
        )
      }
    </div>
  );
};

Toolbar.displayName = 'Toolbar';

export default memo(Toolbar);
