import React, { Children, Component, isValidElement } from 'react';
import PropTypes from 'prop-types';
import { getProPrefixCls } from 'choerodon-ui/lib/configure';
import noop from 'lodash/noop';
import isNil from 'lodash/isNil';
import Trigger, { TriggerProps } from '../trigger/Trigger';
import { Action } from '../trigger/enum';
import getPlacements, { AdjustOverflow } from './placements';
import autobind from '../_util/autobind';

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

export type RenderFunction = () => React.ReactNode;

export interface TooltipProps {
  prefixCls?: string;
  suffixCls?: string;
  overlayClassName?: string;
  style?: React.CSSProperties;
  overlayStyle?: React.CSSProperties;
  placement?: TooltipPlacement;
  builtinPlacements?: Object;
  hidden?: boolean;
  defaultHidden?: boolean;
  onHiddenChange?: (hidden: boolean) => void;
  mouseEnterDelay?: number;
  mouseLeaveDelay?: number;
  transitionName?: string;
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
function getDisabledCompatobleChildren(element: React.ReactElement<any>) {
  const elementType = element.type as any;
  if ((
    elementType.__PRO_BUTTON ||
    elementType.__PRO_SWITCH ||
    elementType.__PRO_CHECKBOX ||
    elementType.__PRO_RADIO ||
    elementType.__C7N_BUTTON ||
    elementType === 'button'
  ) && element.props.disabled) {
    const { picked, ommitted } = splitObject(element.props.style, [
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
      width: element.props.block ? '100%' : null,
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
      <span style={spanStyle} className={element.props.classNames}>
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
    placement: 'bottom',
    transitionName: 'zoom-big-fast',
    mouseEnterDelay: 100,
    mouseLeaveDelay: 100,
    arrowPointAtCenter: false,
    autoAdjustOverflow: true,
    theme: 'dark',
    defaultHidden: true,
    trigger: [Action.hover],
  };

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

  getContent() {
    const { title, overlay } = this.props;
    if (typeof overlay === 'function') {
      return overlay();
    }
    if (overlay) {
      return overlay;
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

  render() {
    const { translate } = this.state;
    const {
      prefixCls,
      props: { children, placement, theme, onHiddenChange, trigger, defaultHidden, hidden, ...restProps },
    } = this;
    // 修复特殊情况为0，以及 undefined 出现的报错情况
    const child = Children.count(children) ? Children.map(children, node => (
      !isNil(node) && getDisabledCompatobleChildren(
        isValidElement(node) ? node : <span key={`text-${node}`}>{node}</span>,
      )
    )) : null;

    const extraProps: TriggerProps = { ...restProps };
    if ('hidden' in this.props) {
      extraProps.popupHidden = hidden;
    }
    const content = this.getContent();
    return !isNil(child) ? (
      <Trigger
        prefixCls={prefixCls}
        action={trigger}
        builtinPlacements={this.placements}
        popupPlacement={placement}
        popupContent={
          content && (
            <PopupContent
              content={content}
              theme={theme}
              prefixCls={prefixCls}
              translate={translate}
            />
          )
        }
        onPopupHiddenChange={onHiddenChange}
        onPopupAlign={this.handlePopupAlign}
        defaultPopupHidden={defaultHidden}
        onMouseDown={noop}
        {...extraProps}
      >
        {child}
      </Trigger>
    ) : child;
  }
}
