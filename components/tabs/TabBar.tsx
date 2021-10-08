import React, {
  CSSProperties,
  FunctionComponent,
  HTMLAttributes,
  JSXElementConstructor,
  Key,
  MouseEvent,
  PropsWithoutRef,
  ReactElement,
  ReactNode,
  RefAttributes,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import classnames from 'classnames';
import noop from 'lodash/noop';
import debounce from 'lodash/debounce';
import Button from 'choerodon-ui/pro/lib/button';
import { FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { useModal } from 'choerodon-ui/pro/lib/modal-provider/ModalProvider';
import { iteratorReduce } from 'choerodon-ui/pro/lib/_util/iteratorUtils';
import { ModalProps } from 'choerodon-ui/pro/lib/modal/Modal';
import { $l } from 'choerodon-ui/pro/lib/locale-context';
import { getActiveKeyByGroupKey, getDataAttr, getHeader, getLeft, getTop, isTransformSupported, isVertical, setTransform } from './utils';
import warning from '../_util/warning';
import Ripple, { RippleProps } from '../ripple';
import TabBarInner, { TabBarInnerProps } from './TabBarInner';
import EventManager from '../_util/EventManager';
import { TabsType } from './enum';
import Icon from '../icon';
import Menu, { MenuProps, SelectParam } from '../menu';
import MenuItem from '../menu/MenuItem';
import Badge from '../badge';
import TabsContext from './TabsContext';
import KeyCode from '../_util/KeyCode';
import { Size } from '../_util/enum';
import CustomizationSettings from './customization-settings';
import Count from './Count';
import { TabPaneProps } from './TabPane';

export interface TabBarProps {
  inkBarAnimated?: boolean | undefined;
  scrollAnimated?: boolean | undefined;
  extraContent?: ReactNode;
  style?: CSSProperties | undefined;
  inkBarStyle?: CSSProperties | undefined;
  // styles?: { inkBar?: CSSProperties } | undefined;
  tabBarGutter?: number | undefined;
  className?: string | undefined;
  type?: TabsType | undefined;
  onRemoveTab: (targetKey: Key | null, e: MouseEvent<HTMLElement>) => void;
}

const TabBar: FunctionComponent<TabBarProps> = function TabBar(props) {
  const {
    scrollAnimated, className, style, inkBarStyle, extraContent,
    tabBarGutter, inkBarAnimated, type, onRemoveTab, ...restProps
  } = props;
  const {
    keyboard, customizable, prefixCls, activeKey, activeGroupKey, tabBarPosition, hideOnlyGroup = false,
    groupedPanelsMap, currentPanelMap, onTabClick, onPrevClick = noop, onNextClick = noop, changeActiveKey,
  } = useContext(TabsContext);
  const modal = useModal();
  const openCustomizationModal = useCallback(() => {
    if (customizable) {
      const modalProps: ModalProps = {
        drawer: true,
        size: Size.small,
        title: $l('Tabs', 'customization_settings'),
        children: <CustomizationSettings />,
        bodyStyle: {
          overflow: 'hidden auto',
          padding: 0,
        },
      };
      modalProps.okText = $l('Tabs', 'save');
      modal.open(modalProps);
    }
  }, [customizable, modal]);
  const getNextActiveKey = useCallback((next): string | undefined => {
    const list: string[] = [];
    currentPanelMap.forEach((c, key) => {
      if (!c.disabled) {
        if (next) {
          list.push(key);
        } else {
          list.unshift(key);
        }
      }
    });
    const { length } = list;
    if (activeKey && length) {
      const i = list.indexOf(activeKey);
      const itemIndex = i === length - 1 ? 0 : i + 1;
      return list[itemIndex] || list[0];
    }
    return undefined;
  }, [activeKey, currentPanelMap]);
  const handleKeyDown = useCallback(e => {
    if (keyboard === false) {
      return noop;
    }
    const { keyCode } = e;
    if (keyCode === KeyCode.RIGHT || keyCode === KeyCode.DOWN) {
      e.preventDefault();
      const nextKey = getNextActiveKey(true);
      if (nextKey) {
        changeActiveKey(nextKey);
      }
    } else if (keyCode === KeyCode.LEFT || keyCode === KeyCode.UP) {
      e.preventDefault();
      const previousKey = getNextActiveKey(false);
      if (previousKey) {
        changeActiveKey(previousKey);
      }
    }
  }, [keyboard, changeActiveKey, getNextActiveKey]);
  const handleTabClick = useCallback((key: string) => {
    if (onTabClick) {
      onTabClick(key);
    }
    changeActiveKey(key);
  }, [changeActiveKey, onTabClick]);
  const handleGroupSelect = useCallback((param: SelectParam) => {
    const { key } = param;
    if (activeGroupKey !== key) {
      const newActiveKey = getActiveKeyByGroupKey(groupedPanelsMap, key);
      if (newActiveKey) {
        changeActiveKey(newActiveKey, true);
      }
    }
  }, [changeActiveKey, activeGroupKey, groupedPanelsMap]);
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
    const length = currentPanelMap.size;
    return iteratorReduce<[string, TabPaneProps & { type: string | JSXElementConstructor<any> }], ReactElement<RippleProps>[]>(currentPanelMap.entries(), (rst, [key, child], index) => {
      const { disabled, closable = true, count, overflowCount, showCount } = child;
      const classes = [`${prefixCls}-tab`];
      const tabProps: PropsWithoutRef<TabBarInnerProps> & RefAttributes<HTMLDivElement> = {
        tabKey: key,
        role: 'tab',
        'aria-disabled': 'false',
        'aria-selected': 'false',
        style: {
          marginRight: tabBarGutter && index === length - 1 ? 0 : tabBarGutter!,
        },
      };
      if (disabled) {
        classes.push(`${prefixCls}-tab-disabled`);
        tabProps['aria-disabled'] = 'true';
      } else {
        tabProps.onTabClick = handleTabClick;
      }
      if (activeKey === key) {
        classes.push(`${prefixCls}-tab-active`);
        tabProps.ref = activeTabRef;
        tabProps['aria-selected'] = 'true';
      }
      tabProps.className = classes.join(' ');
      warning('tab' in child || 'title' in child, 'There must be `tab` or `title` property on children of Tabs.');
      const title = (
        <>
          {getHeader(child)}
          {showCount && <Count prefixCls={prefixCls} count={count} overflowCount={overflowCount} />}
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
    if (extraContent || customizable) {
      return [
        contents,
        <div key="extra" className={`${prefixCls}-extra-content`}>
          {
            customizable && (
              <Button
                className={`${prefixCls}-hover-button`}
                funcType={FuncType.flat}
                icon="predefine"
                size={Size.small}
                onClick={openCustomizationModal}
              />
            )
          }
          {extraContent}
        </div>,
      ];
    }
    return [contents];
  };

  const getGroupNode = (): ReactElement<MenuProps> | undefined => {
    if (groupedPanelsMap.size > Number(hideOnlyGroup)) {
      const items: ReactElement<any>[] = [];
      groupedPanelsMap.forEach((pane, key) => {
        const { group: { tab, disabled, dot } } = pane;
        items.push(
          <MenuItem key={String(key)} disabled={disabled}>
            <Badge dot={dot}>
              {tab}
            </Badge>
          </MenuItem>,
        );
      });
      return (
        <Menu
          prefixCls={`${prefixCls}-group`}
          selectedKeys={activeGroupKey ? [activeGroupKey] : []}
          onSelect={handleGroupSelect}
          mode={isVertical(tabBarPosition) ? 'vertical' : 'horizontal'}
        >
          {items}
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
        style={inkBarStyle}
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
        if (!isVertical(tabBarPosition)) {
          let left = getLeft(activeTab, wrapNode);
          let width = activeTab.offsetWidth;

          // If tabNode'width width equal to wrapNode'width when tabBarPosition is top or bottom
          // It means no css working, then ink bar should not have width until css is loaded
          if (width === rootNode.offsetWidth) {
            width = 0;
          } else if (inkBarStyle && inkBarStyle.width !== undefined) {
            width = parseFloat(inkBarStyle.width as string);
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
          if (inkBarStyle && inkBarStyle.height !== undefined) {
            height = parseFloat(inkBarStyle.height as string);
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
  });

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
      onKeyDown={handleKeyDown}
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
