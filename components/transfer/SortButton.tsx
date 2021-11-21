import React, { FormEventHandler, FunctionComponent, ReactNode } from 'react';
import noop from 'lodash/noop';
import classNames from 'classnames';
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

const SortButton: FunctionComponent<TransferSortProps> = props => {
  const {
    moveToUp = noop,
    moveToDown = noop,
    upArrowText = '',
    downArrowText = '',
    upActive,
    downActive,
    className,
  } = props;

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
          type="primary"
          size={Size.small}
          disabled={!upActive}
          onClick={moveToUp}
          icon="keyboard_arrow_up"
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
          type="primary"
          size={Size.small}
          disabled={!downActive}
          onClick={moveToDown}
          icon="keyboard_arrow_down"
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
};

export default SortButton;
