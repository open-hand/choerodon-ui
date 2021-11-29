import React, { CSSProperties, FunctionComponent, Key, memo, ReactNode, useCallback, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import noop from 'lodash/noop';
import Icon from 'choerodon-ui/lib/icon';

export interface NoticeProps {
  key?: Key;
  onClose?: () => void;
  duration?: number;
  prefixCls?: string;
  className?: string;
  contentClassName?: string;
  closable?: boolean;
  style?: CSSProperties
  children?: ReactNode;
  closeIcon?: ReactNode;
}


const Notice: FunctionComponent<NoticeProps> = function Notic(props) {
  const {
    contentClassName,
    prefixCls,
    className,
    closable,
    children,
    closeIcon = <Icon className={`${prefixCls}-close-icon`} type="close" />,
    style,
    duration,
    onClose = noop,
  } = props;

  const closeTimer = useRef<number | null>(null);

  const clearCloseTimer = useCallback(() => {
    const { current } = closeTimer;
    if (current) {
      window.clearTimeout(current);
      closeTimer.current = null;
    }
  }, []);

  const close = useCallback(() => {
    clearCloseTimer();
    onClose();
  }, [onClose]);

  const startCloseTimer = useCallback(() => {
    if (duration) {
      closeTimer.current = window.setTimeout(close, duration * 1000);
    }
  }, [close]);

  useEffect(() => {
    startCloseTimer();
    return clearCloseTimer;
  }, [startCloseTimer]);

  const componentClass = `${prefixCls}-notice`;
  const classString = classNames(componentClass, className, {
    [`${componentClass}-closable`]: closable,
  });
  return (
    <div
      className={classString}
      style={style}
      onMouseEnter={clearCloseTimer}
      onMouseLeave={startCloseTimer}
    >
      <div className={classNames(`${componentClass}-content`, contentClassName)}>{children}</div>
      {
        closable && (
          <a tabIndex={0} onClick={close} className={`${componentClass}-close`}>
            {closeIcon || <span className={`${componentClass}-close-x`} />}
          </a>
        )
      }
    </div>
  );
};

Notice.propTypes = {
  duration: PropTypes.number,
  onClose: PropTypes.func,
  children: PropTypes.any,
  closeIcon: PropTypes.node,
  prefixCls: PropTypes.string,
  className: PropTypes.string,
  contentClassName: PropTypes.string,
  closable: PropTypes.bool,
  style: PropTypes.object,
};

Notice.defaultProps = {
  duration: 1.5,
  style: {
    right: '50%',
  },
};

Notice.displayName = 'Notice';

export default memo(Notice);
