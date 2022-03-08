import React, { MouseEventHandler, FunctionComponent, ReactNode, CSSProperties } from 'react';
import noop from 'lodash/noop';
import classNames from 'classnames';
import Button, { ButtonProps } from '../button';
import { Size } from '../_util/enum';

export interface TransferOperationProps {
  className?: string;
  leftArrowText?: ReactNode;
  rightArrowText?: ReactNode;
  moveToLeft?: MouseEventHandler<any>;
  moveToRight?: MouseEventHandler<any>;
  leftActive?: boolean;
  rightActive?: boolean;
  style?: CSSProperties;
  buttonProps?: ButtonProps;
}

const Operation: FunctionComponent<TransferOperationProps> = function Operation(props) {
  const {
    moveToLeft = noop,
    moveToRight = noop,
    leftArrowText = '',
    rightArrowText = '',
    leftActive,
    rightActive,
    className,
    style,
    buttonProps,
  } = props;
  const customLeftClass = classNames(`${className}-custom-left-active`, {
    [`${className}-custom-left-disable`]: !leftActive,
  });
  const customRightClass = classNames(`${className}-custom-left-active`, {
    [`${className}-custom-left-disable`]: !rightActive,
  });
  return (
    <div className={className} style={style}>
      {typeof leftArrowText === 'string' ? (
        <Button
          {...buttonProps}
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
          {...buttonProps}
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

Operation.displayName = 'TransferOperation';

export default Operation;
