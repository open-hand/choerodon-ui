import React, { FormEventHandler } from 'react';
import noop from 'lodash/noop';
import Button from '../button';
import { Size } from '../core/enum';
import { ButtonColor } from '../button/enum';

export interface TransferOperationProps {
  className?: string;
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
    leftActive,
    rightActive,
    className,
    multiple,
  } = props;
  if (multiple) {
    return (
      <div className={className}>
        <Button
          color={ButtonColor.primary}
          size={Size.small}
          disabled={!leftActive}
          onClick={moveToLeft}
          icon="navigate_before"
        />
        <Button
          color={ButtonColor.primary}
          size={Size.small}
          disabled={!rightActive}
          onClick={moveToRight}
          icon="navigate_next"
        />
      </div>
    );
  }
  return null;
}
