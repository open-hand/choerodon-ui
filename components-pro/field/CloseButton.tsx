import React, { PureComponent } from 'react';
import Icon from '../icon';
import { stopEvent, stopPropagation } from '../_util/EventManager';

export interface CloseButtonProps {
  value: any;
  index: number;
  onClose: (e, value: any, index: number) => void;
}

export default class CloseButton extends PureComponent<CloseButtonProps> {
  handleClick = (e) => {
    stopEvent(e);
    const { onClose, value, index } = this.props;
    onClose(e, value, index);
  };

  render() {
    return (
      <Icon type="cancel" onClick={this.handleClick} onFocus={stopPropagation} onMouseDown={stopPropagation} tabIndex={-1} />
    );
  }
}
