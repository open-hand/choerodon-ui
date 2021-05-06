import React, { cloneElement, CSSProperties, isValidElement, PureComponent, ReactNode } from 'react';
import PropTypes from 'prop-types';
import { getProPrefixCls } from 'choerodon-ui/lib/configure';
import Trigger, { RenderFunction } from '../trigger/Trigger';
import { Action } from '../trigger/enum';
import { Placements } from './enum';
import builtinPlacements from './placements';
import autobind from '../_util/autobind';

const popupStyle: CSSProperties = { whiteSpace: 'nowrap' };

export interface DropDownProps {
  trigger?: Action[];
  overlay: ReactNode | RenderFunction;
  onHiddenChange?: (hidden?: boolean) => void;
  onVisibleChange?: (visible?: boolean) => void;
  onOverlayClick?: (e) => void;
  hidden?: boolean;
  visible?: boolean;
  defaultHidden?: boolean;
  defaultVisible?: boolean;
  disabled?: boolean;
  align?: Object;
  getPopupContainer?: (triggerNode: Element) => HTMLElement;
  suffixCls?: string;
  prefixCls?: string;
  className?: string;
  transitionName?: string;
  placement?: Placements;
  forceRender?: boolean;
  popupClassName?: string;
}

export interface DropdownState {
  hidden?: boolean;
}

export default class Dropdown extends PureComponent<DropDownProps> {
  static displayName = 'Dropdown';

  static propTypes = {
    trigger: PropTypes.arrayOf(
      PropTypes.oneOf([Action.focus, Action.hover, Action.click, Action.contextMenu]),
    ),
    overlay: PropTypes.any,
    placement: PropTypes.oneOf([
      Placements.bottomLeft,
      Placements.bottomCenter,
      Placements.bottomRight,
      Placements.topLeft,
      Placements.topCenter,
      Placements.topRight,
    ]),
    hidden: PropTypes.bool,
    visible: PropTypes.bool,
    onHiddenChange: PropTypes.func,
    onVisibleChange: PropTypes.func,
    onOverlayClick: PropTypes.func,
    suffixCls: PropTypes.string,
    prefixCls: PropTypes.string,
    defaultHidden: PropTypes.bool,
    defaultVisible: PropTypes.bool,
    popupClassName: PropTypes.string,
  };

  static defaultProps = {
    suffixCls: 'dropdown',
    placement: Placements.bottomLeft,
    trigger: [Action.hover, Action.focus],
    defaultHidden: true,
  };

  renderedContentProps?: any;

  get triggerAction(): Action[] {
    const { trigger } = this.props;
    return trigger as Action[];
  }

  get transitionName() {
    const { placement } = this.props;
    let result = 'slide-up';
    if (placement && placement.startsWith('top')) {
      result = 'slide-down';
    }
    return result;
  }

  get prefixCls(): string {
    const { suffixCls, prefixCls } = this.props;
    return getProPrefixCls(suffixCls!, prefixCls);
  }

  state: DropdownState;

  constructor(props) {
    super(props);
    if ('hidden' in props) {
      this.state = {
        hidden: props.hidden,
      };
    } else if ('visible' in props) {
      this.state = {
        hidden: !props.visible,
      };
    } else if ('defaultHidden' in props) {
      this.state = {
        hidden: props.defaultHidden,
      };
    } else {
      this.state = {
        hidden: !props.defaultVisible,
      };
    }
  }

  /**
   * 调用传入的onHiddenChange方法
   *
   * @param {boolean} hidden
   */
  @autobind
  handlePopupHiddenChange(hidden: boolean) {
    const {
      onHiddenChange,
      onVisibleChange,
      hidden: propsHidden,
      visible: propsVisible,
    } = this.props;
    if (propsHidden === undefined && propsVisible === undefined) {
      this.setState({
        hidden,
      });
    }
    if (onHiddenChange) {
      onHiddenChange(hidden);
    }
    if (onVisibleChange) {
      onVisibleChange(!hidden);
    }
  }

  @autobind
  handleClick(e) {
    const { onOverlayClick, hidden, visible } = this.props;
    const { onClick } = this.renderedContentProps || {};
    if (onOverlayClick) {
      onOverlayClick(e);
    }
    if (onClick) {
      onClick(e);
    }
    if (hidden === undefined && visible === undefined) {
      this.setState({
        hidden: true,
      });
    }
  }

  getContent(...props) {
    const { overlay } = this.props;
    if (typeof overlay === 'function') {
      return overlay(...props);
    }
    return overlay;
  }

  @autobind
  renderPopupContent(...props) {
    const content = this.getContent(...props);
    if (isValidElement<any>(content)) {
      this.renderedContentProps = content.props;
      return cloneElement<any>(content, {
        onClick: this.handleClick,
      });
    }
  }

  componentWillReceiveProps({ hidden, visible }: DropDownProps) {
    if (hidden !== undefined) {
      this.setState({
        hidden,
      });
    } else if (visible !== undefined) {
      this.setState({
        hidden: !visible,
      });
    }
  }

  render() {
    const {
      prefixCls,
      state: { hidden },
      props: { children, placement, popupClassName, getPopupContainer },
    } = this;

    return (
      <Trigger
        prefixCls={prefixCls}
        action={this.triggerAction}
        builtinPlacements={builtinPlacements}
        popupPlacement={placement}
        popupContent={this.renderPopupContent}
        popupStyle={popupStyle}
        popupClassName={popupClassName}
        onPopupHiddenChange={this.handlePopupHiddenChange}
        popupHidden={hidden}
        getPopupContainer={getPopupContainer}
      >
        {children}
      </Trigger>
    );
  }
}
