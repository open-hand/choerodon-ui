import React, { Component, FormEventHandler } from 'react';
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

export default class Operation extends Component<TransferOperationProps, any> {
  render() {
    const {
      moveToLeft = noop,
      moveToRight = noop,
      leftArrowText = '',
      rightArrowText = '',
      leftActive,
      rightActive,
      className,
    } = this.props;
    return (
      <div className={className}>
        <Button
          type="primary"
          size={Size.small}
          disabled={!leftActive}
          onClick={moveToLeft}
          icon="left"
        >
          {leftArrowText}
        </Button>
        <Button
          type="primary"
          size={Size.small}
          disabled={!rightActive}
          onClick={moveToRight}
          icon="right"
        >
          {rightArrowText}
        </Button>
      </div>
    );
  }
}
