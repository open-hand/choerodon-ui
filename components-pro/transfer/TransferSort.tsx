import React, { FormEventHandler, ReactNode } from 'react';
import noop from 'lodash/noop';
import Button from '../button';
import { Size } from '../core/enum';
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
    const upActiveCursor = {
      cursor: !upActive ? 'no-drop' : 'pointer',
    };
    const downActiveCursor = {
      cursor: !downActive ? 'no-drop' : 'pointer',
    };
    return (
      <div className={className}>
        {typeof upArrowText === 'string' ? (
          <Button
            color={ButtonColor.primary}
            size={Size.small}
            disabled={!upActive}
            onClick={moveToUp}
            icon="expand_less"
          >
            {upArrowText}
          </Button>
        ) : (
          <div onClick={upActive ? moveToUp : undefined} style={upActiveCursor}>
            {upArrowText}
          </div>
        )}

        {typeof downArrowText === 'string' ? (
          <Button
            color={ButtonColor.primary}
            size={Size.small}
            disabled={!downActive}
            onClick={moveToDown}
            icon="expand_more"
          >
            {downArrowText}
          </Button>
        ) : (
          <div onClick={downActive ? moveToDown : undefined} style={downActiveCursor}>
            {downArrowText}
          </div>
        )}
      </div>
    );
  }
  return null;
}
