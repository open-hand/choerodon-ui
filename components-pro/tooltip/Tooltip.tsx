import React, { Children, Component, isValidElement } from 'react';
import PropTypes from 'prop-types';
import { getProPrefixCls } from 'choerodon-ui/lib/configure';
import Button from 'choerodon-ui/lib/button';
import Trigger, { TriggerProps } from '../trigger/Trigger';
import { Action } from '../trigger/enum';
import getPlacements, { AdjustOverflow } from './placements';

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

const splitObject = (obj:any,keys:string[]) => {
  const picked:any = {};
  const ommitted:any = {...obj};
  keys.forEach(key => {
    if(obj && key in obj){
      picked[key] = obj[key];
      delete ommitted[key];
    }
  });
  return { picked, ommitted };
}

  /**
   * Fix the tooltip won't hide when child element is button 
   * @param element ReactElement
   */
  function getDisabledCompatobleChildren(element:React.ReactElement<any>){
    const elementType = element.type as any
    if(
        ( elementType.__Pro_BUTTON === true ||
          elementType.__Pro_SWITCH === true ||
          elementType.__Pro_CHECKBOX === true || 
          (element.type as typeof Button).__ANT_BUTTON || 
          element.type === 'button') &&
          element.props.disabled 
        ){
          const {picked, ommitted} = splitObject(element.props.style,[
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
            display:'inline-block',
            ...picked,
            cursor:'not-allowed',
            width:element.props.block ? '100%':null,
          };
          const buttonStyle = {
            ...ommitted,
            pointerEvents:'none',
          };
          const child = React.cloneElement(element,{
            style:buttonStyle,
            className:null,
          });
          return (
            <span style={spanStyle} className={element.props.classNames}>
              {child}
            </span>
          )
        }
        return element
   }

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

  get prefixCls(): string {
    const { suffixCls, prefixCls } = this.props;
    return getProPrefixCls(suffixCls!, prefixCls);
  }

  get popupContent() {
    const { title } = this.props;
    if (!title) {
      return null;
    }
    const {
      prefixCls,
      props: { overlay, theme },
    } = this;

    let content: any = '';
    if (typeof overlay === 'function') {
      content = overlay();
    } else if (overlay) {
      content = overlay;
    } else {
      content = title || '';
    }

    const arrowCls = `${prefixCls}-popup-arrow`;
    const contentCls = `${prefixCls}-popup-inner`;

    return (
      <div>
        <div className={`${arrowCls} ${arrowCls}-${theme}`} key="arrow" />
        <div className={`${contentCls} ${contentCls}-${theme}`} key="content">
          {content}
        </div>
      </div>
    );
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


  render() {
    const {
      prefixCls,
      popupContent,
      props: { children, placement, onHiddenChange, trigger, defaultHidden, hidden, ...restProps },
    } = this;
    const child = Children.map(children, node => {
      node = getDisabledCompatobleChildren(
        isValidElement(node) ? node : <span key={`text-${node}`}>{node}</span>,
      )
      return node;
    });

    const extraProps: TriggerProps = { ...restProps };
    if ('hidden' in this.props) {
      extraProps.popupHidden = hidden;
    }

    return (
      <Trigger
        prefixCls={prefixCls}
        action={trigger}
        builtinPlacements={this.placements}
        popupPlacement={placement}
        popupContent={popupContent}
        onPopupHiddenChange={onHiddenChange}
        defaultPopupHidden={defaultHidden}
        {...extraProps}
      >
        {child}
      </Trigger>
    );
  }
}
