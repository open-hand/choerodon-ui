import React, { Children, Component, CSSProperties, isValidElement } from 'react';
import isNil from 'lodash/isNil';
import { toJS } from 'mobx';
import ConfigContext, { ConfigContextValue } from 'choerodon-ui/lib/config-provider/ConfigContext';
import { TooltipPlacement, TooltipTheme } from 'choerodon-ui/lib/tooltip';
import Trigger, { RenderFunction, TriggerProps } from 'choerodon-ui/lib/trigger/Trigger';
import { Action } from 'choerodon-ui/lib/trigger/enum';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import getPlacements, { AdjustOverflow } from './placements';
import autobind from '../_util/autobind';

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

  @autobind
  handlePopupAlign(source, align, target, translate) {
    const { translate: { x, y } } = this.state;
    const { overflow: { adjustX, adjustY } } = align;
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
      props: { children, placement, onHiddenChange, onHiddenBeforeChange, trigger, defaultHidden, hidden, getRootDomNode, ...restProps },
    } = this;
    // 修复特殊情况为0，以及 undefined 出现的报错情况
    const child = Children.count(children) ? Children.map(children, node => (
      !isNil(node) && (isValidElement(node) ? getDisabledCompatableChildren(node) : <span key={`text-${node}`}>{node}</span>)
    )) : null;
    const hasHiddenProp = 'hidden' in this.props;
    if (hasHiddenProp) {
      (restProps as TriggerProps).popupHidden = hidden!;
    }
    delete restProps.theme;
    return !isNil(child) || (getRootDomNode && hasHiddenProp) ? (
      <Trigger
        prefixCls={prefixCls}
        action={trigger}
        builtinPlacements={this.placements}
        popupPlacement={placement}
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
