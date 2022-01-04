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
  oneWay?: boolean;
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
    oneWay,
  } = props;
  const customLeftClass = classNames(`${className}-custom-left-active`, {
    [`${className}-custom-left-disable`]: !leftActive,
  });
  const customRightClass = classNames(`${className}-custom-left-active`, {
    [`${className}-custom-left-disable`]: !rightActive,
  });
  if (multiple) {
    let leftArrowBtn;
    let rightArrowBtn;
    if (typeof leftArrowText === 'string') {
      leftArrowBtn = (
        <Button
          color={leftActive ? ButtonColor.primary : ButtonColor.default}
          disabled={!leftActive}
          onClick={moveToLeft}
          icon='navigate_before'
        >
          {leftArrowText}
        </Button>
      );
    } else {
      leftArrowBtn = (
        <div className={customLeftClass} onClick={leftActive ? moveToLeft : undefined}>
          {leftArrowText}
        </div>
      )
    }
    if (typeof rightArrowText === 'string') {
      rightArrowBtn = (
        <Button
          color={rightActive ? ButtonColor.primary : ButtonColor.default}
          disabled={!rightActive}
          onClick={moveToRight}
          icon='navigate_next'
        >
          {rightArrowText}
        </Button>
      );
    } else {
      rightArrowBtn = (
        <div className={customRightClass} onClick={rightActive ? moveToRight : undefined}>
          {rightArrowText}
        </div>
      )
    }

    return (
      <div className={className}>
        {oneWay ? null : leftArrowBtn}
        {rightArrowBtn}
      </div>
    );
  }
  return null;
}
