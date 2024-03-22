import React, {
  ClassAttributes,
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
  forwardRef,
} from 'react';
import classnames from 'classnames';
import debounce from 'lodash/debounce';
import Button from 'choerodon-ui/pro/lib/button';
import { FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { useModal } from 'choerodon-ui/pro/lib/modal-provider/ModalProvider';
import { iteratorReduce, iteratorSome } from 'choerodon-ui/pro/lib/_util/iteratorUtils';
import { ModalProps } from 'choerodon-ui/pro/lib/modal/Modal';
import Dropdown from 'choerodon-ui/pro/lib/dropdown';
import { $l } from 'choerodon-ui/pro/lib/locale-context';
import { getActiveKeyByGroupKey, getDataAttr, getHeader, getLeft, getStyle, getTextHeight, getTop, isTransformSupported, isVertical, setTransform } from './utils';
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
import TabsAddBtn from './TabsAddBtn';
import InvalidBadge from './InvalidBadge';
import ReactResizeObserver from '../_util/resizeObserver';

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
  showMore?: boolean;
  hideAdd?: boolean;
  onRemoveTab: (targetKey: Key | null, e: MouseEvent<HTMLElement>) => void;
  onEdit?: (targetKey: Key | MouseEvent<HTMLElement>, action: 'add' | 'remove') => void;
  children?: (node: React.ReactElement) => React.ReactElement;
  showMorePopupClassName?: string;
}

interface MenuKeyValue {
  key: string;
  tab: string;
}

const TabBar: FunctionComponent<TabBarProps> = function TabBar(props) {
  const {
    scrollAnimated,
    className,
    style,
    inkBarStyle,
    extraContent,
    tabBarGutter,
    inkBarAnimated,
    type,
    showMore,
    hideAdd,
    onRemoveTab,
    onEdit,
    children: renderChildBar,
    showMorePopupClassName,
    ...restProps
  } = props;
  const {
    keyboard,
    customizable,
    prefixCls,
    activeKey,
    activeGroupKey,
    tabBarPosition,
    hideOnlyGroup = false,
    groupedPanelsMap,
    currentPanelMap,
    validationMap,
    onTabClick,
    changeActiveKey,
    rippleDisabled,
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
  }, [changeActiveKey, getNextActiveKey]);
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
  const getOffsetWH = useCallback((node: HTMLDivElement) => {
    return node[isVertical(tabBarPosition) ? 'offsetHeight' : 'offsetWidth'];
  }, [tabBarPosition]);

  const getScrollWH = useCallback((node: HTMLDivElement) => {
    return node[isVertical(tabBarPosition) ? 'scrollHeight' : 'scrollWidth'];
  }, [tabBarPosition]);

  const getOffsetLT = useCallback((node: HTMLDivElement) => {
    return node.getBoundingClientRect()[isVertical(tabBarPosition) ? 'top' : 'left'];
  }, [tabBarPosition]);
  const resizeEvent = useMemo(() => new EventManager(typeof window === 'undefined' ? undefined : window), []);
  const lastNextPrevShownRef = useRef<boolean | undefined>();
  const offsetRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const navWrapRef = useRef<HTMLDivElement | null>(null);
  const navScrollRef = useRef<HTMLDivElement | null>(null);
  const navRef = useRef<HTMLDivElement | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const activeTabRef = useRef<HTMLDivElement | null>(null);
  const inkBarRef = useRef<HTMLDivElement | null>(null);
  const [next, setNext] = useState<boolean>(false);
  const [prev, setPrev] = useState<boolean>(false);
  const [prevActiveKey, setActiveKey] = useState<string | undefined>(activeKey);
  const [menuList, setMenuList] = useState<Array<MenuKeyValue>>([]);
  const tabsRef = useRef<any>([]);
  const getTabs = useMemo((): ReactElement<RippleProps>[] => {
    const length = currentPanelMap.size;
    const tabBarRef = [...currentPanelMap.entries()].map((item) => ({ key: item[0], value: item[1], ref: React.createRef<HTMLDivElement>() }));
    tabsRef.current = tabBarRef;
    const isSecond = type === TabsType['second-level'];
    return iteratorReduce<[string, TabPaneProps & { type: string | JSXElementConstructor<any> }], ReactElement<RippleProps>[]>(currentPanelMap.entries(), (rst, [key, child], index) => {
      const { disabled, closable = true, showCount, count, overflowCount, countRenderer } = child;
      const classes = isSecond ? [`${prefixCls}-second-tab`] : [`${prefixCls}-tab`];
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
        classes.push(`${classes}-disabled`);
        tabProps['aria-disabled'] = 'true';
      } else {
        tabProps.onTabClick = handleTabClick;
      }
      if (activeKey === key) {
        classes.push(isSecond ? `${classes}-active` : `${classes}-active`);
        tabBarRef[index].ref = activeTabRef;
        tabProps['aria-selected'] = 'true';
      }
      tabProps.className = classes.join(' ');
      warning('tab' in child || 'title' in child, 'There must be `tab` or `title` property on children of Tabs.');
      const title = (
        <>
          {getHeader(child)}
          {showCount && (
            <Count
              prefixCls={prefixCls}
              count={count}
              renderer={countRenderer}
              overflowCount={overflowCount}
              asyncCount={renderInkBar}
            />
          )}
        </>
      );

      const TabBarInnerWrapper = forwardRef(function TabBarInnerWrapper(props, ref: any) {
        // 兼容 @dnd-kit/core 的 ref, ref 为 function
        if (typeof ref === 'function') {
          ref(tabBarRef[index].ref.current);
        } else {
          ref = tabBarRef[index].ref;
        }

        return (
          <TabBarInner ref={tabBarRef[index].ref} {...tabProps} {...props}>
            <InvalidBadge prefixCls={prefixCls} isInvalid={() => key !== activeKey && validationMap.get(key) === false}>
              {
                type === TabsType['editable-card'] ? (
                  <div className={closable ? undefined : `${prefixCls}-tab-unclosable`}>
                    {title}
                    {closable && <Icon type="close" onClick={e => onRemoveTab(key, e)} />}
                  </div>
                ) : title
              }
            </InvalidBadge>
          </TabBarInner>
        );
      });
      rst.push(
        typeof renderChildBar === 'function' ? (
          renderChildBar(<TabBarInnerWrapper key={key} data-node-key={String(key)} />)
        ) : (
          <Ripple disabled={disabled || rippleDisabled} key={key}>
            <TabBarInnerWrapper />
          </Ripple>
        ),
      );
      return rst;
    }, []);
  }, [currentPanelMap, tabBarGutter, activeKey, activeTabRef, prefixCls, rippleDisabled, validationMap]);

  const isNextPrevShown = useCallback((state?: { prev: boolean; next: boolean }): boolean => {
    if (state) {
      return state.next || state.prev;
    }

    return next || prev;
  }, [next, prev]);

  const onMenuClick = ({ key }) => {
    handleTabClick(key);
    scrollToActiveTab();
  };
  const menu = () => {
    return (
      <Menu style={{ maxHeight: 200, overflow: 'auto' }} onClick={onMenuClick}>
        {menuList.map(x => (
          <Menu.Item key={x.key}>
            <a target="_blank">{getHeader(x)}</a>
          </Menu.Item>
        ))}
      </Menu>
    );
  };

  const getContent = (contents: ReactElement<HTMLAttributes<HTMLDivElement>>): ReactElement<HTMLAttributes<HTMLDivElement>>[] => {
    const vertical = isVertical(tabBarPosition);
    const isEditCard = type === TabsType['editable-card'];
    const classes = classnames(`${prefixCls}-extra-content`, {
      [`${prefixCls}-extra-vertical-content`]: vertical,
    });
    const dropDownClass = classnames(`${prefixCls}-more-tab`, {
      [`${prefixCls}-more-vertical-tab`]: vertical,
    });

    const nextPrevShown = isNextPrevShown();

    const popupClassName = classnames(`${prefixCls}-more-dropdown-popup`, showMorePopupClassName);

    const moreTool = nextPrevShown && !!showMore && (
      <Dropdown overlay={menu} key="more" popupClassName={popupClassName}>
        <Icon type="more_horiz" className={dropDownClass} />
      </Dropdown>
    );
    const addTool = isEditCard && nextPrevShown && !hideAdd && (
      <TabsAddBtn key="add" onEdit={onEdit} vertical={vertical} isFixed />
    );

    // 这里是固定项
    const toolBar = [moreTool, addTool];

    if (extraContent || customizable) {
      return [
        contents,
        <div key="extra" className={classes}>
          {customizable && (
            <Button
              className={`${prefixCls}-hover-button`}
              funcType={FuncType.flat}
              icon="predefine"
              size={Size.small}
              onClick={openCustomizationModal}
            />
          )}
          {toolBar}
          {extraContent}
        </div>,
      ];
    }
    return [
      contents,
      <div key="extra" className={classes}>
        {toolBar}
      </div>,
    ];
  };

  const getGroupNode = (): ReactElement<MenuProps> | undefined => {
    if (groupedPanelsMap.size > Number(hideOnlyGroup)) {
      const items: ReactElement<any>[] = [];
      groupedPanelsMap.forEach((pane, key) => {
        const { group: { tab, disabled, dot }, panelsMap } = pane;
        if (panelsMap.size) {
          items.push(
            <MenuItem key={String(key)} disabled={disabled}>
              <InvalidBadge
                prefixCls={prefixCls}
                isInvalid={() => activeGroupKey !== key && iteratorSome(panelsMap.keys(), paneKey => validationMap.get(paneKey) === false)}
              >
                <Badge dot={dot}>
                  {tab}
                </Badge>
              </InvalidBadge>
            </MenuItem>,
          );
        }
      });
      if (items.length > 1) {
        return (
          <Menu
            prefixCls={`${prefixCls}-group`}
            selectedKeys={activeGroupKey ? [activeGroupKey] : []}
            onSelect={handleGroupSelect}
            mode="vertical"
          >
            {items}
          </Menu>
        );
      }
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

  const setOffset = useCallback((offset: number, callback?: Function) => {
    const nav = navRef.current; // 节点长度
    const navScroll = navScrollRef.current;
    if (nav && navScroll) {
      const target = Math.round(offset);
      if (offsetRef.current !== target) {
        offsetRef.current = Math.abs(target);
        const navOffset: { name?: string; value?: string } = {};
        const navStyle = nav.style;
        const transformSupported = isTransformSupported(navStyle);
        if (isVertical(tabBarPosition)) {
          if (transformSupported) {
            const top = Math.abs(target);
            if (navScroll.scrollTo) {
              navScroll.scrollTo({ top });
            } else {
              navScroll.scrollTop = top;
            }
          } else {
            navOffset.name = 'top';
            navOffset.value = `${target}px`;
          }
        } else if (transformSupported) {
          const left = Math.abs(target);
          if (navScroll.scrollTo) {
            navScroll.scrollTo({ left });
          } else {
            navScroll.scrollLeft = left;
          }
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
      const offset = Math.round(offsetRef.current);
      // 当容器小于tab的时候使用最小值才可以防止回弹问题。
      const minOffset = Math.round(navNodeWH - navWrapNodeWH);
      let $next = next;
      let $prev = prev;
      if (offset === 0 && containerWH < navNodeWH) {
        $prev = false;
        $next = true;
      } else if (minOffset > 0 && offset >= minOffset) {
        $prev = true;
        $next = false;
      } else if (offset > 0) {
        $prev = true;
        $next = true;
      } else {
        $prev = false;
        $next = false;
      }

      if (next !== $next) {
        setNext($next);
      }
      if (prev !== $prev) {
        setPrev($prev);
      }
      return {
        next: $next,
        prev: $prev,
      };
    }
  }, [next, prev, navRef, containerRef, navWrapRef, offsetRef, getScrollWH, getOffsetWH]);

  const toPrev = useCallback(() => {
    const navWrapNode = navWrapRef.current;
    if (navWrapNode) {
      const navWrapNodeWH = getOffsetWH(navWrapNode);
      const offset = offsetRef.current - navWrapNodeWH;
      setOffset(offset < 0 ? 0 : 0 - offset, setNextPrev);
    }
  }, [getOffsetWH, setOffset, navWrapRef, setNextPrev]);

  const toNext = useCallback(() => {
    const navWrapNode = navWrapRef.current;
    const navNode = navRef.current;
    if (navWrapNode && navNode) {
      const navNodeWH = getScrollWH(navNode);
      const navWrapNodeWH = getOffsetWH(navWrapNode);
      const offset = offsetRef.current + navWrapNodeWH;
      setOffset(0 - (offset > navNodeWH ? navNodeWH - navWrapNodeWH : offset), setNextPrev);
    }
  }, [getOffsetWH, setOffset, navWrapRef, setNextPrev]);

  const scrollToActiveTab = useCallback((e?: { target?: HTMLElement; currentTarget?: HTMLElement }) => {
    const vertical = isVertical(tabBarPosition);
    const activeTab = activeTabRef.current;
    const navWrap = navWrapRef.current;
    if ((e && e.target !== e.currentTarget) || !activeTab || !navWrap) {
      return;
    }

    // when not scrollable or enter scrollable first time, don't emit scrolling
    const needToSroll = isNextPrevShown();
    if (!needToSroll) {
      return;
    }

    const activeTabWH = getOffsetWH(activeTab) + getStyle(activeTab, vertical ? 'margin-bottom' : 'margin-right');
    const navWrapNodeWH = getOffsetWH(navWrap);
    let offset = navScrollRef.current ? (vertical ? navScrollRef.current.scrollTop : navScrollRef.current.scrollLeft) : 0;
    const wrapOffset = getOffsetLT(navWrap);
    const activeTabOffset = getOffsetLT(activeTab);
    if (wrapOffset > activeTabOffset) {
      offset -= (wrapOffset - activeTabOffset);
      setOffset(offset, setNextPrev);
    } else if ((wrapOffset + navWrapNodeWH) < (activeTabOffset + activeTabWH)) {
      offset += (activeTabOffset + activeTabWH) - (navWrapNodeWH + wrapOffset);
      setOffset(offset, setNextPrev);
    }
  }, [activeTabRef, navWrapRef, lastNextPrevShownRef, getScrollWH, getOffsetWH, getOffsetLT, setOffset, setNextPrev, isNextPrevShown]);
  const prevTransitionEnd = useCallback(e => {
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
  const getScrollBarNode = (content: [ReactElement<HTMLAttributes<HTMLDivElement>>, ReactElement<RippleProps>[] | null]): ReactElement<HTMLAttributes<HTMLDivElement>> => {
    const showNextPrev = isNextPrevShown();

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

    const navClassName = type === TabsType['second-level'] ? `${prefixCls}-second-nav` : `${prefixCls}-nav`;
    const navClasses = classnames(navClassName, scrollAnimated ? `${navClassName}-animated` : `${navClassName}-no-animated`);

    const vertical = isVertical(tabBarPosition);

    const isEditCard = type === TabsType['editable-card'];
    return (
      <div
        className={classnames({
          [`${prefixCls}-nav-container`]: 1,
          [`${prefixCls}-nav-container-scrolling`]: showNextPrev && !showMore,
        })}
        key="container"
        ref={containerRef}
      >
        {!showMore && prevButton}
        {!showMore && nextButton}
        <div className={`${prefixCls}-nav-wrap`} ref={navWrapRef}>
          <div className={`${prefixCls}-nav-scroll`} ref={navScrollRef}>
            <div className={navClasses} ref={navRef}>
              {content}
              {!hideAdd && isEditCard && (
                <TabsAddBtn
                  prefixCls={prefixCls}
                  extraPrefixCls={showNextPrev ? 'none' : 'inline-flex'}
                  vertical={vertical}
                  onEdit={onEdit}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };
  // 发生滚动事件，改变更多的菜单。
  const handleScrollEvent = useCallback(() => {
    const vertical = isVertical(tabBarPosition);
    const scrollDom = navScrollRef.current;
   
    let scrollLeft = 0;
    let scrollTop = 0;
    if (scrollDom) {
      scrollLeft = scrollDom.scrollLeft;
      scrollTop = scrollDom.scrollTop;
    }
    const menuList: Array<MenuKeyValue> = [];

    const navWrap = navWrapRef.current; // 节点滚动区域
    let navWrapNodeWH = 0;
    if (navWrap) {
      navWrapNodeWH = getOffsetWH(navWrap);
    }

    for (let i = 0; i < tabsRef.current.length; i++) {
      const { key, value, ref } = tabsRef.current[i];
      const dom = ref.current;
      if (dom) {
        if (!vertical) {
          const domLeft = dom.offsetLeft;
          const domWidth = dom.offsetWidth;
          if (domLeft - scrollLeft < 0 || (domLeft - scrollLeft + domWidth) > navWrapNodeWH) {
            menuList.push({ key, ...value });
          }
        } else {
          const domTop = dom.offsetTop;
          const font = getComputedStyle(dom).getPropertyValue('font');
          const domHeight = getTextHeight(dom, font);
          if (domTop - scrollLeft < 0 || (domTop - scrollTop + domHeight) > navWrapNodeWH) {
            menuList.push({ key, ...value });
          }
        }
      }
    }
    setMenuList(menuList);
    setOffset(vertical ? scrollTop : scrollLeft, setNextPrev);
  }, [tabBarPosition]);

  const renderInkBar = () => {
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
  };

  useLayoutEffect(() => {
    renderInkBar();
  });

  useEffect(() => {
    handleScrollEvent();
    const debouncedScroll = debounce(() => {
      handleScrollEvent();
    }, 200);

    const debouncedWheel = debounce(() => {
      handleScrollEvent();
    }, 50);
    const debouncedWheelWrap = (e) => {
      // 仅处理横向显示且为鼠标滚动
      if (isVertical(tabBarPosition) || Math.abs(e.deltaX) > 0) {
        return;
      }
      if (navScrollRef && navScrollRef.current && navRef && navRef.current
        && navRef.current.offsetWidth > navScrollRef.current.offsetWidth) {
        e.preventDefault();
        e.stopPropagation();
        debouncedWheel();
      }
    };

    const scrollEvent = new EventManager(navScrollRef.current);
    scrollEvent.addEventListener('scroll', debouncedScroll);
    scrollEvent.addEventListener('wheel', debouncedWheelWrap);
    return () => {
      scrollEvent.removeEventListener('scroll', debouncedScroll);
      scrollEvent.removeEventListener('wheel', debouncedWheelWrap);
      debouncedScroll.cancel();
      debouncedWheel.cancel();
    };
  }, [tabBarPosition]);

  useLayoutEffect(() => {
    const currentNextPrev = {
      prev,
      next,
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

  // 内容变化判断是否显示更多
  useEffect(() => {
    setNextPrev();
  }, [getContent]);

  const inkBarNode = getInkBarNode();
  const tabs = getTabs;
  const groupNode = getGroupNode();
  const scrollbarNode = getScrollBarNode([inkBarNode, tabs]);
  const classString = classnames(
    `${prefixCls}-bar`,
    { [`${prefixCls}-bar-with-groups`]: groupNode },
    className,
  );
  const tabBarProps: ClassAttributes<HTMLDivElement> & HTMLAttributes<HTMLDivElement> = {
    role: 'tablist',
    className: classString,
    ref: rootRef,
    style,
  };
  if (keyboard) {
    tabBarProps.tabIndex = 0;
    tabBarProps.onKeyDown = handleKeyDown;
  }
  return (
    <ReactResizeObserver
      resizeProp={isVertical(tabBarPosition) ? 'height' : 'width'}
      onResize={debounce(() => {
        setNextPrev();
        scrollToActiveTab();
        handleScrollEvent();
      }, 200)}>
      <div
        {...tabBarProps}
        {...getDataAttr(restProps)}
      >
        <div className={`${prefixCls}-bar-inner`}>
          {groupNode}
          {groupNode && <div className={`${prefixCls}-bar-divider`} />}
          {getContent(scrollbarNode)}
        </div>
      </div>
    </ReactResizeObserver>
  );
};

TabBar.displayName = 'TabBar';

TabBar.defaultProps = {
  inkBarAnimated: true,
  scrollAnimated: true,
};

export default TabBar;
