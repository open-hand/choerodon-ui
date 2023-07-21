import React, { CSSProperties, FunctionComponent, Key, memo, ReactNode, useCallback, useEffect, useRef } from 'react';
import classNames from 'classnames';
import noop from 'lodash/noop';
import Icon from '../icon';

export interface NoticeProps {
  key?: Key;
  eventKey?: Key;
  onClose?: (eventKey?: Key) => void;
  duration?: number;
  prefixCls?: string;
  className?: string;
  contentClassName?: string;
  closable?: boolean;
  style?: CSSProperties
  children?: ReactNode;
  closeIcon?: ReactNode;
  foldable?: Boolean;
  offset?: number;
  scrollHeight?: string | number;
  totalHeight?: number;
}
class ErrorBoundary extends React.Component<{ children: ReactNode; }, { hasError: boolean; }> {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    const { children } = this.props;
    const { hasError } = this.state;
    return !hasError ? children : null;
  }
}


const Notice: FunctionComponent<NoticeProps> = function Notice(props) {
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
    foldable,
    offset = 0,
    scrollHeight = 0,
    eventKey,
  } = props;

  const noticeRef = useRef<HTMLDivElement | null>(null);

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
    onClose(eventKey);
  }, [onClose, eventKey]);

  const startCloseTimer = useCallback(() => {
    if (duration) {
      closeTimer.current = window.setTimeout(close, duration * 1000);
    }
  }, [close]);

  useEffect(() => {
    startCloseTimer();
    return clearCloseTimer;
  }, [startCloseTimer]);

  let hideShadow: Boolean = false;
  const noticeRefCurrnet = noticeRef.current;
  if (noticeRefCurrnet && foldable && typeof scrollHeight === 'number') {
    const bottomH =
      scrollHeight + offset - noticeRefCurrnet.offsetTop - noticeRefCurrnet.offsetHeight;
    if (noticeRefCurrnet.offsetTop < offset || bottomH < 0) {
      hideShadow = true;
    }
  }
  const componentClass = `${prefixCls}-notice`;
  const classString = classNames(componentClass, className, {
    [`${componentClass}-closable`]: closable,
    [`${componentClass}-hide-shadow`]: hideShadow,
  });
  return (
    <ErrorBoundary>
      <div
        className={classString}
        style={style}
        onMouseEnter={clearCloseTimer}
        onMouseLeave={startCloseTimer}
        ref={noticeRef}
      >
        <div className={classNames(`${componentClass}-content`, contentClassName)}>
          {children}
        </div>
        {
          closable && (
            <a tabIndex={0} onClick={!hideShadow ? close : undefined} className={`${componentClass}-close`}>
              {closeIcon || <span className={`${componentClass}-close-x`} />}
            </a>
          )
        }
      </div>
    </ErrorBoundary>
  );
};

Notice.displayName = 'Notice';

const MemoNotice: typeof Notice = memo(Notice);

MemoNotice.defaultProps = {
  duration: 1.5,
  style: {
    right: '50%',
  },
};

export default MemoNotice;
