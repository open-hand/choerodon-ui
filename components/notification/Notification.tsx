import React, { CSSProperties, Key, PureComponent, ReactNode } from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { NotificationManager } from 'choerodon-ui/shared';
import debounce from 'lodash/debounce';
import scrollIntoView from 'scroll-into-view-if-needed';
import { NotificationInterface } from 'choerodon-ui/shared/notification-manager';
import Animate from '../animate';
import createChainedFunction from '../rc-components/util/createChainedFunction';
import Notice, { NoticeProps } from './Notice';
import Alert from '../alert';
import { LocaleNotification } from '../locale-provider'
import EventManager from '../_util/EventManager';
import { getStyle } from '../rc-components/util/Dom/css';
import enLocale from '../../site/theme/en-US';
import cnLocale from '../../site/theme/zh-CN';

export function newNotificationInstance(properties: NotificationProps & { getContainer?: (() => HTMLElement) | undefined }, callback: (api: NotificationInterface) => void) {
  const { getContainer, ...props } = properties || {};
  const div = document.createElement('div');
  if (getContainer) {
    const root = getContainer();
    root.appendChild(div);
  } else {
    document.body.appendChild(div);
  }
  let called = false;

  function ref(notification) {
    if (called) {
      return;
    }
    called = true;
    callback({
      notice(noticeProps) {
        notification.add(noticeProps);
      },
      removeNotice(key) {
        notification.remove(key);
      },
      destroy() {
        unmountComponentAtNode(div);
        const { parentNode } = div;
        if (parentNode) {
          parentNode.removeChild(div);
        }
      },
    });
  }

  render(<Notification {...props} ref={ref} />, div);
}

export interface NotificationProps {
  prefixCls?: string;
  className?: string;
  transitionName?: string;
  animation?: string;
  style?: CSSProperties;
  contentClassName?: string;
  closeIcon?: ReactNode;
  maxCount?: number;
  foldCount?: number;
}

export interface NotificationState {
  notices: NoticeProps[];
  scrollHeight: string | number;
  offset: number;
}

export default class Notification extends PureComponent<NotificationProps, NotificationState> {
  static propTypes = {
    prefixCls: PropTypes.string,
    transitionName: PropTypes.string,
    animation: PropTypes.string,
    style: PropTypes.object,
    foldCount: PropTypes.number,
    closeIcon: PropTypes.node,
    contentClassName: PropTypes.string,
  };

  static defaultProps = {
    prefixCls: 'c7n-notification',
    animation: 'fade',
    style: {
      top: 65,
      left: '50%',
    },
  };

  static newInstance = newNotificationInstance;

  scrollRef: HTMLDivElement | null = null;

  scrollEvent: any;

  noticesHeight: number;

  locale: LocaleNotification;

  constructor(props) {
    super(props);
    const { pathname } = location;
    const appLocale = /-cn\/?$/.test(pathname) ? cnLocale : enLocale;
    this.locale = appLocale.componentsLocale.Notification
  }

  state: NotificationState = {
    notices: [],
    scrollHeight: 'auto',
    offset: 0,
  };
  

  componentDidMount() {
    if (this.scrollRef) {
      const debouncedResize = debounce((e) => {
        this.setState({
          offset: e.target.scrollTop,
        });
      }, 200)
      this.scrollEvent = new EventManager(this.scrollRef);
      this.scrollEvent.addEventListener('scroll', debouncedResize);
    }
  }

  componentWillUnmount() {
    if (this.scrollEvent) {
      this.scrollEvent.removeEventListener('scroll');
    }
  }

  getTransitionName() {
    const { transitionName, animation, prefixCls } = this.props;
    if (!transitionName && animation) {
      return `${prefixCls}-${animation}`;
    }
    return transitionName;
  }

  onAnimateEnd = () => {
    const { notices } = this.state;
    const { foldCount } = this.props;
    if (this.scrollRef && !!foldCount) {
      const childSpan = this.scrollRef.firstChild;
      if (!childSpan) return
      const childNodes = childSpan.childNodes;
      const lastNode = childNodes[childNodes.length - 1] as HTMLDivElement;

      if (childNodes.length > foldCount && notices.length > foldCount) {
        let totalHeight = 0;
        for (let i = 0; i < childNodes.length; i += 1) {
          const element = childNodes[i] as HTMLDivElement;
          totalHeight += element.offsetHeight + getStyle(element, 'margin-bottom');
        }
        this.noticesHeight = totalHeight;
        const scrollHeight = (totalHeight / childNodes.length) * (foldCount + 0.5);
        this.setState(
          {
            scrollHeight,
          },
          () => {
            scrollIntoView(lastNode, {
              block: 'center',
              behavior: 'smooth',
              scrollMode: 'if-needed',
              boundary: this.scrollRef,
            });
          },
        );
      }
    }
  }

  add(notice: NoticeProps) {
    if (!notice.key) {
      notice.key = NotificationManager.getUuid();
    }
    const { key } = notice;
    const { maxCount } = this.props;
    this.setState(previousState => {
      const notices = previousState.notices;
      if (!notices.filter(v => v.key === key).length) {
        if (maxCount && notices && notices.length > 0 && notices.length >= maxCount) {
          notices.shift();
        }
        return {
          ...previousState,
          notices: notices.concat(notice),
        };
      }
    });
  }

  remove(key: Key) {
    this.setState(previousState => {
      return {
        notices: previousState.notices.filter(notice => notice.key !== key),
      };
    });
  }

  clearNotices = (): void => {
    this.setState({
      notices: [],
      scrollHeight: 'auto',
    });
  }

  render() {
    const { notices, scrollHeight, offset } = this.state;
    const { contentClassName, prefixCls, closeIcon, className, style, foldCount } = this.props;
    const noticeNodes = notices.map(notice => {
      const { key } = notice;
      const onClose = createChainedFunction(this.remove.bind(this, key), notice.onClose);
      return (
        <Notice
          prefixCls={prefixCls}
          contentClassName={contentClassName}
          {...notice}
          onClose={onClose}
          closeIcon={closeIcon}
          key={key}
          foldable={!!foldCount}
          offset={offset}
          scrollHeight={scrollHeight}
        />
      );
    });
    const cls = classNames(`${prefixCls}`, className, [{
      [`${prefixCls}-fold`]: !!foldCount,
      [`${prefixCls}-before-shadow`]: !!foldCount && notices.length > foldCount && offset > 0,
      [`${prefixCls}-after-shadow`]:
        foldCount && notices.length > foldCount &&
        Math.abs(this.noticesHeight - (typeof scrollHeight === 'number' ? scrollHeight : 0) - offset) > 1,
    }]);

    const scrollCls = classNames({
      [`${prefixCls}-scroll`]: !!foldCount,
    })

    return (
      <div className={classNames(cls)} style={style}>
        <div
          className={classNames(scrollCls)}
          style={{
            height: scrollHeight,
          }}
          ref={dom => {
            this.scrollRef = dom;
          }}
        >
          <Animate onEnd={this.onAnimateEnd} transitionName={this.getTransitionName()}>
            {noticeNodes}
          </Animate>
        </div>

        {foldCount && notices.length > foldCount && (
          <Alert
            className={`${prefixCls}-alert`}
            message={`${this.locale.total} ${notices.length} ${this.locale.message}`}
            closeText={`${this.locale.closeAll}`}
            onClose={this.clearNotices}
          />
        )}
      </div>
    );
  }
}
