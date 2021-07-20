import React, { FunctionComponent, memo, useCallback } from 'react';
import noop from 'lodash/noop';
import Icon from '../icon';
import { stopEvent, stopPropagation } from '../_util/EventManager';

export interface CloseButtonProps {
  value: any;
  index: number;
  onClose?: (e, value: any, index: number) => void;
}

const CloseButton: FunctionComponent<CloseButtonProps> = memo((props) => {
  const { onClose = noop, value, index } = props;
  const handleClick = useCallback((e) => {
    stopEvent(e);
    onClose(e, value, index);
  }, [onClose, value, index]);

  return (
    <Icon type="cancel" onClick={handleClick} onFocus={stopPropagation} onMouseDown={stopEvent} tabIndex={-1} />
  );
});

CloseButton.displayName = 'CloseButton';

export default CloseButton;
