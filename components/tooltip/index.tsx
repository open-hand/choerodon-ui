import React, { cloneElement, Component, CSSProperties, isValidElement, ReactElement, ReactNode } from 'react';
import classNames from 'classnames';
import isMobile from 'choerodon-ui/pro/lib/_util/isMobile';
import getPlacements, { AdjustOverflow, PlacementsConfig } from './placements';
import RcTooltip from '../rc-components/tooltip';
import ConfigContext, { ConfigContextValue } from '../config-provider/ConfigContext';

export { AdjustOverflow, PlacementsConfig };

export type TooltipPlacement =
  | 'top'
  | 'left'
  | 'right'
  | 'bottom'
  | 'topLeft'
  | 'topRight'
  | 'bottomLeft'
  | 'bottomRight'
  | 'leftTop'
  | 'leftBottom'
  | 'rightTop'
  | 'rightBottom';

export type TooltipTheme = 'light' | 'dark';

export type TooltipTrigger = 'hover' | 'focus' | 'click' | 'contextMenu';

export interface AbstractTooltipProps {
  prefixCls?: string;
  overlayClassName?: string;
  style?: CSSProperties;
  overlayStyle?: CSSProperties;
  placement?: TooltipPlacement;
  builtinPlacements?: Record<string, any>;
  defaultVisible?: boolean;
  visible?: boolean;
  onVisibleBeforeChange?: (visible: boolean) => boolean;
  onVisibleChange?: (visible: boolean) => void;
  mouseEnterDelay?: number;
  mouseLeaveDelay?: number;
  transitionName?: string;
  trigger?: TooltipTrigger;
  openClassName?: string;
  arrowPointAtCenter?: boolean;
  autoAdjustOverflow?: boolean | AdjustOverflow;
  // getTooltipContainer had been rename to getPopupContainer
  getTooltipContainer?: (triggerNode: Element) => HTMLElement;
  getPopupContainer?: (triggerNode: Element) => HTMLElement;
  children?: ReactNode;
}

export type RenderFunction = () => ReactNode;

export interface TooltipProps extends AbstractTooltipProps {
  title?: ReactNode | RenderFunction;
  overlay?: ReactNode | RenderFunction;
  theme?: TooltipTheme;
}

const splitObject = (obj: any, keys: string[]) => {
  const picked: any = {};
  const omitted: any = { ...obj };
  keys.forEach(key => {
    if (obj && key in obj) {
      picked[key] = obj[key];
      delete omitted[key];
    }
  });
  return { picked, omitted };
};

export default class Tooltip extends Component<TooltipProps, any> {
  static displayName = 'Tooltip';

  static get contextType(): typeof ConfigContext {
    return ConfigContext;
  }

  static defaultProps = {
    placement: 'top',
    transitionName: 'zoom-big-fast',
    mouseEnterDelay: 0.1,
    mouseLeaveDelay: 0.1,
    arrowPointAtCenter: false,
    autoAdjustOverflow: true,
  };

  private tooltip: RcTooltip | null;

  context: ConfigContextValue;

  state: { visible: boolean };

  constructor(props: TooltipProps) {
    super(props);

    this.state = {
      visible: !!props.visible || !!props.defaultVisible,
    };
  }

  componentWillReceiveProps(nextProps: TooltipProps) {
    if ('visible' in nextProps) {
      this.setState({ visible: nextProps.visible });
    }
  }

  onVisibleChange = (visible: boolean) => {
    const { onVisibleChange } = this.props;
    if (!('visible' in this.props)) {
      this.setState({ visible: this.isNoTitle() ? false : visible });
    }
    if (onVisibleChange && !this.isNoTitle()) {
      onVisibleChange(visible);
    }
  };

  getPopupDomNode() {
    const { tooltip } = this;
    if (tooltip) {
      return tooltip.getPopupDomNode();
    }
  }

  getPlacements() {
    const { builtinPlacements, arrowPointAtCenter, autoAdjustOverflow } = this.props;
    return (
      builtinPlacements ||
      getPlacements({
        arrowPointAtCenter,
        verticalArrowShift: 8,
        autoAdjustOverflow,
      })
    );
  }

  isHoverTrigger() {
    const { trigger } = this.props;
    if (!trigger || trigger === 'hover') {
      return true;
    }
    if (Array.isArray(trigger)) {
      return trigger.indexOf('hover') >= 0;
    }
    return false;
  }

  // Fix Tooltip won't hide at disabled button
  // mouse events don't trigger at disabled button in Chrome
  // https://github.com/react-component/tooltip/issues/18
  getDisabledCompatibleChildren(element: ReactElement<any>) {
    const elementType = element.type as any;
    if ((
      elementType.__PRO_SWITCH ||
      elementType.__PRO_CHECKBOX ||
      elementType.__PRO_RADIO ||
      elementType === 'button'
    ) && element.props.disabled && this.isHoverTrigger()) {
      // Pick some layout related style properties up to span

      const { picked, omitted } = splitObject(element.props.style, [
        'position',
        'left',
        'right',
        'top',
        'bottom',
        'float',
        'display',
        'zIndex',
      ]);
      const spanStyle = {
        display: 'inline-block', // default inline-block is important
        ...picked,
        cursor: 'not-allowed',
      };
      const buttonStyle = {
        ...omitted,
        pointerEvents: 'none',
      };
      const child = cloneElement(element, {
        style: buttonStyle,
        className: null,
      });
      return (
        <span style={spanStyle} className={element.props.className}>
          {child}
        </span>
      );
    }
    return element;
  }

  isNoTitle() {
    const { title, overlay } = this.props;
    return !title && !overlay; // overlay for old version compatibility
  }

  // 动态设置动画点
  onPopupAlign = (domNode: HTMLElement, align: any) => {
    const placements: any = this.getPlacements();
    // 当前返回的位置
    const placement = Object.keys(placements).filter(
      key =>
        placements[key].points[0] === align.points[0] &&
        placements[key].points[1] === align.points[1],
    )[0];
    if (!placement) {
      return;
    }
    // 根据当前坐标设置动画点
    const rect = domNode.getBoundingClientRect();
    const transformOrigin = {
      top: '50%',
      left: '50%',
    };
    if (placement.indexOf('top') >= 0 || placement.indexOf('Bottom') >= 0) {
      transformOrigin.top = `${rect.height - align.offset[1]}px`;
    } else if (placement.indexOf('Top') >= 0 || placement.indexOf('bottom') >= 0) {
      transformOrigin.top = `${-align.offset[1]}px`;
    }
    if (placement.indexOf('left') >= 0 || placement.indexOf('Right') >= 0) {
      transformOrigin.left = `${rect.width - align.offset[0]}px`;
    } else if (placement.indexOf('right') >= 0 || placement.indexOf('Left') >= 0) {
      transformOrigin.left = `${-align.offset[0]}px`;
    }
    domNode.style.transformOrigin = `${transformOrigin.left} ${transformOrigin.top}`;
  };

  saveTooltip = (node: RcTooltip | null) => {
    this.tooltip = node;
  };

  render() {
    const { props, state } = this;
    const { getTooltipTheme, getTooltipPlacement, getPrefixCls } = this.context;
    const {
      prefixCls: customizePrefixCls,
      title,
      overlay,
      openClassName,
      getPopupContainer,
      getTooltipContainer,
      theme = getTooltipTheme(),
      placement = getTooltipPlacement(),
    } = props;
    const prefixCls = getPrefixCls('tooltip', customizePrefixCls);
    const children = props.children as ReactElement<any>;
    let visible = state.visible;
    // Hide tooltip when there is no title
    if (!('visible' in props) && this.isNoTitle()) {
      visible = false;
    }

    const child = isValidElement(children) ? this.getDisabledCompatibleChildren(
      children,
    ) : <span>{children}</span>;
    const childProps = child.props;
    const childCls = classNames(childProps.className, {
      [openClassName || `${prefixCls}-open`]: true,
    });

    if (isMobile()) {
      return child;
    }

    return (
      <RcTooltip
        {...this.props}
        prefixCls={prefixCls}
        getTooltipContainer={getPopupContainer || getTooltipContainer}
        ref={this.saveTooltip}
        builtinPlacements={this.getPlacements()}
        overlay={overlay || title || ''}
        visible={visible}
        onVisibleChange={this.onVisibleChange}
        onPopupAlign={this.onPopupAlign}
        theme={theme}
        placement={placement}
      >
        {visible ? cloneElement(child, { className: childCls }) : child}
      </RcTooltip>
    );
  }
}
