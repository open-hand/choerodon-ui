import React, { CSSProperties, Key, PureComponent, ReactNode } from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import classNames from 'classnames';
import { NotificationManager } from 'choerodon-ui/shared';
import noop from 'lodash/noop';
import debounce from 'lodash/debounce';
import scrollIntoView from 'scroll-into-view-if-needed';
import { NotificationInterface } from 'choerodon-ui/shared/notification-manager';
import Animate from '../animate';
import Notice, { NoticeProps } from './Notice';
import { getRuntimeLocale } from '../locale-provider/utils';
import EventManager from '../_util/EventManager';
import { getStyle } from '../rc-components/util/Dom/css';

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
  totalHeight: number;
  offset: number;
}

export default class Notification extends PureComponent<NotificationProps, NotificationState> {
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

  scrollEvent?: any;

  isRemove: boolean;

  state: NotificationState = {
    notices: [],
    scrollHeight: 'auto',
    totalHeight: 0,
    offset: 0,
  };

  dispose() {
    const { scrollEvent } = this;
    if (scrollEvent) {
      scrollEvent.clear();
    }
  }

  componentWillUnmount() {
    this.dispose();
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
    if (foldCount) {
      const { scrollRef } = this;
      if (scrollRef) {
        const childSpan = scrollRef.firstChild;
        if (!childSpan) return;
        const childNodes = childSpan.childNodes;
        const lastNode = childNodes[childNodes.length - 1] as HTMLDivElement;

        if (childNodes.length > foldCount && notices.length > foldCount) {
          let totalHeight = 0;
          for (let i = 0; i < childNodes.length; i += 1) {
            const element = childNodes[i] as HTMLDivElement;
            totalHeight += element.offsetHeight + getStyle(element, 'margin-bottom');
          }
          const scrollHeight = (totalHeight / childNodes.length) * (foldCount + 0.5);
          this.setState(
            {
              scrollHeight,
              totalHeight,
            }, () => {
              if (!this.isRemove) {
                scrollIntoView(lastNode, {
                  block: 'center',
                  behavior: 'smooth',
                  scrollMode: 'if-needed',
                  boundary: scrollRef,
                });
              }
            });
        } else {
          this.setState({
            scrollHeight: 'auto',
          });
        }
      }
    }
  };

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
        this.isRemove = false;
        return {
          ...previousState,
          notices: notices.concat(notice),
        };
      }
    });
  }

  remove(key: Key) {
    this.setState(previousState => {
      this.isRemove = true;
      const notices = previousState.notices.filter(notice => notice.key !== key);
      return {
        notices,
      };
    });
  }

  clearNotices = (): void => {
    this.setState({
      notices: [],
    });
  };

  handleNoticeClose = (eventKey): void => {
    const { notices } = this.state;
    const notice = notices.find(({ key }) => key === eventKey);
    this.remove(eventKey);
    if (notice) {
      const { onClose = noop } = notice;
      onClose(eventKey);
    }
  };

  saveScrollRef = (dom) => {
    this.scrollRef = dom;
    if (dom) {
      const debouncedResize = debounce((e) => {
        this.setState({
          offset: e.target.scrollTop,
        });
      }, 200);
      this.scrollEvent = new EventManager(dom).addEventListener('scroll', debouncedResize);
    } else {
      this.dispose();
    }
  };

  render() {
    const { notices, scrollHeight, offset, totalHeight } = this.state;
    const { contentClassName, prefixCls, closeIcon, className, style, foldCount } = this.props;
    const noticeNodes = notices.map((notice) => (
      <Notice
        prefixCls={prefixCls}
        contentClassName={contentClassName}
        {...notice}
        onClose={this.handleNoticeClose}
        closeIcon={closeIcon}
        key={notice.key}
        eventKey={notice.key}
        foldable={!!foldCount}
        offset={offset}
        scrollHeight={scrollHeight}
        totalHeight={totalHeight}
      />
    ));
    const cls = classNames(`${prefixCls}`, className, [{
      [`${prefixCls}-before-shadow`]: !!foldCount && notices.length > foldCount && offset > 0,
      [`${prefixCls}-after-shadow`]:
      foldCount && notices.length > foldCount &&
      totalHeight - (typeof scrollHeight === 'number' ? scrollHeight : 0) - offset > 15,
    }]);

    const scrollCls = classNames({
      [`${prefixCls}-scroll`]: !!foldCount && scrollHeight !== 'auto',
    });

    const runtimeLocale = getRuntimeLocale().Notification!;

    return (
      <div className={cls} style={style}>
        <div
          className={scrollCls}
          style={foldCount ? {
            height: scrollHeight,
          } : undefined}
          ref={foldCount ? this.saveScrollRef : undefined}
        >
          <Animate onEnd={this.onAnimateEnd} transitionName={this.getTransitionName()}>
            {noticeNodes}
          </Animate>
        </div>

        {foldCount && notices.length > foldCount && (
          <div className={`${prefixCls}-alert`}>
            <div className={`${prefixCls}-alert-message`}>{`${runtimeLocale.total} ${notices.length} ${runtimeLocale.message}`}</div>
            <div className={`${prefixCls}-alert-close`} onClick={this.clearNotices}>{`${runtimeLocale.closeAll}`}</div>
          </div>
        )}
      </div>
    );
  }
}
