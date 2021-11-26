import React, { FormEventHandler, ReactNode } from 'react';
import noop from 'lodash/noop';
import classNames from 'classnames';
import Button from '../button';
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
  const customLeftClass = classNames(`${className}-custom-left-active`, {
    [`${className}-custom-left-disable`]: !leftActive,
  });
  const customRightClass = classNames(`${className}-custom-left-active`, {
    [`${className}-custom-left-disable`]: !rightActive,
  });
  if (multiple) {
    return (
      <div className={className}>
        {typeof leftArrowText === 'string' ? (
          <Button
            color={leftActive ? ButtonColor.primary : ButtonColor.default}
            disabled={!leftActive}
            onClick={moveToLeft}
            icon="navigate_before"
          >
            {leftArrowText}
          </Button>
        ) : (
          <div className={customLeftClass} onClick={leftActive ? moveToLeft : undefined}>
            {leftArrowText}
          </div>
        )}

        {typeof rightArrowText === 'string' ? (
          <Button
            color={rightActive ? ButtonColor.primary : ButtonColor.default}
            disabled={!rightActive}
            onClick={moveToRight}
            icon="navigate_next"
          >
            {rightArrowText}
          </Button>
        ) : (
          <div className={customRightClass} onClick={rightActive ? moveToRight : undefined}>
            {rightArrowText}
          </div>
        )}
      </div>
    );
  }
  return null;
}
