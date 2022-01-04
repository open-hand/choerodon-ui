import React, { FormEventHandler, ReactNode } from 'react';
import noop from 'lodash/noop';
import classNames from 'classnames';
import Button from '../button';
import { ButtonColor } from '../button/enum';

export interface TransferSortProps {
  className?: string;
  moveToUp?: FormEventHandler<any>;
  moveToDown?: FormEventHandler<any>;
  upArrowText?: string | ReactNode;
  downArrowText?: string | ReactNode;
  upActive?: boolean;
  downActive?: boolean;
  multiple?: boolean;
}

export default function TransferSort(props: TransferSortProps) {
  const {
    moveToUp = noop,
    moveToDown = noop,
    upArrowText = '',
    downArrowText = '',
    upActive,
    downActive,
    className,
    multiple,
  } = props;
  if (multiple) {
    const customUpClass = classNames(`${className}-custom-up-active`, {
      [`${className}-custom-up-disable`]: !upActive,
    });
    const customDownClass = classNames(`${className}-custom-down-active`, {
      [`${className}-custom-down-disable`]: !downActive,
    });
    return (
      <div className={className}>
        {typeof upArrowText === 'string' ? (
          <Button
            color={upActive ? ButtonColor.primary : ButtonColor.default}
            disabled={!upActive}
            onClick={moveToUp}
            icon='expand_less'
          >
            {upArrowText}
          </Button>
        ) : (
          <div className={customUpClass} onClick={upActive ? moveToUp : undefined}>
            {upArrowText}
          </div>
        )}

        {typeof downArrowText === 'string' ? (
          <Button
            color={downActive ? ButtonColor.primary : ButtonColor.default}
            disabled={!downActive}
            onClick={moveToDown}
            icon='expand_more'
          >
            {downArrowText}
          </Button>
        ) : (
          <div className={customDownClass} onClick={downActive ? moveToDown : undefined}>
            {downArrowText}
          </div>
        )}
      </div>
    );
  }
  return null;
}
