import React, { FormEventHandler, FunctionComponent } from 'react';
import noop from 'lodash/noop';
import Button from '../button';
import { Size } from '../_util/enum';

export interface TransferOperationProps {
  className?: string;
  leftArrowText?: string;
  rightArrowText?: string;
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
  return (
    <div className={className}>
      <Button
        type="primary"
        size={Size.small}
        disabled={!leftActive}
        onClick={moveToLeft}
        icon="keyboard_arrow_left"
      >
        {leftArrowText}
      </Button>
      <Button
        type="primary"
        size={Size.small}
        disabled={!rightActive}
        onClick={moveToRight}
        icon="keyboard_arrow_right"
      >
        {rightArrowText}
      </Button>
    </div>
  );
};

export default Operation;
