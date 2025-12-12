import React, { Children, Component, CSSProperties, isValidElement } from 'react';
import isNil from 'lodash/isNil';
import { toJS } from 'mobx';
import ConfigContext, { ConfigContextValue } from 'choerodon-ui/lib/config-provider/ConfigContext';
import { getConfig } from 'choerodon-ui/lib/configure';
import { TooltipPlacement, TooltipTheme } from 'choerodon-ui/lib/tooltip';
import Trigger, { RenderFunction, TriggerProps } from 'choerodon-ui/lib/trigger/Trigger';
import { Action } from 'choerodon-ui/lib/trigger/enum';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import getPlacements, { AdjustOverflow } from './placements';
import autobind from '../_util/autobind';
import isFragment from '../_util/isFragment';
import { calculateBestPlacement, getElementRect, getViewportRect } from './calculateBestPlacement';

export { TooltipPlacement, TooltipTheme };

export interface TooltipProps extends TriggerProps {
  placement?: TooltipPlacement;
  defaultHidden?: boolean;
  onHiddenBeforeChange?: (hidden: boolean) => boolean;
  onHiddenChange?: (hidden: boolean) => void;
  trigger?: Action[];
  openClassName?: string;
  arrowPointAtCenter?: boolean;
  autoAdjustOverflow?: boolean | AdjustOverflow;
  title?: React.ReactNode | RenderFunction;
  overlay?: React.ReactNode | RenderFunction;
  theme?: TooltipTheme;
  autoPlacement?: boolean;
}

const splitObject = (obj: any, keys: string[]) => {
  const picked: any = {};
  const ommitted: any = { ...obj };
  keys.forEach(key => {
    if (obj && key in obj) {
      picked[key] = obj[key];
      delete ommitted[key];
    }
  });
  return { picked, ommitted };
};

/**
 * Fix the tooltip won't hide when child element is button
 * @param element ReactElement
 */
function getDisabledCompatableChildren(element: React.ReactElement<any>) {
  const elementType = element.type as any;
  const { props } = element;
  if (elementType === 'button' && props.disabled) {
    const { style, block, className } = props;
    const { picked, ommitted } = splitObject(style, [
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
      display: 'inline-block',
      ...picked,
      cursor: 'not-allowed',
      width: block ? '100%' : null,
    };
    const buttonStyle = {
      ...ommitted,
      pointerEvents: 'none',
    };
    const child = React.cloneElement(element, {
      style: buttonStyle,
      className: null,
    });
    return (
      <span style={spanStyle} className={className}>
        {child}
      </span>
    );
  }
  if (isFragment(element)) {
    return <span key={`text-${element}`}>{element}</span>;
  }
  return element;
}

const PopupContent: React.FC<{
  content: React.ReactNode;
  prefixCls: string;
  theme?: TooltipTheme;
  translate: { x: number; y: number };
  popupInnerStyle?: CSSProperties;
  arrowAdjustPosition?: any;
}> = (props) => {
  const { content, prefixCls, theme, translate: { x, y }, popupInnerStyle, arrowAdjustPosition } = props;

  const arrowCls = `${prefixCls}-popup-arrow`;
  const contentCls = `${prefixCls}-popup-inner`;
  const arrowStyle = x || y ? { marginLeft: arrowAdjustPosition?.left ? undefined : -x, marginTop: arrowAdjustPosition?.top ? undefined : -y } : undefined;
  return (
    <div>
      <div className={`${arrowCls} ${arrowCls}-${theme}`} style={{...arrowStyle, ...arrowAdjustPosition}} />
      <div className={`${contentCls} ${contentCls}-${theme}`} style={popupInnerStyle}>
        {toJS(content)}
      </div>
    </div>
  );
};

export default class Tooltip extends Component<TooltipProps, any> {
  static get contextType(): typeof ConfigContext {
    return ConfigContext;
  }

  static displayName = 'Tooltip';

  static defaultProps = {
    suffixCls: 'tooltip',
    placement: 'top',
    transitionName: 'zoom-big-fast',
    mouseEnterDelay: 100,
    mouseLeaveDelay: 100,
    arrowPointAtCenter: false,
    autoAdjustOverflow: true,
    defaultHidden: true,
    trigger: [Action.hover],
  };

  static show;

  static hide;

  context: ConfigContextValue;

  state = {
    translate: { x: 0, y: 0 },
    arrowAdjustPosition: undefined,
    autoCalculatedPlacement: undefined,
    isCalculatingPlacement: false,
  };

  get prefixCls(): string {
    const { suffixCls, prefixCls } = this.props;
    const { context } = this;
    return context.getProPrefixCls(suffixCls!, prefixCls);
  }

  get placements() {
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

  get tooltipAutoPlacement() {
    const { props: { autoPlacement } } = this;
    return autoPlacement || getConfig('tooltipAutoPlacement');
  }

  getContent(...props) {
    const { title, overlay } = this.props;
    if (typeof overlay === 'function') {
      return overlay(...props);
    }
    if (overlay) {
      return overlay;
    }
    if (typeof title === 'function') {
      return title(...props);
    }
    return title;
  }

  // 从 align.points 推导出当前 placement
  getPlacementFromAlign = (points: string[], arrowPointAtCenter?: boolean): string | null => {
    const placements = getPlacements({ arrowPointAtCenter });
    // 查找匹配的 placement
    for (const [placement, config] of Object.entries(placements)) {
      if ((config as any).points[0] === points[0] && (config as any).points[1] === points[1]) {
        return placement;
      }
    }
    return null;
  };

  // 获取位置的基本方向（用于兼容比较）
  getBasePlacement = (placement: string | null): string | null => {
    if (!placement) return null;
    // 提取基本方向：topLeft -> top, bottomRight -> bottom 等
    if (placement.startsWith('top')) return 'top';
    if (placement.startsWith('bottom')) return 'bottom';
    if (placement.startsWith('left')) return 'left';
    if (placement.startsWith('right')) return 'right';
    return placement;
  };

  // 检查两个 placement 是否兼容
  isPlacementCompatible = (bestPlacement: string, currentPlacement: string | null): boolean => {
    if (!currentPlacement) return false;
    // 如果完全相同，直接兼容
    if (bestPlacement === currentPlacement) return true;
    // 如果基本方向相同，认为兼容
    const bestBase = this.getBasePlacement(bestPlacement);
    const currentBase = this.getBasePlacement(currentPlacement);
    return bestBase === currentBase;
  };

  @autobind
  handlePopupAlign(source, align, target, translate) {
    const { translate: { x, y }, isCalculatingPlacement } = this.state;
    const { overflow: { adjustX, adjustY } } = align;
    const { arrowPointAtCenter } = this.props;
    // 如果正在计算中，直接返回避免死循环
    if (isCalculatingPlacement) {
      // 只处理 translate 相关的逻辑
      if (x !== translate.x || y !== translate.y) {
        this.setState({ translate });
      }
      return;
    }
    // 如果开启了自动最佳位置，重新计算最佳 placement
    if (this.tooltipAutoPlacement) {
      const targetRect = getElementRect(target);
      const popupRect = getElementRect(source);
      const viewportRect = getViewportRect();
      const bestPlacement = calculateBestPlacement(targetRect, popupRect, viewportRect);
      const currentPlacement = this.getPlacementFromAlign(align.points, arrowPointAtCenter);
      // 使用兼容性检查而不是严格相等比较
      if (!this.isPlacementCompatible(bestPlacement, currentPlacement)) {
        // 设置计算标志，避免无限循环
        this.setState({ 
          isCalculatingPlacement: true,
          autoCalculatedPlacement: bestPlacement,
        });
        // 重置计算标志
        setTimeout(() => {
          this.setState({ isCalculatingPlacement: false });
        }, 0);
      }
    }
    
    if (x !== translate.x || y !== translate.y) {
      this.setState({
        translate,
      });
    }
    if (adjustX || adjustY) {
      const { top: popupTop, left: popupLeft } = source.getBoundingClientRect();
      const { width, height, top: targetTop, left: targetLeft } = target.getBoundingClientRect();
      if (adjustX) {
        this.setState({ arrowAdjustPosition: { left: pxToRem(targetLeft - popupLeft + width / 2) } });
      }
      if (adjustY) {
        this.setState({ arrowAdjustPosition: { top: pxToRem(targetTop - popupTop + height / 2) } });
      }
    } else {
      this.setState({ arrowAdjustPosition: undefined })
    }
  }

  @autobind
  renderPopupContent(...props) {
    const { translate, arrowAdjustPosition } = this.state;
    const { getTooltipTheme } = this.context;
    const { theme = getTooltipTheme(), popupInnerStyle } = this.props;
    const content = this.getContent(...props);
    if (content) {
      return (
        <PopupContent
          content={content}
          theme={theme}
          prefixCls={this.prefixCls}
          translate={translate}
          popupInnerStyle={popupInnerStyle}
          arrowAdjustPosition={arrowAdjustPosition}
        />
      );
    }
  }

  render() {
    const {
      prefixCls,
      state: { autoCalculatedPlacement },
      props: { children, placement, onHiddenChange, onHiddenBeforeChange, trigger, defaultHidden, hidden, getRootDomNode, ...restProps },
    } = this;
    
    // 确定最终使用的 placement
    let finalPlacement = placement;
    if (this.tooltipAutoPlacement && autoCalculatedPlacement) {
      finalPlacement = autoCalculatedPlacement;
    } else if (this.tooltipAutoPlacement) {
      // 如果开启了自动定位但还没有计算结果，使用默认值
      finalPlacement = 'top';
    }
    // 修复特殊情况为0，以及 undefined 出现的报错情况
    const child = Children.count(children) ? Children.map(children, node => (
      !isNil(node) && (isValidElement(node) ? getDisabledCompatableChildren(node) : <span key={`text-${node}`}>{node}</span>)
    )) : null;
    const hasHiddenProp = 'hidden' in this.props;
    if (hasHiddenProp) {
      (restProps as TriggerProps).popupHidden = hidden!;
    }
    delete restProps.theme;
    // if (isMobile()) {
    //   return child;
    // }
    return !isNil(child) || (getRootDomNode && hasHiddenProp) ? (
      <Trigger
        prefixCls={prefixCls}
        action={trigger}
        builtinPlacements={this.placements}
        popupPlacement={finalPlacement}
        popupContent={this.renderPopupContent}
        onPopupHiddenBeforeChange={onHiddenBeforeChange}
        onPopupHiddenChange={onHiddenChange}
        onPopupAlign={this.handlePopupAlign}
        defaultPopupHidden={defaultHidden}
        getRootDomNode={getRootDomNode}
        {...restProps}
      >
        {child}
      </Trigger>
    ) : child;
  }
}
