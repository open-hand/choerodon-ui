import React, { Children, Component, isValidElement } from 'react';
import PropTypes from 'prop-types';
import isNil from 'lodash/isNil';
import { getConfig, getProPrefixCls } from 'choerodon-ui/lib/configure';
import { TooltipPlacement, TooltipTheme } from 'choerodon-ui/lib/tooltip';
import Trigger, { RenderFunction, TriggerProps } from '../trigger/Trigger';
import { Action } from '../trigger/enum';
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
  translate: { x: number, y: number }
}> = (props) => {
  const { content, prefixCls, theme, translate: { x, y } } = props;

  const arrowCls = `${prefixCls}-popup-arrow`;
  const contentCls = `${prefixCls}-popup-inner`;
  const arrowStyle = x || y ? { marginLeft: -x, marginTop: -y } : undefined;
  return (
    <div>
      <div className={`${arrowCls} ${arrowCls}-${theme}`} style={arrowStyle} />
      <div className={`${contentCls} ${contentCls}-${theme}`}>
        {content}
      </div>
    </div>
  );
};

export default class Tooltip extends Component<TooltipProps, any> {
  static displayName = 'Tooltip';

  static propTypes = {
    title: PropTypes.any,
    arrowPointAtCenter: PropTypes.bool,
    autoAdjustOverflow: PropTypes.bool,
    defaultHidden: PropTypes.bool,
    mouseEnterDelay: PropTypes.number,
    mouseLeaveDelay: PropTypes.number,
    placement: PropTypes.oneOf([
      'top',
      'topLeft',
      'topRight',
      'bottom',
      'bottomLeft',
      'bottomRight',
      'left',
      'leftTop',
      'leftBottom',
      'right',
      'rightTop',
      'rightBottom',
    ]),
    trigger: PropTypes.arrayOf(
      PropTypes.oneOf([Action.click, Action.hover, Action.contextMenu, Action.focus]),
    ),
    hidden: PropTypes.bool,
    onHiddenChange: PropTypes.func,
    suffixCls: PropTypes.string,
    transitionName: PropTypes.string,
    theme: PropTypes.oneOf(['light', 'dark']),
  };

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

  state = {
    translate: { x: 0, y: 0 },
  };

  get prefixCls(): string {
    const { suffixCls, prefixCls } = this.props;
    return getProPrefixCls(suffixCls!, prefixCls);
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
  handlePopupAlign(_source, _align, _target, translate) {
    const { translate: { x, y } } = this.state;
    if (x !== translate.x || y !== translate.y) {
      this.setState({
        translate,
      });
    }
  }

  @autobind
  renderPopupContent(...props) {
    const { translate } = this.state;
    const { theme = getConfig('tooltipTheme') } = this.props;
    const content = this.getContent(...props);
    if (content) {
      return (
        <PopupContent
          content={content}
          theme={theme}
          prefixCls={this.prefixCls}
          translate={translate}
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
