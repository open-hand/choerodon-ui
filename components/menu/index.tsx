import React, { Component, CSSProperties } from 'react';
import { findDOMNode } from 'react-dom';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import animation from '../_util/openAnimation';
import warning from '../_util/warning';
import SubMenu from './SubMenu';
import Item from './MenuItem';
import { SiderContext } from '../layout/Sider';
import RcMenu, { Divider, ItemGroup } from '../rc-components/menu';
import { getPrefixCls } from '../configure';

export interface SelectParam {
  key: string;
  keyPath: Array<string>;
  item: any;
  domEvent: any;
  selectedKeys: Array<string>;
}

export interface ClickParam {
  key: string;
  keyPath: Array<string>;
  item: any;
  domEvent: any;
}

export type MenuMode = 'vertical' | 'vertical-left' | 'vertical-right' | 'horizontal' | 'inline';

export type MenuTheme = 'light' | 'dark';

export interface MenuProps {
  id?: string;
  theme?: MenuTheme;
  mode?: MenuMode;
  selectable?: boolean;
  selectedKeys?: Array<string>;
  defaultSelectedKeys?: Array<string>;
  openKeys?: Array<string>;
  defaultOpenKeys?: Array<string>;
  onOpenChange?: (openKeys: string[]) => void;
  onSelect?: (param: SelectParam) => void;
  onDeselect?: (param: SelectParam) => void;
  onClick?: (param: ClickParam) => void;
  style?: CSSProperties;
  openAnimation?: string | Object;
  openTransitionName?: string | Object;
  className?: string;
  prefixCls?: string;
  multiple?: boolean;
  inlineIndent?: number;
  inlineCollapsed?: boolean;
  subMenuCloseDelay?: number;
  subMenuOpenDelay?: number;
}

export interface MenuState {
  openKeys: string[];
}

export default class Menu extends Component<MenuProps, MenuState> {
  static displayName = 'Menu';

  static Divider = Divider;

  static Item = Item;

  static SubMenu = SubMenu;

  static ItemGroup = ItemGroup;

  static defaultProps = {
    className: '',
    theme: 'light', // or dark
    focusable: false,
  };

  static childContextTypes = {
    inlineCollapsed: PropTypes.bool,
    menuTheme: PropTypes.string,
  };

  static contextTypes = {
    siderCollapsed: PropTypes.bool,
    collapsedWidth: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  };

  switchModeFromInline: boolean;

  leaveAnimationExecutedWhenInlineCollapsed: boolean;

  inlineOpenKeys: string[] = [];

  constructor(props: MenuProps) {
    super(props);

    warning(
      !('onOpen' in props || 'onClose' in props),
      '`onOpen` and `onClose` are removed, please use `onOpenChange` instead',
    );

    warning(
      !('inlineCollapsed' in props && props.mode !== 'inline'),
      '`inlineCollapsed` should only be used when Menu\'s `mode` is inline.',
    );

    let openKeys;
    if ('defaultOpenKeys' in props) {
      openKeys = props.defaultOpenKeys;
    } else if ('openKeys' in props) {
      openKeys = props.openKeys;
    }

    this.state = {
      openKeys: openKeys || [],
    };
  }

  getChildContext() {
    const { theme } = this.props;
    return {
      inlineCollapsed: this.getInlineCollapsed(),
      menuTheme: theme,
    };
  }

  getPrefixCls() {
    const { prefixCls } = this.props;
    return getPrefixCls('menu', prefixCls);
  }

  componentWillReceiveProps(nextProps: MenuProps, nextContext: SiderContext) {
    const { mode, inlineCollapsed } = this.props;
    if (mode === 'inline' && nextProps.mode !== 'inline') {
      this.switchModeFromInline = true;
    }
    if ('openKeys' in nextProps) {
      this.setState({ openKeys: nextProps.openKeys! });
      return;
    }
    const { openKeys } = this.state;
    const { siderCollapsed } = this.context;
    if (
      (nextProps.inlineCollapsed && !inlineCollapsed) ||
      (nextContext.siderCollapsed && !siderCollapsed)
    ) {
      this.switchModeFromInline =
        !!openKeys.length &&
        !!(findDOMNode(this) as HTMLElement).querySelectorAll(
          `.${this.getPrefixCls()}-submenu-open`,
        ).length;
      this.inlineOpenKeys = openKeys;
      this.setState({ openKeys: [] });
    }
    if (
      (!nextProps.inlineCollapsed && inlineCollapsed) ||
      (!nextContext.siderCollapsed && siderCollapsed)
    ) {
      this.setState({ openKeys: this.inlineOpenKeys });
      this.inlineOpenKeys = [];
    }
  }

  handleClick = (e: ClickParam) => {
    this.handleOpenChange([]);

    const { onClick } = this.props;
    if (onClick) {
      onClick(e);
    }
  };

  handleOpenChange = (openKeys: string[]) => {
    this.setOpenKeys(openKeys);

    const { onOpenChange } = this.props;
    if (onOpenChange) {
      onOpenChange(openKeys);
    }
  };

  setOpenKeys(openKeys: string[]) {
    if (!('openKeys' in this.props)) {
      this.setState({ openKeys });
    }
  }

  getRealMenuMode() {
    const inlineCollapsed = this.getInlineCollapsed();
    if (this.switchModeFromInline && inlineCollapsed) {
      return 'inline';
    }
    const { mode } = this.props;
    return inlineCollapsed ? 'vertical' : mode;
  }

  getInlineCollapsed() {
    const { inlineCollapsed } = this.props;
    const { siderCollapsed = inlineCollapsed } = this.context;
    return siderCollapsed;
  }

  getMenuOpenAnimation(menuMode: MenuMode) {
    const { openAnimation, openTransitionName } = this.props;
    let menuOpenAnimation = openAnimation || openTransitionName;
    if (openAnimation === undefined && openTransitionName === undefined) {
      switch (menuMode) {
        case 'horizontal':
          menuOpenAnimation = 'slide-up';
          break;
        case 'vertical':
        case 'vertical-left':
        case 'vertical-right':
          // When mode switch from inline
          // submenu should hide without animation
          if (this.switchModeFromInline) {
            menuOpenAnimation = '';
            this.switchModeFromInline = false;
          } else {
            menuOpenAnimation = 'zoom-big';
          }
          break;
        case 'inline':
          menuOpenAnimation = {
            ...animation,
            leave: (node: HTMLElement, done: () => void) =>
              animation.leave(node, () => {
                // Make sure inline menu leave animation finished before mode is switched
                this.switchModeFromInline = false;
                this.setState({});
                // when inlineCollapsed change false to true, all submenu will be unmounted,
                // so that we don't need handle animation leaving.
                if (this.getRealMenuMode() === 'vertical') {
                  return;
                }
                done();
              }),
          };
          break;
        default:
      }
    }
    return menuOpenAnimation;
  }

  render() {
    const { className, theme } = this.props;
    const { openKeys } = this.state;
    const prefixCls = this.getPrefixCls();
    const menuMode = this.getRealMenuMode();
    const menuOpenAnimation = this.getMenuOpenAnimation(menuMode!);

    const menuClassName = classNames(className, `${prefixCls}-${theme}`, {
      [`${prefixCls}-inline-collapsed`]: this.getInlineCollapsed(),
    });

    const menuProps: MenuProps = {
      openKeys,
      onOpenChange: this.handleOpenChange,
      className: menuClassName,
      mode: menuMode,
    };

    if (menuMode !== 'inline') {
      // closing vertical popup submenu after click it
      menuProps.onClick = this.handleClick;
      menuProps.openTransitionName = menuOpenAnimation;
    } else {
      menuProps.openAnimation = menuOpenAnimation;
    }

    const { collapsedWidth } = this.context;
    if (
      this.getInlineCollapsed() &&
      (collapsedWidth === 0 || collapsedWidth === '0' || collapsedWidth === '0px')
    ) {
      return null;
    }

    return <RcMenu {...this.props} {...menuProps} prefixCls={prefixCls} />;
  }
}
