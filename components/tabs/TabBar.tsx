import React, {
  CSSProperties,
  FunctionComponent,
  HTMLAttributes,
  Key,
  KeyboardEventHandler,
  MouseEvent,
  MouseEventHandler,
  PropsWithoutRef,
  ReactElement,
  ReactNode,
  RefAttributes,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import classnames from 'classnames';
import isNil from 'lodash/isNil';
import noop from 'lodash/noop';
import debounce from 'lodash/debounce';
import { getDataAttr, getLeft, getTop, isTransformSupported, isVertical, setTransform } from './utils';
import warning from '../_util/warning';
import Ripple, { RippleProps } from '../ripple';
import TabBarInner, { TabBarInnerProps } from './TabBarInner';
import EventManager from '../_util/EventManager';
import { TabsPosition, TabsType } from './enum';
import Icon from '../icon';
import { TabPaneProps } from './TabPane';
import { GroupPanelMap } from './Tabs';
import Menu, { MenuProps, SelectParam } from '../menu';
import MenuItem from '../menu/MenuItem';
import Badge from '../badge';

export interface TabBarProps {
  inkBarAnimated?: boolean | undefined;
  scrollAnimated?: boolean | undefined;
  extraContent?: ReactNode;
  onKeyDown?: KeyboardEventHandler<HTMLDivElement> | undefined;
  onTabClick?: ((key: string) => void) | undefined;
  onGroupSelect?: (param: SelectParam) => void;
  onPrevClick?: MouseEventHandler<HTMLSpanElement> | undefined;
  onNextClick?: MouseEventHandler<HTMLSpanElement> | undefined;
  style?: CSSProperties | undefined;
  styles?: { inkBar?: CSSProperties } | undefined;
  tabBarGutter?: number | undefined;
  tabBarPosition?: TabsPosition | undefined;
  groupsMap: Map<string, GroupPanelMap>;
  panelsMap: Map<string, ReactElement<TabPaneProps>>;
  activeKey?: string | undefined;
  activeGroupKey?: string | undefined;
  className?: string | undefined;
  prefixCls?: string | undefined;
  type?: TabsType | undefined;
  onRemoveTab: (targetKey: Key | null, e: MouseEvent<HTMLElement>) => void;
}

const TabBar: FunctionComponent<TabBarProps> = function TabBar(props) {
  const {
    prefixCls, scrollAnimated, panelsMap, groupsMap, activeKey, activeGroupKey, className, style, styles, extraContent,
    tabBarGutter, tabBarPosition, onKeyDown, onTabClick = noop, onPrevClick = noop, onNextClick = noop, onGroupSelect = noop,
    inkBarAnimated, type, onRemoveTab, ...restProps
  } = props;
  const resizeEvent = useMemo(() => new EventManager(typeof window === 'undefined' ? undefined : window), []);
  const lastNextPrevShownRef = useRef<boolean | undefined>();
  const offsetRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const navWrapRef = useRef<HTMLDivElement | null>(null);
  const navRef = useRef<HTMLDivElement | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const activeTabRef = useRef<HTMLDivElement | null>(null);
  const inkBarRef = useRef<HTMLDivElement | null>(null);
  const [next, setNext] = useState<boolean>(false);
  const [prev, setPrev] = useState<boolean>(false);
  const [prevActiveKey, setActiveKey] = useState<string | undefined>(activeKey);
  const getTabs = (): ReactElement<RippleProps>[] => {
    return [...panelsMap.entries()].reduce<ReactElement<RippleProps>[]>((rst, [key, child], index, list) => {
      const { disabled, tab, closable = true, count, overflowCount } = child.props;
      const classes = [`${prefixCls}-tab`];
      const tabProps: PropsWithoutRef<TabBarInnerProps> & RefAttributes<HTMLDivElement> = {
        tabKey: key,
        role: 'tab',
        'aria-disabled': 'false',
        'aria-selected': 'false',
        style: {
          marginRight: tabBarGutter && index === list.length - 1 ? 0 : tabBarGutter!,
        },
      };
      if (disabled) {
        classes.push(`${prefixCls}-tab-disabled`);
        tabProps['aria-disabled'] = 'true';
      } else {
        tabProps.onTabClick = onTabClick;
      }
      if (activeKey === key) {
        classes.push(`${prefixCls}-tab-active`);
        tabProps.ref = activeTabRef;
        tabProps['aria-selected'] = 'true';
      }
      tabProps.className = classes.join(' ');
      warning('tab' in child.props, 'There must be `tab` property on children of Tabs.');
      const displayCount = (count as number) > (overflowCount as number) ? `${overflowCount}+` : count;
      const title = (
        <>
          {tab}
          {!isNil(displayCount) && <span className={`${prefixCls}-tab-count`}>{displayCount}</span>}
        </>
      );
      rst.push(
        <Ripple disabled={disabled} key={key}>
          <TabBarInner {...tabProps}>
            {
              type === TabsType['editable-card'] ? (
                <div className={closable ? undefined : `${prefixCls}-tab-unclosable`}>
                  {title}
                  {closable && <Icon type="close" onClick={e => onRemoveTab(key, e)} />}
                </div>
              ) : title
            }
          </TabBarInner>
        </Ripple>,
      );
      return rst;
    }, []);
  };
  const getContent = (contents: ReactElement<HTMLAttributes<HTMLDivElement>>): ReactElement<HTMLAttributes<HTMLDivElement>>[] => {
    if (extraContent) {
      return [
        contents,
        <div key="extra" className={`${prefixCls}-extra-content`}>
          {extraContent}
        </div>,
      ];
    }
    return [contents];
  };

  const getGroupNode = (): ReactElement<MenuProps> | undefined => {
    if (groupsMap.size) {
      return (
        <Menu
          prefixCls={`${prefixCls}-group`}
          selectedKeys={activeGroupKey ? [activeGroupKey] : []}
          onSelect={onGroupSelect}
          mode={isVertical(tabBarPosition) ? 'vertical' : 'horizontal'}
        >
          {
            [...groupsMap.entries()].map(([key, { group: { props: { tab, disabled, dot } } }]) => (
              <MenuItem key={key} disabled={disabled}>
                <Badge dot={dot}>
                  {tab}
                </Badge>
              </MenuItem>
            ))
          }
        </Menu>
      );
    }
    return undefined;
  };

  const getInkBarNode = (): ReactElement<HTMLAttributes<HTMLDivElement>> => {
    const inkBarClassName = `${prefixCls}-ink-bar`;
    const classes = classnames(inkBarClassName, inkBarAnimated ?
      `${inkBarClassName}-animated` :
      `${inkBarClassName}-no-animated`);
    return (
      <div
        style={styles && styles.inkBar}
        className={classes}
        key="inkBar"
        ref={inkBarRef}
      />
    );
  };

  const getOffsetWH = useCallback((node: HTMLDivElement) => {
    return node[isVertical(tabBarPosition) ? 'offsetHeight' : 'offsetWidth'];
  }, [tabBarPosition]);

  const getScrollWH = useCallback((node: HTMLDivElement) => {
    return node[isVertical(tabBarPosition) ? 'scrollHeight' : 'scrollWidth'];
  }, [tabBarPosition]);

  const getOffsetLT = useCallback((node: HTMLDivElement) => {
    return node.getBoundingClientRect()[isVertical(tabBarPosition) ? 'top' : 'left'];
  }, [tabBarPosition]);

  const setOffset = useCallback((offset: number, callback?: Function) => {
    const nav = navRef.current;
    if (nav) {
      const target = Math.min(0, offset);
      if (offsetRef.current !== target) {
        offsetRef.current = target;
        const navOffset: { name?: string, value?: string } = {};
        const navStyle = nav.style;
        const transformSupported = isTransformSupported(navStyle);
        if (isVertical(tabBarPosition)) {
          if (transformSupported) {
            navOffset.value = `translate3d(0,${target}px,0)`;
          } else {
            navOffset.name = 'top';
            navOffset.value = `${target}px`;
          }
        } else if (transformSupported) {
          navOffset.value = `translate3d(${target}px,0,0)`;
        } else {
          navOffset.name = 'left';
          navOffset.value = `${target}px`;
        }
        if (transformSupported) {
          setTransform(navStyle, navOffset.value);
        } else if (navOffset.name) {
          navStyle[navOffset.name] = navOffset.value;
        }
        if (callback) {
          callback();
        }
      }
    }
  }, [offsetRef, navRef, tabBarPosition]);

  const setNextPrev = useCallback(() => {
    const navNode = navRef.current;
    const container = containerRef.current;
    const navWrap = navWrapRef.current;
    if (navNode && container && navWrap) {
      const navNodeWH = getScrollWH(navNode);
      const containerWH = getOffsetWH(container);
      const navWrapNodeWH = getOffsetWH(navWrap);
      let offset = offsetRef.current;
      // 当容器小于tab的时候使用最小值才可以防止回弹问题。
      const navNodeWHValue = Math.min(containerWH, navWrapNodeWH);
      const minOffset = navNodeWHValue - navNodeWH; // -165
      let $next = next;
      let $prev = prev;
      if (minOffset >= 0) {
        $next = false;
        setOffset(0);
        offset = 0;
      } else if (minOffset < offset) {
        $next = true;
      } else {
        $next = false;
        // Test with container offset which is stable
        // and set the offset of the nav wrap node
        const realOffset = navWrapNodeWH - navNodeWH;
        setOffset(realOffset);
        offset = realOffset;
      }

      if (offset < 0) {
        $prev = true;
      } else {
        $prev = false;
      }

      if (prev !== $prev) {
        setPrev($prev);
      }
      if (next !== $next) {
        setNext($next);
      }
      return {
        next: $next,
        prev: $prev,
      };
    }
  }, [next, prev, navRef, containerRef, navWrapRef, offsetRef, getScrollWH, getOffsetWH, setOffset]);

  const isNextPrevShown = useCallback((state?: { prev: boolean, next: boolean }): boolean => {
    if (state) {
      return state.next || state.prev;
    }
    return next || prev;
  }, [next, prev]);

  const toPrev = useCallback((e) => {
    onPrevClick(e);
    const navWrapNode = navWrapRef.current;
    if (navWrapNode) {
      const navWrapNodeWH = getOffsetWH(navWrapNode);
      setOffset(offsetRef.current + navWrapNodeWH, setNextPrev);
    }
  }, [getOffsetWH, setOffset, navWrapRef, onPrevClick, setNextPrev]);

  const toNext = useCallback((e) => {
    onNextClick(e);
    const navWrapNode = navWrapRef.current;
    if (navWrapNode) {
      const navWrapNodeWH = getOffsetWH(navWrapNode);
      const offset = offsetRef.current;
      setOffset(offset - navWrapNodeWH, setNextPrev);
    }
  }, [getOffsetWH, setOffset, navWrapRef, onNextClick, setNextPrev]);

  const scrollToActiveTab = useCallback((e?: { target?: HTMLElement, currentTarget?: HTMLElement }) => {
    const activeTab = activeTabRef.current;
    const navWrap = navWrapRef.current;
    if (e && e.target !== e.currentTarget || !activeTab || !navWrap) {
      return;
    }

    // when not scrollable or enter scrollable first time, don't emit scrolling
    const needToSroll = isNextPrevShown() && lastNextPrevShownRef.current;
    lastNextPrevShownRef.current = isNextPrevShown();
    if (!needToSroll) {
      return;
    }

    const activeTabWH = getScrollWH(activeTab);
    const navWrapNodeWH = getOffsetWH(navWrap);
    let offset = offsetRef.current;
    const wrapOffset = getOffsetLT(navWrap);
    const activeTabOffset = getOffsetLT(activeTab);
    if (wrapOffset > activeTabOffset) {
      offset += (wrapOffset - activeTabOffset);
      setOffset(offset, setNextPrev);
    } else if ((wrapOffset + navWrapNodeWH) < (activeTabOffset + activeTabWH)) {
      offset -= (activeTabOffset + activeTabWH) - (wrapOffset + navWrapNodeWH);
      setOffset(offset, setNextPrev);
    }
  }, [activeTabRef, navWrapRef, lastNextPrevShownRef, getScrollWH, getOffsetWH, getOffsetLT, setOffset, setNextPrev, isNextPrevShown]);
  const prevTransitionEnd = useCallback((e) => {
    if (e.propertyName !== 'opacity') {
      return;
    }
    const { current } = containerRef;
    if (current) {
      scrollToActiveTab({
        target: current,
        currentTarget: current,
      });
    }
  }, [scrollToActiveTab, containerRef]);
  const getScrollBarNode = (content: [ReactElement<HTMLAttributes<HTMLDivElement>>, ReactElement<RippleProps>[]]): ReactElement<HTMLAttributes<HTMLDivElement>> => {
    const showNextPrev = prev || next;

    const prevButton = (
      <span
        onClick={prev ? toPrev : undefined}
        unselectable="on"
        className={classnames(`${prefixCls}-tab-prev`, {
          [`${prefixCls}-tab-btn-disabled`]: !prev,
          [`${prefixCls}-tab-arrow-show`]: showNextPrev,
        })}
        onTransitionEnd={prevTransitionEnd}
      >
        <span className={`${prefixCls}-tab-prev-icon`} />
      </span>
    );

    const nextButton = (
      <span
        onClick={next ? toNext : undefined}
        unselectable="on"
        className={classnames({
          [`${prefixCls}-tab-next`]: 1,
          [`${prefixCls}-tab-btn-disabled`]: !next,
          [`${prefixCls}-tab-arrow-show`]: showNextPrev,
        })}
      >
        <span className={`${prefixCls}-tab-next-icon`} />
      </span>
    );

    const navClassName = `${prefixCls}-nav`;
    const navClasses = classnames(navClassName, scrollAnimated ? `${navClassName}-animated` : `${navClassName}-no-animated`);

    return (
      <div
        className={classnames({
          [`${prefixCls}-nav-container`]: 1,
          [`${prefixCls}-nav-container-scrolling`]: showNextPrev,
        })}
        key="container"
        ref={containerRef}
      >
        {prevButton}
        {nextButton}
        <div className={`${prefixCls}-nav-wrap`} ref={navWrapRef}>
          <div className={`${prefixCls}-nav-scroll`}>
            <div className={navClasses} ref={navRef}>
              {content}
            </div>
          </div>
        </div>
      </div>
    );
  };

  useLayoutEffect(() => {
    const inkBarNode = inkBarRef.current;
    if (inkBarNode) {
      const inkBarNodeStyle = inkBarNode.style;
      const activeTab = activeTabRef.current;
      const rootNode = rootRef.current;
      if (activeTab && rootNode) {
        const wrapNode = navRef.current || rootNode;
        const transformSupported = isTransformSupported(inkBarNodeStyle);
        const { inkBar } = styles || {};
        if (!isVertical(tabBarPosition)) {
          let left = getLeft(activeTab, wrapNode);
          let width = activeTab.offsetWidth;

          // If tabNode'width width equal to wrapNode'width when tabBarPosition is top or bottom
          // It means no css working, then ink bar should not have width until css is loaded
          if (width === rootNode.offsetWidth) {
            width = 0;
          } else if (inkBar && inkBar.width !== undefined) {
            width = parseFloat(inkBar.width as string);
            if (width) {
              left += (activeTab.offsetWidth - width) / 2;
            }
          }
          // use 3d gpu to optimize render
          if (transformSupported) {
            setTransform(inkBarNodeStyle, `translate3d(${left}px,0,0)`);
            inkBarNodeStyle.width = `${width}px`;
            inkBarNodeStyle.height = '';
          } else {
            inkBarNodeStyle.left = `${left}px`;
            inkBarNodeStyle.top = '';
            inkBarNodeStyle.bottom = '';
            inkBarNodeStyle.right = `${wrapNode.offsetWidth - left - width}px`;
          }
        } else {
          let top = getTop(activeTab, wrapNode);
          let height = activeTab.offsetHeight;
          if (inkBar && inkBar.height !== undefined) {
            height = parseFloat(inkBar.height as string);
            if (height) {
              top += (activeTab.offsetHeight - height) / 2;
            }
          }
          if (transformSupported) {
            setTransform(inkBarNodeStyle, `translate3d(0,${top}px,0)`);
            inkBarNodeStyle.height = `${height}px`;
            inkBarNodeStyle.width = '';
          } else {
            inkBarNodeStyle.left = '';
            inkBarNodeStyle.right = '';
            inkBarNodeStyle.top = `${top}px`;
            inkBarNodeStyle.bottom = `${wrapNode.offsetHeight - top - height}px`;
          }
        }
      }
      inkBarNodeStyle.visibility = activeTab ? 'visible' : 'hidden';
    }
  }, [rootRef, navRef, inkBarRef, activeTabRef, tabBarPosition, styles, activeKey]);

  useEffect(() => {
    setOffset(0, setNextPrev);
  }, [tabBarPosition]);

  useLayoutEffect(() => {
    const currentNextPrev = {
      prev, next,
    };
    const nextPrev = setNextPrev();
    // wait next, prev show hide
    /* eslint react/no-did-update-set-state:0 */
    if (isNextPrevShown(currentNextPrev) !== isNextPrevShown(nextPrev)) {
      scrollToActiveTab();
    } else if (activeKey !== prevActiveKey) {
      setActiveKey(activeKey);
      // can not use props.activeKey
      scrollToActiveTab();
    }
  }, [setNextPrev, isNextPrevShown, prev, next, activeKey, prevActiveKey]);

  useEffect(() => {
    const debouncedResize = debounce(() => {
      setNextPrev();
      scrollToActiveTab();
    }, 200);
    resizeEvent.addEventListener('resize', debouncedResize);
    return () => {
      resizeEvent.removeEventListener('resize', debouncedResize);
      debouncedResize.cancel();
    };
  }, [setNextPrev, scrollToActiveTab, resizeEvent]);

  const inkBarNode = getInkBarNode();
  const tabs = getTabs();
  const groupNode = getGroupNode();
  const scrollbarNode = getScrollBarNode([inkBarNode, tabs]);
  return (
    <div
      role="tablist"
      className={classnames(`${prefixCls}-bar`, { [`${prefixCls}-bar-with-groups`]: groupNode }, className)}
      tabIndex={0}
      ref={rootRef}
      onKeyDown={onKeyDown}
      style={style}
      {...getDataAttr(restProps)}
    >
      <div className={`${prefixCls}-bar-inner`}>
        {groupNode}
        {groupNode && <div className={`${prefixCls}-bar-divider`} />}
        {getContent(scrollbarNode)}
      </div>
    </div>
  );
};

TabBar.displayName = 'TabBar';

TabBar.defaultProps = {
  inkBarAnimated: true,
  scrollAnimated: true,
};

export default TabBar;
