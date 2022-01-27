import React from 'react';
import Touchable from 'rmc-feedback';

const InputHandler = function InputHandler(props) {
  const {
    prefixCls,
    disabled,
    onTouchStart,
    onTouchEnd,
    onMouseDown,
    onMouseUp,
    onMouseLeave,
    ...otherProps
  } = props;
  return (
    <Touchable
      disabled={disabled}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
      activeClassName={`${prefixCls}-handler-active`}
    >
      <span {...otherProps} />
    </Touchable>
  );
};

InputHandler.displayName = 'RcInputHandler';

export default InputHandler;
