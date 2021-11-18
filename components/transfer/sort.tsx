import React, { FormEventHandler, FunctionComponent, ReactNode } from 'react';
import noop from 'lodash/noop';
import Button from '../button';
import { Size } from '../_util/enum';

export interface TransferSortProps {
  className?: string;
  upArrowText?: string | ReactNode;
  downArrowText?: string | ReactNode;
  moveToUp?: FormEventHandler<any>;
  moveToDown?: FormEventHandler<any>;
  upActive?: boolean;
  downActive?: boolean;
}

const Sort: FunctionComponent<TransferSortProps> = props => {
  const {
    moveToUp = noop,
    moveToDown = noop,
    upArrowText = '',
    downArrowText = '',
    upActive,
    downActive,
    className,
  } = props;

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
          type="primary"
          size={Size.small}
          disabled={!upActive}
          onClick={moveToUp}
          icon="keyboard_arrow_up"
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
          type="primary"
          size={Size.small}
          disabled={!downActive}
          onClick={moveToDown}
          icon="keyboard_arrow_down"
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
};

export default Sort;
