import React, { FormEventHandler, ReactNode } from 'react';
import noop from 'lodash/noop';
import Button from '../button';
import { Size } from '../core/enum';
import { ButtonColor } from '../button/enum';

export interface TransferOperationProps {
  className?: string;
  leftArrowText?: string | ReactNode;
  rightArrowText?: string | ReactNode;
  moveToLeft?: FormEventHandler<any>;
  moveToRight?: FormEventHandler<any>;
  leftActive?: boolean;
  rightActive?: boolean;
  multiple?: boolean;
}

export default function TransferOperation(props: TransferOperationProps) {
  const {
    moveToLeft = noop,
    moveToRight = noop,
    leftArrowText = '',
    rightArrowText = '',
    leftActive,
    rightActive,
    className,
    multiple,
  } = props;
  const leftActiveCursor = {
    cursor: !leftActive ? 'no-drop' : 'pointer',
  };
  const rightActiveCursor = {
    cursor: !rightActive ? 'no-drop' : 'pointer',
  };
  if (multiple) {
    return (
      <div className={className}>
        {typeof leftArrowText === 'string' ? (
          <Button
            color={ButtonColor.primary}
            size={Size.small}
            disabled={!leftActive}
            onClick={moveToLeft}
            icon="navigate_before"
          >
            {leftArrowText}
          </Button>
        ) : (
          <div style={leftActiveCursor} onClick={leftActive ? moveToLeft : undefined}>
            {leftArrowText}
          </div>
        )}

        {typeof rightArrowText === 'string' ? (
          <Button
            color={ButtonColor.primary}
            size={Size.small}
            disabled={!rightActive}
            onClick={moveToRight}
            icon="navigate_next"
          >
            {rightArrowText}
          </Button>
        ) : (
          <div style={rightActiveCursor} onClick={rightActive ? moveToRight : undefined}>
            {rightArrowText}
          </div>
        )}
      </div>
    );
  }
  return null;
}
