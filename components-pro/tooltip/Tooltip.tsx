import React, { Children, Component, isValidElement } from 'react';
import PropTypes from 'prop-types';
import { getProPrefixCls } from 'choerodon-ui/lib/configure';
import Trigger from '../trigger/Trigger';
import { Action } from '../trigger/enum';
import getPlacements, { AdjustOverflow } from './placements';

export type TooltipPlacement =
  'top' | 'left' | 'right' | 'bottom' |
  'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' |
  'leftTop' | 'leftBottom' | 'rightTop' | 'rightBottom';

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
    trigger: PropTypes.arrayOf(PropTypes.oneOf([
      Action.click,
      Action.hover,
      Action.contextMenu,
      Action.focus,
    ])),
    hidden: PropTypes.bool,
    onHiddenChange: PropTypes.func,
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
    hidden: true,
  };

  get prefixCls(): string {
    const { suffixCls, prefixCls } = this.props;
    return getProPrefixCls(suffixCls!, prefixCls);
  }

  componentDidMount() {
    const { hidden, defaultHidden } = this.props;

    let initialHidden = defaultHidden;
    if (hidden !== undefined) {
      initialHidden = hidden;
    }
    if (initialHidden !== this.state.hidden) {
      this.setState({
        hidden: initialHidden,
      });
    }
  }

  componentWillReceiveProps(nextProps: TooltipProps) {
    const { hidden } = nextProps;
    if (hidden !== undefined) {
      this.setState({
        hidden,
      });
    }
  }

  handlePopupHiddenChange = (hidden: boolean) => {
    const { onHiddenChange } = this.props;

    this.setState({
      hidden: hidden,
    });

    if (onHiddenChange) {
      onHiddenChange(hidden);
    }
  };

  get popupContent() {
    const { title } = this.props;
    if (!title) {
      return null;
    }
    const { prefixCls, props: { overlay, theme } } = this;

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
    return builtinPlacements || getPlacements({
      arrowPointAtCenter,
      verticalArrowShift: 8,
      autoAdjustOverflow,
    });
  }

  /**
   * FIXME: Tooltip首次渲染错位
   * placement === 'bottom* / right*'时没有错位，其他情况有
   *
   * @returns
   * @memberof Tooltip
   */
  render() {
    const {
      prefixCls,
      popupContent,
      props: {
        children,
        placement,
        mouseEnterDelay,
        mouseLeaveDelay,
        transitionName,
        trigger,
      },
      state: {
        hidden,
      },
    } = this;
    const child = Children.map(children, (node, index) => {
      if (node && !isValidElement(node)) {
        return <span key={`text-${index}`}>{node}</span>;
      }
      return node;
    });

    return (
      <Trigger
        prefixCls={prefixCls}
        popupStyle={{ backgroundColor: 'transparent' }}
        action={trigger}
        builtinPlacements={this.placements}
        popupPlacement={placement}
        popupContent={popupContent}
        onPopupHiddenChange={this.handlePopupHiddenChange}
        mouseEnterDelay={mouseEnterDelay}
        mouseLeaveDelay={mouseLeaveDelay}
        popupHidden={hidden || !popupContent}
        transitionName={transitionName}
      >
        {child}
      </Trigger>
    );
  }
}
