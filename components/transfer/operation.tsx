import React, { FormEventHandler, FunctionComponent, ReactNode } from 'react';
import noop from 'lodash/noop';
import classNames from 'classnames';
import Button from '../button';
import { Size } from '../_util/enum';

export interface TransferOperationProps {
  className?: string;
  leftArrowText?: string | ReactNode;
  rightArrowText?: string | ReactNode;
  moveToLeft?: FormEventHandler<any>;
  moveToRight?: FormEventHandler<any>;
  leftActive?: boolean;
  rightActive?: boolean;
}

const Operation: FunctionComponent<TransferOperationProps> = props => {
  const {
    moveToLeft = noop,
    moveToRight = noop,
    leftArrowText = '',
    rightArrowText = '',
    leftActive,
    rightActive,
    className,
  } = props;
  const customLeftClass = classNames(`${className}-custom-left-active`, {
    [`${className}-custom-left-disable`]: !leftActive,
  });
  const customRightClass = classNames(`${className}-custom-left-active`, {
    [`${className}-custom-left-disable`]: !rightActive,
  });
  return (
    <div className={className}>
      {typeof leftArrowText === 'string' ? (
        <Button
          type="primary"
          size={Size.small}
          disabled={!leftActive}
          onClick={moveToLeft}
          icon="keyboard_arrow_left"
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
          type="primary"
          size={Size.small}
          disabled={!rightActive}
          onClick={moveToRight}
          icon="keyboard_arrow_right"
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
};

export default Operation;
