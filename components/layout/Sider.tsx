import React, { HTMLAttributes, PureComponent, ReactNode } from 'react';
import classNames from 'classnames';
import omit from 'lodash/omit';
import isNumber from 'lodash/isNumber';
import Icon from '../icon';
import { matchMediaPolifill } from '../_util/mediaQueryListPolyfill';
import LayoutContext, { LayoutContextValue } from './LayoutContext';
import { LayoutSiderContextProvider } from './LayoutSiderContext';

if (typeof window !== 'undefined') {
  // const matchMediaPolyfill = (mediaQuery: string): MediaQueryList => {
  //   return {
  //     media: mediaQuery,
  //     matches: false,
  //     addListener() {
  //     },
  //     removeListener() {
  //     },
  //   };
  // };
  window.matchMedia = window.matchMedia || matchMediaPolifill;
}

const dimensionMap = {
  xs: '480px',
  sm: '576px',
  md: '768px',
  lg: '992px',
  xl: '1200px',
  xxl: '1600px',
};

export type CollapseType = 'clickTrigger' | 'responsive';

export type SiderTheme = 'light' | 'dark';

export interface SiderProps extends HTMLAttributes<HTMLDivElement> {
  prefixCls?: string;
  collapsible?: boolean;
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  reverseArrow?: boolean;
  onCollapse?: (collapsed: boolean, type: CollapseType) => void;
  trigger?: ReactNode;
  width?: number | string;
  collapsedWidth?: number | string;
  breakpoint?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  theme?: SiderTheme;
  onBreakpoint?: (broken: boolean) => void;
}

export interface SiderState {
  collapsed?: boolean;
  below: boolean;
  belowShow?: boolean;
}

export interface SiderContext {
  siderCollapsed: boolean;
}

const generateId = (() => {
  let i = 0;
  return (prefix = '') => {
    i += 1;
    return `${prefix}${i}`;
  };
})();

export default class Sider extends PureComponent<SiderProps, SiderState> {
  static displayName = 'LayoutSider';

  static get contextType(): typeof LayoutContext {
    return LayoutContext;
  }

  static __C7N_LAYOUT_SIDER: any = true;

  static defaultProps = {
    collapsible: false,
    defaultCollapsed: false,
    reverseArrow: false,
    width: 200,
    collapsedWidth: 80,
    style: {},
    theme: 'dark' as SiderTheme,
  };

  context: LayoutContextValue;

  private mql: MediaQueryList;

  private uniqueId: string;

  constructor(props: SiderProps, context: LayoutContextValue) {
    super(props, context);
    const { getPrefixCls } = context;
    this.uniqueId = generateId(getPrefixCls('sider-'));
    let matchMedia;
    if (typeof window !== 'undefined') {
      matchMedia = window.matchMedia;
    }
    if (matchMedia && props.breakpoint && props.breakpoint in dimensionMap) {
      this.mql = matchMedia(`(max-width: ${dimensionMap[props.breakpoint]})`);
    }
    let collapsed;
    if ('collapsed' in props) {
      collapsed = props.collapsed;
    } else {
      collapsed = props.defaultCollapsed;
    }
    this.state = {
      collapsed,
      below: false,
    };
  }

  getContextValue() {
    const { collapsedWidth } = this.props;
    const { collapsed } = this.state;
    return {
      siderCollapsed: collapsed,
      collapsedWidth,
    };
  }

  componentWillReceiveProps(nextProps: SiderProps) {
    if ('collapsed' in nextProps) {
      this.setState({
        collapsed: nextProps.collapsed,
      });
    }
  }

  componentDidMount() {
    if (this.mql) {
      this.mql.addListener(this.responsiveHandler);
      this.responsiveHandler(
        new MediaQueryListEvent('change', {
          matches: this.mql.matches,
          media: this.mql.media,
        }),
      );
    }
    const { siderHook } = this.context;
    if (siderHook) {
      siderHook.addSider(this.uniqueId);
    }
  }

  componentWillUnmount() {
    if (this.mql) {
      this.mql.removeListener(this.responsiveHandler);
    }
    const { siderHook } = this.context;
    if (siderHook) {
      siderHook.removeSider(this.uniqueId);
    }
  }

  responsiveHandler = (event: MediaQueryListEvent) => {
    this.setState({ below: event.matches });
    const { onBreakpoint } = this.props;
    if (onBreakpoint) {
      onBreakpoint(event.matches);
    }
    const { collapsed } = this.state;
    if (collapsed !== event.matches) {
      this.setCollapsed(event.matches, 'responsive');
    }
  };

  setCollapsed = (collapsed: boolean, type: CollapseType) => {
    if (!('collapsed' in this.props)) {
      this.setState({
        collapsed,
      });
    }
    const { onCollapse } = this.props;
    if (onCollapse) {
      onCollapse(collapsed, type);
    }
  };

  toggle = () => {
    const { collapsed } = this.state;
    this.setCollapsed(!collapsed, 'clickTrigger');
  };

  belowShowChange = () => {
    const { belowShow } = this.state;
    this.setState({ belowShow: !belowShow });
  };

  render() {
    const {
      prefixCls: customizePrefixCls,
      className,
      theme,
      collapsible,
      reverseArrow,
      trigger,
      style,
      width,
      collapsedWidth,
      children,
      ...others
    } = this.props;
    const { collapsed, below } = this.state;
    const { getPrefixCls } = this.context;
    const prefixCls = getPrefixCls('layout-sider', customizePrefixCls);
    const divProps = omit(others, ['collapsed', 'defaultCollapsed', 'onCollapse', 'breakpoint', 'onBreakpoint']);
    const rawWidth = collapsed ? collapsedWidth : width;
    // use "px" as fallback unit for width
    const siderWidth = isNumber(rawWidth) ? `${rawWidth}px` : String(rawWidth);
    // special trigger when collapsedWidth == 0
    const zeroWidthTrigger =
      parseFloat(String(collapsedWidth || 0)) === 0 ? (
        <span onClick={this.toggle} className={`${prefixCls}-zero-width-trigger`}>
          <Icon type="bars" />
        </span>
      ) : null;
    const iconObj = {
      expanded: reverseArrow ? <Icon type="right" /> : <Icon type="left" />,
      collapsed: reverseArrow ? <Icon type="left" /> : <Icon type="right" />,
    };
    const status = collapsed ? 'collapsed' : 'expanded';
    const defaultTrigger = iconObj[status];
    const triggerDom =
      trigger !== null ? zeroWidthTrigger || (
        <div
          className={`${prefixCls}-trigger`}
          onClick={this.toggle}
          style={{ width: siderWidth }}
        >
          {trigger || defaultTrigger}
        </div>
      ) : null;
    const divStyle = {
      ...style,
      flex: `0 0 ${siderWidth}`,
      maxWidth: siderWidth, // Fix width transition bug in IE11
      minWidth: siderWidth,
      width: siderWidth,
    };
    const siderCls = classNames(className, prefixCls, `${prefixCls}-${theme}`, {
      [`${prefixCls}-collapsed`]: !!collapsed,
      [`${prefixCls}-has-trigger`]: collapsible && trigger !== null && !zeroWidthTrigger,
      [`${prefixCls}-below`]: !!below,
      [`${prefixCls}-zero-width`]: parseFloat(siderWidth) === 0,
    });
    return (
      <LayoutSiderContextProvider {...this.getContextValue()} getPrefixCls={getPrefixCls}>
        <div className={siderCls} {...divProps} style={divStyle}>
          <div className={`${prefixCls}-children`}>{children}</div>
          {collapsible || (below && zeroWidthTrigger) ? triggerDom : null}
        </div>
      </LayoutSiderContextProvider>
    );
  }
}
